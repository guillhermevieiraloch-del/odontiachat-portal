interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, children }: Props) {
  return (
    <section className="rounded-2xl border border-border bg-bg-base shadow-card hover:shadow-md transition-shadow duration-300 ease-out-soft">
      <header className="px-5 py-4 border-b border-border">
        <h2 className="font-display font-bold text-text-primary">{title}</h2>
        {description && (
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        )}
      </header>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}
