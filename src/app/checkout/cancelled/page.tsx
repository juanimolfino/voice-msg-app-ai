// src/app/checkout/cancelled/page.tsx
import Link from "next/link";

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-amber-400">Pago cancelado</h1>
        <p className="text-stone-300">No se realizó ningún cargo.</p>
        <Link href="/" className="text-indigo-400 hover:underline">
          Volver a la app
        </Link>
      </div>
    </div>
  );
}