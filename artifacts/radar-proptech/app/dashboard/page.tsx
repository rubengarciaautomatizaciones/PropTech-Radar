// artifacts/radar-proptech/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; // Usamos cliente porque es un "use client"
import { redirect, useRouter } from "next/navigation";
import { Send, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Definimos los tipos que necesitamos
type UserData = {
  id_agencia: string | null;
  rol: string;
  telegram_chat_id: string | null;
};

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      setUserId(user.id);

      const { data } = await supabase
        .from("usuarios")
        .select("id_agencia, rol, telegram_chat_id")
        .eq("id_usuario", user.id)
        .single();

      if (data) {
        if (!data.id_agencia && data.rol !== 'admin') {
          router.push("/dashboard/config");
        } else {
          setUserData(data as UserData);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [router, supabase]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Cargando tu radar...</div>;
  }

  const telegramBotUsername = "RadarPropTech_bot"; 
  const telegramLink = `https://t.me/${telegramBotUsername}?start=${userId}`;

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
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <button className="bg-[#0088cc] hover:bg-[#0077b3] text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
                  <Smartphone className="w-4 h-4" />
                  Conectar Móvil
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl">Conecta tu Telegram</DialogTitle>
                  <DialogDescription className="text-center text-base pt-2">
                    Sigue estos pasos para recibir alertas instantáneas en tu móvil.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-6 py-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <QRCodeSVG 
                      value={telegramLink} 
                      size={200}
                      level={"H"}
                      includeMargin={true}
                    />
                  </div>

                  <div className="space-y-3 w-full px-4">
                    <p className="text-sm font-medium flex gap-2 items-center"><span className="bg-[#0088cc] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span> Abre la cámara de tu móvil o lector QR.</p>
                    <p className="text-sm font-medium flex gap-2 items-center"><span className="bg-[#0088cc] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span> Escanea el código que ves arriba.</p>
                    <p className="text-sm font-medium flex gap-2 items-center"><span className="bg-[#0088cc] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span> Pulsa el botón <b>"INICIAR"</b> en Telegram.</p>
                  </div>

                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full mt-4 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Ya lo he escaneado e iniciado
                  </button>
                </div>
              </DialogContent>
            </Dialog>
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