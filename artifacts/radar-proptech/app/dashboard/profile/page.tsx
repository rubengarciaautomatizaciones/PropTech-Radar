// artifacts/radar-proptech/app/dashboard/profile/page.tsx
"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateAgencyProfile, updateUserCredentials } from "./actions";
import { Building2, UserCircle, UploadCloud, Save, Info } from "lucide-react";

export default function ProfilePage() {
  const [isPendingAgency, startTransitionAgency] = useTransition();
  const [isPendingCreds, startTransitionCreds] = useTransition();

  const [agencyMsg, setAgencyMsg] = useState<{ text: string, type: "error" | "success" } | null>(null);
  const [credsMsg, setCredsMsg] = useState<{ text: string, type: "error" | "success" } | null>(null);

  const [agencyData, setAgencyData] = useState({ name: "", logoUrl: "" });
  const [userEmail, setUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email || "");

      const { data: userData } = await supabase.from("usuarios").select("id_agencia, rol").eq("id_usuario", user.id).single();
      if (userData) {
        setIsAdmin(userData.rol === "admin" || userData.rol === "dios");

        if (userData.id_agencia) {
          const { data: agencia } = await supabase.from("agencias").select("nombre_empresa, logo_url").eq("id_agencia", userData.id_agencia).single();
          if (agencia) {
            setAgencyData({ name: agencia.nombre_empresa, logoUrl: agencia.logo_url || "" });
          }
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [supabase]);

  const handleAgencySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAgencyMsg(null);
    const formData = new FormData(e.currentTarget);

    startTransitionAgency(async () => {
      const result = await updateAgencyProfile(formData);
      if (result?.error) setAgencyMsg({ text: result.error, type: "error" });
      else if (result?.success) setAgencyMsg({ text: result.success, type: "success" });
    });
  };

  const handleCredsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCredsMsg(null);
    const formData = new FormData(e.currentTarget);

    startTransitionCreds(async () => {
      const result = await updateUserCredentials(formData);
      if (result?.error) setCredsMsg({ text: result.error, type: "error" });
      else if (result?.success) {
        setCredsMsg({ text: result.success, type: "success" });
        (e.target as HTMLFormElement).reset(); // Limpiar el campo de contraseña
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewLogo(objectUrl);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando perfil...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Perfil y Configuración</h1>
        <p className="text-gray-500 mt-1">Gestiona los detalles de tu agencia y tus credenciales de acceso.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">

        {/* COLUMNA 1: DATOS DE LA AGENCIA */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 text-slate-900">
            <Building2 className="w-5 h-5 text-kavox-accent" />
            <h2 className="text-lg font-bold">Datos de la Agencia</h2>
          </div>

          {!isAdmin && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p>Tu rol de agente no te permite editar la información de la agencia. Contacta con tu administrador.</p>
            </div>
          )}

          {agencyMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${agencyMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
              {agencyMsg.text}
            </div>
          )}

          <form onSubmit={handleAgencySubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logotipo Corporativo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                  {previewLogo || agencyData.logoUrl ? (
                    <img src={previewLogo || agencyData.logoUrl} alt="Logo Agencia" className="w-full h-full object-contain bg-white" />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                {isAdmin && (
                  <div>
                    <input type="file" name="logoFile" id="logoFile" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors">
                      <UploadCloud className="w-4 h-4" /> Subir nuevo logo
                    </button>
                    <p className="text-xs text-gray-500 mt-2">PNG o JPG. Máx 2MB. Relación 1:1 recomendada.</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
              <input 
                name="agencyName"
                defaultValue={agencyData.name}
                disabled={!isAdmin}
                required
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-kavox-accent disabled:bg-gray-50 disabled:text-gray-500" 
              />
            </div>

            {isAdmin && (
              <button 
                type="submit"
                disabled={isPendingAgency}
                className="w-full bg-slate-900 text-white p-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60 flex justify-center items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isPendingAgency ? "Guardando..." : "Guardar Cambios"}
              </button>
            )}
          </form>
        </div>

        {/* COLUMNA 2: CREDENCIALES DE ACCESO */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 text-slate-900">
            <UserCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold">Mis Credenciales</h2>
          </div>

          {credsMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${credsMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
              {credsMsg.text}
            </div>
          )}

          <form onSubmit={handleCredsSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input 
                type="email"
                name="email"
                defaultValue={userEmail}
                required
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
              />
              <p className="text-xs text-gray-500 mt-1">Si lo cambias, deberás confirmarlo desde un enlace en tu correo antiguo y el nuevo.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <input 
                type="password"
                name="password"
                placeholder="Deja en blanco para no cambiarla"
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
              />
            </div>

            <button 
              type="submit"
              disabled={isPendingCreds}
              className="w-full bg-slate-900 text-white p-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60 flex justify-center items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isPendingCreds ? "Actualizando..." : "Actualizar Cuenta"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}