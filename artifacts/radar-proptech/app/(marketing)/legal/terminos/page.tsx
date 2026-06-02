// artifacts/radar-proptech/app/(marketing)/legal/terminos/page.tsx
export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="font-heading text-4xl font-bold text-kavox-body mb-8">Términos y Condiciones</h1>
      <div className="prose prose-slate text-kavox-muted space-y-6">
        <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}</p>
        <h2 className="text-xl font-bold text-kavox-body mt-8">1. Uso del Servicio</h2>
        <p>KAVOX es una herramienta B2B. Al registrarse, el usuario confirma que actúa en nombre de un negocio o entidad profesional (agencia inmobiliaria o inversor profesional).</p>
        <h2 className="text-xl font-bold text-kavox-body mt-8">2. Suscripciones y Pagos</h2>
        <p>El servicio opera mediante suscripción mensual. Se cobrará la parte proporcional en el momento de añadir "Radares" o "Zonas" adicionales al plan base.</p>
        <h2 className="text-xl font-bold text-kavox-body mt-8">3. Uso Aceptable</h2>
        <p>El cliente es responsable del uso que hace de los datos (Leads) extraídos mediante el radar, eximiendo a KAVOX de cualquier mala praxis en el contacto comercial según la RGPD.</p>
      </div>
    </div>
  );
}