// artifacts/radar-proptech/app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Send } from "lucide-react"; // Añadimos el icono de Telegram

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Pedimos también el telegram_chat_id a la base de datos
  const { data: userData } = await supabase
    .from("usuarios")
    .select("id_agencia, rol, telegram_chat_id")
    .eq("id_usuario", user.id)
    .single();

  if (!userData?.id_agencia && userData?.rol !== 'admin') {
    redirect("/dashboard/config"); 
  }

  // Generamos el enlace mágico para Telegram
  const telegramBotUsername = "RadarPropTech_bot"; // El nombre que elegiste
  const telegramLink = `https://t.me/${telegramBotUsername}?start=${user.id}`;

  return (
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de Telegram */}
        <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${userData?.telegram_chat_id ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Alertas en Tiempo Real</h3>
              <p className="text-sm text-gray-500">
                {userData?.telegram_chat_id 
                  ? "Tu cuenta está vinculada. Recibirás los leads en tu Telegram."
                  : "Vincula tu Telegram para recibir los pisos al segundo de publicarse."}
              </p>
            </div>
          </div>

          {!userData?.telegram_chat_id ? (
            <a 
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0088cc] hover:bg-[#0077b3] text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              Conectar Telegram
            </a>
          ) : (
            <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Conectado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}