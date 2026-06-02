// artifacts/radar-proptech/app/dashboard/team/TeamManager.tsx
"use client";

import { useState, useTransition } from "react";
import { addAgent, removeAgent, resetAgentPassword } from "./actions";
import { UserPlus, UserCircle, Trash2, KeyRound, Copy, CheckCircle2, ShieldAlert, X } from "lucide-react";

type Member = {
  id_usuario: string;
  rol: string;
  nombre: string | null;
};

export default function TeamManager({ teamMembers, currentUserId }: { teamMembers: Member[], currentUserId: string }) {
  // Formulario Creación
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string, type: "error" | "success" } | null>(null);

  // Modales
  const [newAgentEmail, setNewAgentEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resetModal, setResetModal] = useState<{ id: string, nombre: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [isPending, startTransition] = useTransition();

  // AÑADIR AGENTE
  const handleAddAgent = () => {
    setMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      const result = await addAgent(formData);
      if (result?.error) setMessage({ text: result.error, type: "error" });
      else if (result?.success) {
        setName("");
        setEmail("");
        setPassword("");
        // Mostramos el popup del enlace
        if (result.createdEmail) setNewAgentEmail(result.createdEmail);
      }
    });
  };

  // ELIMINAR AGENTE
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se abra el modal de contraseña
    if (!confirm("¿Seguro que quieres revocar el acceso a este agente? Ya no podrá entrar al sistema.")) return;

    startTransition(async () => {
      const result = await removeAgent(id);
      if (result?.error) alert(result.error);
    });
  };

  // CAMBIAR CONTRASEÑA
  const handleResetPassword = () => {
    if (!resetModal) return;
    startTransition(async () => {
      const result = await resetAgentPassword(resetModal.id, newPassword);
      if (result?.error) alert(result.error);
      else {
        alert("Contraseña cambiada con éxito.");
        setResetModal(null);
        setNewPassword("");
      }
    });
  };

  // COPIAR ENLACE WHATSAPP
  const copyLoginLink = () => {
    const link = `${window.location.origin}/login?email=${encodeURIComponent(newAgentEmail!)}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 relative">

      {/* COLUMNA 1: FORMULARIO */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
        <div className="flex items-center gap-2 mb-6 text-slate-900">
          <UserPlus className="w-5 h-5 text-kavox-accent" />
          <h2 className="text-lg font-bold">Crear Cuenta de Agente</h2>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Agente</label>
            <input 
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-kavox-accent" 
              placeholder="Ej. Laura Gómez" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email del Agente</label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-kavox-accent" 
              placeholder="laura@tuagencia.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña de acceso</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input 
                type="text" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 pl-9 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-kavox-accent" 
                placeholder="Mínimo 6 caracteres" 
              />
            </div>
          </div>

          <button 
            onClick={handleAddAgent}
            disabled={isPending || !name || !email || password.length < 6}
            className="w-full bg-kavox-body text-white p-3 rounded-lg font-semibold hover:bg-black transition-colors disabled:opacity-60 mt-2"
          >
            {isPending ? "Creando cuenta..." : "Dar de Alta al Agente"}
          </button>
        </div>
      </div>

      {/* COLUMNA 2: LISTA DE EQUIPO */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Miembros Activos</h2>
        <p className="text-xs text-gray-500 mb-4">Haz clic en un agente para cambiarle la contraseña.</p>

        <ul className="space-y-3">
          {teamMembers.map((member) => (
            <li 
              key={member.id_usuario} 
              onClick={() => {
                // Solo abrimos el modal si NO es el Admin actual y NO es un admin
                if (member.id_usuario !== currentUserId && member.rol !== 'admin') {
                  setResetModal({ id: member.id_usuario, nombre: member.nombre || "Agente" });
                }
              }}
              className={`flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-slate-50 transition-colors ${member.id_usuario !== currentUserId && member.rol !== 'admin' ? 'cursor-pointer hover:bg-slate-100 hover:border-blue-200' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${member.rol === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-kavox-accent/10 text-kavox-accent'}`}>
                  <UserCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">
                    {member.id_usuario === currentUserId ? "Tú" : (member.nombre || "Agente Comercial")}
                  </p>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{member.rol}</p>
                </div>
              </div>

              {member.id_usuario !== currentUserId && member.rol !== 'admin' && (
                <button 
                  onClick={(e) => handleDelete(member.id_usuario, e)}
                  disabled={isPending}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors"
                  title="Eliminar acceso"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* POPUP 1: ENLACE COMPARTIR (CREACIÓN EXITOSA) */}
      {newAgentEmail && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center animate-in zoom-in-95">
            <CheckCircle2 className="w-16 h-16 text-kavox-success mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Agente Creado</h3>
            <p className="text-sm text-gray-500 mt-2 mb-6">
              Mándale este enlace a tu agente por WhatsApp. Su correo ya vendrá escrito para que solo tenga que poner la contraseña que le has creado.
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between gap-2 mb-6">
              <span className="text-xs text-slate-600 truncate">{`${window.location.origin}/login?email=${newAgentEmail}`}</span>
              <button 
                onClick={copyLoginLink}
                className="bg-white border border-gray-200 p-2 rounded text-slate-700 hover:bg-gray-50 shrink-0"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button 
              onClick={() => setNewAgentEmail(null)}
              className="w-full bg-kavox-body text-white py-3 rounded-lg font-semibold hover:bg-black transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* POPUP 2: CAMBIAR CONTRASEÑA */}
      {resetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative animate-in zoom-in-95">
            <button onClick={() => setResetModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5"/></button>
            <div className="flex items-center gap-3 mb-4 text-slate-900">
              <ShieldAlert className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-bold">Cambiar Contraseña</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Escribe una nueva contraseña para <strong>{resetModal.nombre}</strong>.</p>

            <input 
              type="text" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 mb-6" 
              placeholder="Nueva contraseña..." 
            />

            <button 
              onClick={handleResetPassword}
              disabled={isPending || newPassword.length < 6}
              className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60"
            >
              {isPending ? "Guardando..." : "Sobrescribir Contraseña"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}