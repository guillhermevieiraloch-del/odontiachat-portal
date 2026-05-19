import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base">
      <header className="border-b border-border bg-bg-base">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display font-extrabold text-lg text-brand-primary"
          >
            OdontIAChat
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/privacidade" className="text-text-secondary hover:text-brand-primary">
              Privacidade
            </Link>
            <Link href="/termos" className="text-text-secondary hover:text-brand-primary">
              Termos
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">{children}</main>
      <footer className="border-t border-border mt-12">
        <div className="max-w-3xl mx-auto px-6 py-6 text-sm text-text-muted text-center">
          © {new Date().getFullYear()} OdontIAChat. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
