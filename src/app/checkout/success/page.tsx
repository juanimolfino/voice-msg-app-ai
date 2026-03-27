// src/app/checkout/success/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// 👉 Componente interno que usa useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [creditsAdded, setCreditsAdded] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        const data = await res.json();
        
        if (data.success) {
          setStatus('success');
          if (data.creditsAdded) {
            setCreditsAdded(data.creditsAdded);
          }
        } else {
          setStatus('success'); // Asumimos que el webhook lo procesó
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setStatus('success');
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (status === 'verifying') {
    return (
      <>
        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-stone-300">Verificando tu pago...</p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-green-400">¡Pago exitoso! 🎉</h1>
      <p className="text-stone-300">
        {creditsAdded 
          ? `Se agregaron ${creditsAdded} créditos a tu cuenta.` 
          : 'Tu compra fue procesada correctamente.'}
      </p>
      <Link 
        href="/" 
        className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition-colors"
      >
        Volver a la app
      </Link>
    </>
  );
}

// 👉 Loading fallback para Suspense
function LoadingFallback() {
  return (
    <div className="text-center space-y-4">
      <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
      <p className="text-stone-300">Cargando...</p>
    </div>
  );
}

// 👉 Página principal envuelta en Suspense
export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900">
      <div className="text-center space-y-4 max-w-md mx-auto p-6">
        <Suspense fallback={<LoadingFallback />}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}