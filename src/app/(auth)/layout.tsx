import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-soft">
      {/* Decorative glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-brand-accent/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-brand-primary-light/10 blur-3xl"
      />

      <div className="relative flex min-h-screen flex-col">
        <header className="px-6 py-6 lg:px-12">
          <Link href="/" aria-label="Início">
            <Logo size="md" />
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-8 lg:py-16">
          <div className="w-full max-w-md">{children}</div>
        </main>

        <footer className="px-6 py-6 text-center text-xs text-text-muted">
          © {new Date().getFullYear()} OdontIAChat. Inteligência artificial para clínicas odontológicas.
        </footer>
      </div>
    </div>
  );
}
