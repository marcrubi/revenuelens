// src/components/ui/skeletons.tsx
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/80", className)}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between h-10 items-center">
        <div className="space-y-2">
          <Skeleton className="w-48 h-6" />
          <Skeleton className="w-32 h-4" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-32 h-9" />
          <Skeleton className="w-32 h-9" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl shadow-sm" />
        ))}
      </div>

      {/* Chart */}
      <Skeleton className="h-96 w-full rounded-xl shadow-sm" />

      {/* Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 rounded-xl shadow-sm" />
        <Skeleton className="h-64 rounded-xl shadow-sm" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-48 h-4" />
        </div>
        <Skeleton className="w-24 h-9 rounded-md" />
      </div>
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="h-10 bg-slate-50 border-b border-slate-200" />
        <div className="p-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0"
            >
              <Skeleton className="w-1/3 h-4" />
              <Skeleton className="w-1/4 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-8 h-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
