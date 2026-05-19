import { cn } from "@/lib/utils";

/**
 * Animated shimmer skeleton block.
 * Use as placeholder for content being loaded.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "shimmer rounded-md",
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Skeleton row for list-like items (avatar + 2 lines of text).
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 min-h-[76px] border-b border-border">
      <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full max-w-[260px]" />
      </div>
    </div>
  );
}

/**
 * Skeleton for metric cards on dashboard.
 */
export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-bg-base p-6 min-h-[200px] flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-12 w-20 mt-2" />
      <Skeleton className="h-3 w-32 mt-3" />
      <div className="mt-auto pt-4">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton for card-style list items (e.g. patient cards in a grid).
 */
export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-bg-base p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}
