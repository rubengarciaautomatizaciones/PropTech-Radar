// artifacts/radar-proptech/app/(marketing)/pro/page.tsx
import Link from "next/link";
import { ChevronRight, Target, Zap, FileOutput, CheckCircle2, ShieldCheck } from "lucide-react";

export default function MainLandingPage() {
  return (
    <div className="w-full animate-in fade-in duration-700">

      {/* SECCIÓN 1: HERO & ANIMATED PHONE */}
      <section className="pt-24 pb-20 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">

        {/* Text Side */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-kavox-body leading-[1.05] tracking-tight mb-8">
            El radar sub-segundo que te hace llegar el primero.
          </h1>
          <p className="text-xl text-kavox-muted leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
            Intercepta pisos de particulares en milisegundos directamente en tu Telegram. Genera una valoración en 3 clics y cierra la exclusiva antes de que tu competencia actualice su CRM.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto bg-kavox-accent hover:bg-teal-800 text-white font-bold tracking-wide text-lg px-8 py-4 rounded-md transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Prueba KAVOX 3 días gratis <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex items-center justify-center lg:justify-start gap-2 mt-4 text-xs font-medium text-kavox-muted">
            <ShieldCheck className="w-4 h-4 text-kavox-success" />
            <span>Requiere tarjeta anti-bots. Cancela en 1 clic sin coste.</span>
          </div>
        </div>

        {/* Visual Side (CSS Phone Animation) */}
        <div className="flex-1 w-full max-w-sm flex justify-center relative">
          <div className="relative w-[280px] h-[580px] bg-kavox-body rounded-[2.5rem] p-3 shadow-2xl border-4 border-gray-200">
            {/* Pantalla del móvil */}
            <div className="w-full h-full bg-gray-50 rounded-[2rem] overflow-hidden relative border border-gray-800">

              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-kavox-body rounded-b-xl w-32 mx-auto z-10"></div>

              {/* Fake Telegram UI Header */}
              <div className="bg-[#17212b] pt-12 pb-3 px-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-kavox-accent flex items-center justify-center text-white font-bold text-sm">KX</div>
                <div>
                  <div className="text-white font-bold text-sm">Radar Madrid Centro</div>
                  <div className="text-blue-400 text-xs">bot</div>
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-4 bg-[#0e1621] h-full flex flex-col justify-end pb-12 gap-4">

                {/* Mensaje Fake 1 (Estático) */}
                <div className="bg-[#182533] text-white p-3 rounded-lg rounded-tl-none text-xs border border-slate-700/50 max-w-[85%] self-start opacity-50">
                  <div className="text-kavox-accent font-bold mb-1">Nuevo Lead Particular</div>
                  Atico en calle Goya...
                </div>

                {/* ANIMACIÓN: Nuevo mensaje entrando */}
                <div className="animate-slide-down bg-[#182533] text-white p-3.5 rounded-lg rounded-tl-none text-xs border border-kavox-accent shadow-[0_0_15px_rgba(0,135,153,0.3)] max-w-[90%] self-start relative">
                  <div className="text-kavox-accent font-bold mb-2 uppercase tracking-wide">🚨 Captura Inmediata</div>
                  <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80" className="w-full h-24 object-cover rounded mb-2" alt="Piso" />
                  <div className="font-bold text-sm mb-1">Piso luminoso reformado</div>
                  <div className="text-gray-300 mb-2">120 m² • 3 Hab. • 2 Baños</div>
                  <div className="text-lg font-bold mb-3">650.000 €</div>

                  <div className="w-full bg-green-600/20 text-green-400 font-mono text-center py-2 rounded font-bold border border-green-500/30">
                    📞 +34 600 123 456
                  </div>

                  {/* Etiqueta de tiempo (Falsa ilusión de velocidad) */}
                  <div className="absolute -right-2 -bottom-2 bg-kavox-accent text-white text-[9px] font-bold px-2 py-1 rounded shadow">Hace 0.4s</div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: MANIFIESTO (VENTAJAS INJUSTAS) */}
      <section className="py-24 bg-kavox-surface border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-kavox-body mb-16 text-center">
            Infraestructura táctica, no otro CRM decorativo.
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-kavox-accent transition-colors">
              <div className="w-12 h-12 bg-kavox-accent/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-kavox-accent" />
              </div>
              <h3 className="font-heading font-bold text-xl text-kavox-body mb-4">Velocidad Sub-Segundo</h3>
              <p className="text-kavox-muted leading-relaxed text-sm">
                Evadimos a Datadome. Te entregamos el dato crudo antes de que los portales lo indexen en sus propias alertas y horas antes que la competencia.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-kavox-accent transition-colors">
              <div className="w-12 h-12 bg-kavox-accent/10 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-kavox-accent" />
              </div>
              <h3 className="font-heading font-bold text-xl text-kavox-body mb-4">Fricción Cero en tu Bolsillo</h3>
              <p className="text-kavox-muted leading-relaxed text-sm">
                Nada de portales pesados ni contraseñas. El lead entra a tu Telegram de forma push. Tocas el número, llamas. Acción inmediata.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-kavox-accent transition-colors">
              <div className="w-12 h-12 bg-kavox-accent/10 rounded-lg flex items-center justify-center mb-6">
                <FileOutput className="w-6 h-6 text-kavox-accent" />
              </div>
              <h3 className="font-heading font-bold text-xl text-kavox-body mb-4">One-Click CMA</h3>
              <p className="text-kavox-muted leading-relaxed text-sm">
                Pasa de la puerta fría a la autoridad. Toca un botón en el radar y envía al propietario un Dossier de Valoración en PDF en 3 segundos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: LA MATEMÁTICA DEL RETORNO (PRICING) */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-kavox-body mb-4">La Matemática del Retorno</h2>
          <p className="text-lg text-kavox-muted max-w-2xl mx-auto">
            Perder un piso por llegar 10 minutos tarde te cuesta 10.000€ en honorarios. KAVOX te cuesta menos de 7€ al día.
          </p>
        </div>

        <div className="bg-kavox-body text-white rounded-3xl p-10 md:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-kavox-accent rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Licencia Operativa</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-heading font-bold">199€</span>
                <span className="text-gray-400">/ mes por radar</span>
              </div>

              <ul className="space-y-4 mb-8">
                {['Trial de 3 días a coste cero.', 'Alertas instantáneas vía Telegram.', 'Generador de PDF CMA ilimitado.', 'Rastreo 24/7 con proxys residenciales.', 'Usuarios de equipo ilimitados.'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-kavox-accent shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full md:w-auto">
              <Link 
                href="/signup" 
                className="w-full block text-center bg-white text-kavox-body font-bold text-lg px-8 py-4 rounded-md transition-all hover:bg-gray-100"
              >
                Activar Infraestructura
              </Link>
              <p className="text-center text-xs text-gray-400 mt-4">Cancelación instantánea desde tu panel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: FAQ */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-heading font-bold text-2xl text-kavox-body mb-10 text-center">Preguntas Logísticas</h2>

          <div className="space-y-8">
            <div>
              <h4 className="font-bold text-kavox-body mb-2">¿Me vais a cobrar de inmediato?</h4>
              <p className="text-sm text-kavox-muted leading-relaxed">No. Tienes 72 horas operativas a coste cero para cazar tu primera exclusiva. Tras ese periodo, Stripe procesará el pago automáticamente. Puedes cancelar en 1 clic antes de que eso ocurra.</p>
            </div>
            <div>
              <h4 className="font-bold text-kavox-body mb-2">¿Tengo exclusividad en mi zona?</h4>
              <p className="text-sm text-kavox-muted leading-relaxed">La tecnología rastrea sin límites geográficos. La exclusividad te la da tu velocidad. Quien coja el teléfono y llame más rápido cuando suene Telegram, se lleva el piso.</p>
            </div>
            <div>
              <h4 className="font-bold text-kavox-body mb-2">¿Cómo funciona el cobro por "Radar"?</h4>
              <p className="text-sm text-kavox-muted leading-relaxed">Un radar equivale a una URL de búsqueda configurada (Ej: "Pisos en el Barrio Salamanca"). Cuesta 199€/mes. Si quieres rastrear simultáneamente otra zona distinta, puedes añadir un segundo radar desde tu panel y se prorrateará en tu factura.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}