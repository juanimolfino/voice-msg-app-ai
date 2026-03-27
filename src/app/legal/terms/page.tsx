// src/app/legal/terms/page.tsx
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-300 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-stone-100 mb-4">Términos de Servicio</h1>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-stone-200">1. Descripción del servicio</h2>
          <p>Herramienta de práctica de idiomas que transcribe y corrige conversaciones mediante IA.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-stone-200">2. Pagos y créditos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>1 crédito = 1 conversación procesada.</li>
            <li>Los packs de créditos son de pago único y no expiran.</li>
            <li>Las suscripciones Pro se renuevan mensualmente.</li>
            <li><strong>Reembolsos:</strong> Solo en caso de error técnico demostrable.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-stone-200">3. Cancelación</h2>
          <p>Podés cancelar desde tu cuenta de Stripe. Mantenés acceso hasta el final del mes pagado.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-stone-200">4. Uso prohibido</h2>
          <p>No subir contenido ilegal o que viole derechos de terceros.</p>
        </section>
      </div>
    </div>
  );
}