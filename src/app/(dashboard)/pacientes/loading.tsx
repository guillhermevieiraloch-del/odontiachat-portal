import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function PacientesLoading() {
  return (
    <div>
      <header className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-11 w-32" />
      </header>

      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <Skeleton className="h-11 flex-1 min-w-[220px] max-w-md" />
        <Skeleton className="h-11 w-32" />
        <Skeleton className="h-11 w-40" />
        <Skeleton className="h-11 w-24" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
