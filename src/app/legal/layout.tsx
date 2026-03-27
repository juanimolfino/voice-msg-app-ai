import Link from "next/link";

// src/app/legal/layout.tsx
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-900">
      <div className="p-4 border-b border-stone-800">
        <Link href="/" className="text-stone-400 hover:text-stone-200">← Volver a la app</Link>
      </div>
      {children}
    </div>
  );
}