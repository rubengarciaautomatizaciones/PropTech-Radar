"use client";

import { useState, useTransition } from "react";
import { redirectToCustomerPortal } from "./actions";
import { CreditCard, ExternalLink, ShieldCheck } from "lucide-react";

export default function BillingPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleOpenPortal = () => {
    setError(null);
    startTransition(async () => {
      const result = await redirectToCustomerPortal();
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Facturación y Planes</h1>
        <p className="text-gray-500 mt-1">Gestiona tu suscripción a Radar PropTech y tus métodos de pago.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold">Portal de Cliente Seguro</h2>
          </div>
          <p className="text-gray-500 text-sm max-w-md">
            Descarga tus facturas, actualiza tu tarjeta de crédito o cancela tu suscripción directamente desde nuestra integración oficial y segura con Stripe.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
            <ShieldCheck className="w-4 h-4" />
            Pagos encriptados y procesados por Stripe
          </div>
        </div>

        <button
          onClick={handleOpenPortal}
          disabled={isPending}
          className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isPending ? "Conectando..." : (
            <>
              Gestionar en Stripe <ExternalLink className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}