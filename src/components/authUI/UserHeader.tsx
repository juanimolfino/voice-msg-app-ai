// src/components/authUI/UserHeader.tsx
'use client' // 👉 Ahora es Client Component para manejar estado

import { useState, useEffect } from 'react';

interface UserHeaderProps {
  email?: string | null;
  initialCredits: number;        // 👉 Renombrado: créditos iniciales del servidor
  initialHasCredits: boolean;    // 👉 Renombrado: estado inicial del servidor
  plan?: string;                 // 👉 Nuevo: tipo de plan
  usedThisMonth?: number;        // 👉 Nuevo: usadas este mes
  includedThisMonth?: number;    // 👉 Nuevo: incluidas en el plan
}

export function UserHeader({ 
  email, 
  initialCredits, 
  //initialHasCredits,
  plan = 'free',
  usedThisMonth = 0,
  includedThisMonth = 0
}: UserHeaderProps) {
  
  // 👉 ESTADO LOCAL: Se actualiza instantáneamente sin refrescar la página
  // Inicializa con los datos del servidor, pero el cliente puede cambiarlos
  const [credits, setCredits] = useState(initialCredits);
  const [used, setUsed] = useState(usedThisMonth);
  
  // 👉 Detectar tipo de plan
  const isUnlimited = plan === 'pro_unlimited' && used < 200;
  const isProLight = plan === 'pro_light';
  const isFree = plan === 'free';
  
  // 👉 Calcular si está bajo de créditos
  const isLow = !isUnlimited && credits > 0 && credits <= 2;
  
  // 👉 Calcular si puede usar la app (para mostrar alertas)
  const canUse = isUnlimited || (isProLight && used < includedThisMonth) || credits > 0;

  // 👉 ESCUCHAR EVENTO GLOBAL: Cuando el container gasta un crédito, actualizamos UI
  useEffect(() => {
    const handleCreditSpent = () => {
      if (isUnlimited) {
        // Pro Unlimited: solo incrementa el contador de usadas
        setUsed(prev => prev + 1);
      } else if (isProLight && used < includedThisMonth) {
        // Pro Light usando créditos incluidos: incrementa usadas
        setUsed(prev => prev + 1);
      } else {
        // Free o Pro Light sin incluidos: descuenta de créditos comprados
        setCredits(prev => prev - 1);
      }
    };

    const handleCreditRefunded = () => {
      if (isUnlimited) {
        setUsed(prev => Math.max(0, prev - 1));
      } else if (isProLight && used > 0) {
        setUsed(prev => prev - 1);
      } else {
        setCredits(prev => prev + 1);
      }
    };

    // 👉 Nos suscribimos a eventos globales del window
    window.addEventListener('credit:spent', handleCreditSpent);
    window.addEventListener('credit:refunded', handleCreditRefunded);

    // 👉 Cleanup: removemos listeners cuando se desmonta
    return () => {
      window.removeEventListener('credit:spent', handleCreditSpent);
      window.removeEventListener('credit:refunded', handleCreditRefunded);
    };
  }, [isUnlimited, isProLight, used, includedThisMonth]); // 👉 Dependencias: recalcula si cambia el plan

  return (
    <div className="flex items-center justify-between bg-stone-800 p-4 rounded-lg mb-6">
      <div>
        <p className="text-stone-300">
          Hola 👋 Bienvenido <b className="text-stone-100">{email}</b>
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-right">
          {/* 👉 Mostramos diferente según el plan */}
          {isUnlimited ? (
            <span className="text-sm font-medium text-green-400">
              Pro Unlimited 🚀
            </span>
          ) : isProLight ? (
            <span className={`text-sm font-medium ${
              used >= includedThisMonth ? 'text-amber-500' : 'text-blue-400'
            }`}>
              Pro {used}/{includedThisMonth}
              {used >= includedThisMonth && credits > 0 && ` + ${credits} extra`}
            </span>
          ) : (
            <span className={`text-sm font-medium ${
              isLow ? 'text-amber-500' : 'text-stone-400'
            }`}>
              {credits} créditos
            </span>
          )}
          
          {/* 👉 Alertas según estado */}
          {isLow && (
            <p className="text-xs text-amber-500">¡Quedan pocos!</p>
          )}
          
          {!canUse && (
            <p className="text-xs text-red-400">Sin créditos disponibles</p>
          )}
        </div>
        
        {/* 👉 Botón de upgrade si está bajo o sin créditos */}
        {(!canUse || (isFree && credits < 5)) && (
          <a 
            href="/upgrade" 
            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition-colors"
          >
            {credits === 0 ? "Comprar créditos" : "Upgrade a Pro"}
          </a>
        )}
      </div>
    </div>
  );
}