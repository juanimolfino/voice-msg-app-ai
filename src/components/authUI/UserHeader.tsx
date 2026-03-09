// src/components/authUI/UserHeader.tsx
interface UserHeaderProps {
  email?: string | null;
  credits: number;
  hasCredits: boolean;
}

export function UserHeader({ email, credits, hasCredits }: UserHeaderProps) {
  const isUnlimited = credits === -1;
  const isLow = credits > 0 && credits <= 2;
  
  return (
    <div className="flex items-center justify-between bg-stone-800 p-4 rounded-lg mb-6">
      <div>
        <p className="text-stone-300">
          Hola 👋 Bienvenido <b className="text-stone-100">{email}</b>
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className={`text-sm font-medium ${
            isUnlimited ? 'text-green-400' : 
            isLow ? 'text-amber-500' : 
            'text-stone-400'
          }`}>
            {isUnlimited ? "Pro - Ilimitado" : `${credits} créditos`}
          </span>
          
          {isLow && (
            <p className="text-xs text-amber-500">¡Quedan pocos!</p>
          )}
          
          {!hasCredits && credits === 0 && (
            <p className="text-xs text-red-400">Sin créditos</p>
          )}
        </div>
        
        {/* Botón de upgrade si no tiene créditos o es free */}
        {(!hasCredits || credits >= 0) && credits < 5 && (
          <a 
            href="/upgrade" 
            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
          >
            {credits === 0 ? "Comprar" : "Upgrade"}
          </a>
        )}
      </div>
    </div>
  );
}