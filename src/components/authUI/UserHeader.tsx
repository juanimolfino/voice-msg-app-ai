// src/components/authUI/UserHeader.tsx
'use client'

import { useState, useEffect } from 'react';

interface UserHeaderProps {
  email?: string | null;
  initialCredits: number;        // 👉 Créditos comprados disponibles
  initialHasCredits: boolean;    
  plan?: string;
  usedThisMonth?: number;        // 👉 Usados del plan mensual
  includedThisMonth?: number;    // 👉 Incluidos en el plan (50 o 200)
}

export function UserHeader({ 
  email, 
  initialCredits, 
  plan = 'free',
  usedThisMonth = 0,
  includedThisMonth = 0
}: UserHeaderProps) {
  
  const [credits, setCredits] = useState(initialCredits);
  const [used, setUsed] = useState(usedThisMonth);
  
  const isUnlimited = plan === 'pro_unlimited' && used < 200;
  const isProLight = plan === 'pro_light';
  const isFree = plan === 'free';
  
  // 👉 Calcular disponibles del plan
  const planRemaining = Math.max(0, includedThisMonth - used);
  
  // 👉 Calcular si está bajo (solo créditos comprados, no del plan)
  const isLow = !isUnlimited && credits > 0 && credits <= 2 && planRemaining === 0;
  
  // 👉 Total disponible para usar
  const totalAvailable = isUnlimited ? Infinity : planRemaining + credits;

  useEffect(() => {
    const handleCreditSpent = () => {
      if (isUnlimited) {
        setUsed(prev => prev + 1);
      } else if (planRemaining > 0) {
        // Usamos del plan primero
        setUsed(prev => prev + 1);
      } else {
        // Usamos créditos comprados
        setCredits(prev => prev - 1);
      }
    };

    const handleCreditRefunded = () => {
      if (isUnlimited) {
        setUsed(prev => Math.max(0, prev - 1));
      } else if (planRemaining > 0) {
        setUsed(prev => prev - 1);
      } else {
        setCredits(prev => prev + 1);
      }
    };

    window.addEventListener('credit:spent', handleCreditSpent);
    window.addEventListener('credit:refunded', handleCreditRefunded);

    return () => {
      window.removeEventListener('credit:spent', handleCreditSpent);
      window.removeEventListener('credit:refunded', handleCreditRefunded);
    };
  }, [isUnlimited, planRemaining]);

  return (
    <div className="flex items-center justify-between bg-stone-800 p-4 rounded-lg mb-6">
      <div>
        <p className="text-stone-300">
          Hola 👋 Bienvenido <b className="text-stone-100">{email}</b>
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-right">
          {isUnlimited ? (
            <span className="text-sm font-medium text-green-400">
              Pro Unlimited 🚀 ({used}/200)
            </span>
          ) : isProLight ? (
            <div className="flex flex-col items-end">
              <span className={`text-sm font-medium ${
                planRemaining === 0 ? 'text-amber-500' : 'text-blue-400'
              }`}>
                Pro {used}/{includedThisMonth} usadas
              </span>
              {/* 👉 SIEMPRE mostrar créditos comprados si existen */}
              {credits > 0 && (
                <span className="text-xs text-green-400">
                  +{credits} créditos de respaldo
                </span>
              )}
            </div>
          ) : (
            <span className={`text-sm font-medium ${
              isLow ? 'text-amber-500' : 'text-stone-400'
            }`}>
              {credits} créditos
            </span>
          )}
          
          {/* 👉 Alerta si está bajo de créditos de respaldo */}
          {isLow && (
            <p className="text-xs text-amber-500">¡Quedan pocos créditos!</p>
          )}
          
          {/* 👉 Alerta si no tiene nada disponible */}
          {totalAvailable === 0 && (
            <p className="text-xs text-red-400">Sin créditos disponibles</p>
          )}
        </div>
        
        {/* 👉 Botón de compra si está bajo o es free */}
        {(totalAvailable === 0 || (isFree && credits < 5)) && (
          <a 
            href="/upgrade" 
            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition-colors"
          >
            {credits === 0 ? "Comprar créditos" : "Upgrade"}
          </a>
        )}
      </div>
    </div>
  );
}