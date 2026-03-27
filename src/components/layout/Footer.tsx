// src/components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="w-full border-t border-stone-800 bg-stone-900 py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-400">
        <div>
          © {new Date().getFullYear()} Voice AI. Todos los derechos reservados.
        </div>
        
        <div className="flex gap-6">
          <a href="/legal/privacy" className="hover:text-stone-200 transition-colors">
            Privacidad
          </a>
          <a href="/legal/terms" className="hover:text-stone-200 transition-colors">
            Términos
          </a>
        </div>
      </div>
    </footer>
  );
}