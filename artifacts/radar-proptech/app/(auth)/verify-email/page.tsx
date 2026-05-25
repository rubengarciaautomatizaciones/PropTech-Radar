export default function VerifyEmailPage() {
  return (
    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
      <div className="mb-6 text-4xl">📧</div>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Verifica tu email</h1>
      <p className="text-gray-600 mb-6">
        Hemos enviado un enlace de confirmación a tu correo. Por favor, haz clic en él para activar tu cuenta y continuar con la configuración de tu agencia.
      </p>
      <div className="text-sm text-gray-500">
        ¿No has recibido nada? Revisa tu carpeta de spam.
      </div>
    </div>
  );
}