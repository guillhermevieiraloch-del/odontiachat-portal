import { Construction, type LucideIcon } from "lucide-react";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function PagePlaceholder({
  title,
  description,
  icon: Icon = Construction,
}: PagePlaceholderProps) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-primary">
          {title}
        </h1>
        <p className="mt-2 text-text-secondary">{description}</p>
      </header>

      <div className="rounded-lg border border-dashed border-border bg-bg-base p-12 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent-soft text-brand-primary mb-4">
          <Icon size={24} />
        </div>
        <p className="font-display font-bold text-lg text-text-primary">
          Em construção
        </p>
        <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
          Esta seção será liberada em breve. Vamos construí-la nos próximos blocos.
        </p>
      </div>
    </div>
  );
}
