import { MetricCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Hero card */}
      <Skeleton className="h-[280px] w-full rounded-3xl" />

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      {/* Activity + AI status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-5">
        <Skeleton className="h-[360px] rounded-xl xl:col-span-2" />
        <Skeleton className="h-[360px] rounded-xl" />
      </div>
    </div>
  );
}
