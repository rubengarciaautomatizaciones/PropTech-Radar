"use client";

import { useState, useTransition } from "react";
import { addAgent, removeAgent } from "./actions";
import { UserPlus, UserCircle, Trash2, KeyRound } from "lucide-react";

type Member = {
  id_usuario: string;
  rol: string;
};

export default function TeamManager({ teamMembers, currentUserId }: { teamMembers: Member[], currentUserId: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string, type: "error" | "success" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddAgent = () => {
    setMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await addAgent(formData);
      if (result?.error) setMessage({ text: result.error, type: "error" });
      else if (result?.success) {
        setMessage({ text: result.success, type: "success" });
        setEmail("");
        setPassword("");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Seguro que quieres revocar el acceso a este agente? Ya no podrá entrar al sistema.")) return;

    startTransition(async () => {
      const result = await removeAgent(id);
      if (result?.error) setMessage({ text: result.error, type: "error" });
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">

      {/* COLUMNA 1: FORMULARIO */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
        <div className="flex items-center gap-2 mb-6 text-slate-900">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold">Crear Cuenta de Agente</h2>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email del Agente</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
              placeholder="comercial@tuagencia.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña de acceso</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input 
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 pl-9 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" 
                placeholder="Mínimo 6 caracteres" 
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Crea estas credenciales y pásaselas a tu agente. Podrá entrar instantáneamente.</p>
          </div>

          <button 
            onClick={handleAddAgent}
            disabled={isPending || !email || password.length < 6}
            className="w-full bg-slate-900 text-white p-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60 mt-2"
          >
            {isPending ? "Creando cuenta..." : "Dar de Alta"}
          </button>
        </div>
      </div>

      {/* COLUMNA 2: LISTA DE EQUIPO */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Miembros Activos</h2>

        <ul className="space-y-3">
          {teamMembers.map((member) => (
            <li key={member.id_usuario} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${member.rol === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                  <UserCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">
                    {member.id_usuario === currentUserId ? "Tú" : "Agente Comercial"}
                  </p>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{member.rol}</p>
                </div>
              </div>

              {member.id_usuario !== currentUserId && member.rol !== 'admin' && (
                <button 
                  onClick={() => handleDelete(member.id_usuario)}
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

    </div>
  );
}