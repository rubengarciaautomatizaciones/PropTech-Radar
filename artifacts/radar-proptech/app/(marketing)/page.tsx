'use client';

import { useState, useEffect } from 'react';
// Cambiamos la importación para hacerlo directamente aquí
import { createBrowserClient } from '@supabase/ssr'; 
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [empresa, setEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // INYECTAMOS LAS CLAVES A FUEGO DIRECTAMENTE EN LA PÁGINA
  const supabaseUrl = 'https://yokwjkiwfqwrmmivvpym.supabase.co'; 
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlva3dqa2l3ZnF3cm1taXZ2cHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MzA5MjMsImV4cCI6MjA5NTIwNjkyM30.M-Ks2udPwFa_z9lv5X5_bzevpeL0txRHFKN0yo5iKtI';

  const supabase = createBrowserClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log("1. Iniciando registro para:", email);
    console.log("URL usada:", supabaseUrl); // Chivato definitivo

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("❌ Error Auth:", authError);
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      console.log("2. Usuario creado en Auth con ID:", authData.user.id);

      const { data: agenciaData, error: agenciaError } = await supabase
        .from('agencias')
        .insert([{ nombre_empresa: empresa }])
        .select()
        .single();

      if (agenciaError) {
        console.error("❌ Error al crear Agencia:", agenciaError);
        setError('Error al registrar la empresa. Revisa la consola (F12).');
        setLoading(false);
        return;
      }

      console.log("3. Agencia creada con ID:", agenciaData.id_agencia);

      const { error: usuarioError } = await supabase
        .from('usuarios')
        .insert([{ 
          id_usuario: authData.user.id, 
          id_agencia: agenciaData.id_agencia,
          rol: 'admin' 
        }]);

      if (usuarioError) {
        console.error("❌ Error al vincular Usuario/Agencia:", usuarioError);
        setError('Error al vincular el usuario. Revisa la consola (F12).');
        setLoading(false);
        return;
      }

      console.log("✅ Registro 100% completado");
      alert('¡Registro exitoso! Ya eres usuario de Radar PropTech.');
    }

    setLoading(false);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Radar PropTech
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Crea tu cuenta y empieza tus 3 días gratis
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de la Inmobiliaria</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="Ej. Spidia Inmobiliaria"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="tu@inmobiliaria.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Procesando...' : 'Continuar al pago'}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}