// artifacts/radar-proptech/app/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Autenticación (se queda igual)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Verificamos el perfil del usuario (¡CON EL ROL!)
  const { data: userData } = await supabase
    .from("usuarios")
    .select("id_agencia, rol") // <-- Ahora también pedimos el ROL
    .eq("id_usuario", user.id)
    .single();

  // --- LÓGICA DE "MODO DIOS" ---
  // Si el usuario no tiene agencia Y NO es un admin, lo mandamos al wizard.
  if (!userData?.id_agencia && userData?.rol !== 'admin') {
    redirect("/dashboard/config"); 
  }

  // 3. Simulación de datos (se queda igual)
  const stats = { totalLeads: 14, nuevosHoy: 3, alertasActivas: 1 };

  return (
    <div className="space-y-8">
      {/* ... el resto de tu JSX se queda exactamente igual ... */}
       <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel Principal</h1>
          <p className="text-gray-500 text-sm mt-1">Bienvenido a tu radar de captación.</p>
        </div>
        {userData?.rol === 'admin' && (
            <div className="text-xs font-bold uppercase text-yellow-500 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full">
              MODO DIOS
            </div>
        )}
      </div>
      {/* ... etc ... */}
    </div>
  );
}