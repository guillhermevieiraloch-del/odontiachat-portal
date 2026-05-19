import { Skeleton } from "@/components/ui/skeleton";

export default function AgendamentosLoading() {
  return (
    <div>
      <header className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-11 w-40" />
      </header>

      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-11 w-32" />
        <Skeleton className="h-11 w-32" />
        <Skeleton className="h-11 w-32" />
        <Skeleton className="h-11 w-11 ml-auto" />
      </div>

      <Skeleton className="h-[560px] w-full rounded-xl" />
    </div>
  );
}
