import { ListItemSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function InboxLoading() {
  return (
    <div className="h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-[360px_1fr] rounded-xl border border-border overflow-hidden bg-bg-base">
      {/* Left list */}
      <div className="border-r border-border flex flex-col">
        <div className="border-b border-border px-4 pt-4 pb-3 space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-11 w-full" />
          <div className="flex gap-1.5">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
      {/* Right empty state */}
      <div className="hidden lg:flex items-center justify-center bg-bg-mist">
        <div className="space-y-3 max-w-xs text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-3 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
}
