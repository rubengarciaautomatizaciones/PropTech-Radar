// artifacts/radar-proptech/app/dashboard/config/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ConfigWizard from "./ConfigWizard"; 
import ManageRadars from "./ManageRadars"; 

export default async function ConfigRouter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const { data: userData } = await supabase
    .from("usuarios")
    .select("id_agencia")
    .eq("id_usuario", user.id)
    .single();

  const hasAgency = !!userData?.id_agencia;

  // ⚠️ CORRECCIÓN TYPESCRIPT: Le decimos explícitamente que es un array
  let radares: any[] = [];

  if (hasAgency) {
    const { data } = await supabase
      .from("configuracion_rastreo")
      .select("id, nombre_rastreo, url_idealista, historial_cambios_url") 
      .eq("id_agencia", userData.id_agencia)
      .order("created_at", { ascending: true });
    radares = data || [];
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      {!hasAgency ? (
        <ConfigWizard />
      ) : (
        <ManageRadars initialRadars={radares} />
      )}
    </div>
  );
}