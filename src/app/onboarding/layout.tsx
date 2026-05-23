import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { finishOnboarding } from "./actions";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden mesh-bg">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-brand-accent/22 blur-3xl animate-soft-pulse"
        style={{ animationDuration: "6s" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-brand-primary-light/18 blur-3xl"
      />

      <div className="relative flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-6 lg:px-12">
          <Link href="/" aria-label="Início">
            <Logo size="md" />
          </Link>
          <form action={finishOnboarding}>
            <button
              type="submit"
              className="text-sm font-semibold text-text-secondary hover:text-brand-primary"
            >
              Pular por enquanto →
            </button>
          </form>
        </header>

        <main className="flex flex-1 items-start justify-center px-4 py-8 lg:py-12">
          <div className="w-full max-w-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
