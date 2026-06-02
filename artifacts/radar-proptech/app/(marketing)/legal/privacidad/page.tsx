// artifacts/radar-proptech/app/(marketing)/legal/privacidad/page.tsx
export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="font-heading text-4xl font-bold text-kavox-body mb-8">Política de Privacidad</h1>
      <div className="prose prose-slate text-kavox-muted space-y-6">
        <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}</p>
        <p>En KAVOX ("nosotros", "nuestro", "la plataforma"), respetamos su privacidad y estamos comprometidos a proteger los datos personales de nuestros clientes (agencias inmobiliarias).</p>
        <h2 className="text-xl font-bold text-kavox-body mt-8">1. Datos que recopilamos</h2>
        <p>Recopilamos el nombre de la empresa, nombre del administrador, correo electrónico profesional y datos de facturación procesados de forma segura a través de Stripe.</p>
        <h2 className="text-xl font-bold text-kavox-body mt-8">2. Uso de la información</h2>
        <p>Utilizamos sus datos exclusivamente para proveer el servicio de alertas PropTech, procesar pagos y mejorar la infraestructura técnica del sistema.</p>
        <h2 className="text-xl font-bold text-kavox-body mt-8">3. Terceros</h2>
        <p>No vendemos, alquilamos ni compartimos su información personal con terceros ajenos a la prestación del servicio (como Stripe para pagos o Resend para correos transaccionales).</p>
      </div>
    </div>
  );
}