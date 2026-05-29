import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ConfigWizard from "./ConfigWizard"; // El componente cliente de Onboarding
import ManageRadars from "./ManageRadars"; // El componente cliente para añadir más radares

export default async function ConfigRouter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  // Comprobamos si el usuario ya tiene agencia vinculada
  const { data: userData } = await supabase
    .from("usuarios")
    .select("id_agencia")
    .eq("id_usuario", user.id)
    .single();

  const hasAgency = !!userData?.id_agencia;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      {!hasAgency ? (
        <ConfigWizard />
      ) : (
        <ManageRadars />
      )}
    </div>
  );
}