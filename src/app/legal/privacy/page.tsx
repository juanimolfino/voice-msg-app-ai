// src/app/legal/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-300 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-stone-100 mb-4">Política de Privacidad</h1>
        <p className="text-sm text-stone-500">Fecha de vigencia: 14 de marzo de 2026</p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-stone-200">1. Datos que recopilamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Email:</strong> Para autenticación y envío de magic links.</li>
            <li><strong>Audios:</strong> Temporalmente procesados para transcripción. No se almacenan permanentemente.</li>
            <li><strong>Conversaciones corregidas:</strong> Guardadas en nuestra base de datos para tu historial.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-stone-200">2. Cómo usamos tus datos</h2>
          <p>Para prestar el servicio de corrección de conversaciones y gestionar tus créditos. No vendemos datos a terceros.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-stone-200">3. Procesadores externos</h2>
          <p>Usamos OpenAI, Kimi (Moonshot AI) y Stripe para procesamiento de audio y pagos.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-stone-200">4. Tus derechos</h2>
          <p>Podés solicitar la eliminación de tu cuenta contactándonos.</p>
        </section>
      </div>
    </div>
  );
}