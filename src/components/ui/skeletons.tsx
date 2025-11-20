import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      // CAMBIO: rounded-md (borde suave) en vez de full o xl.
      // bg-slate-200/60 es más sutil para estilo técnico.
      className={cn("animate-pulse rounded-md bg-slate-200/60", className)}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Compacto */}
      <div className="flex justify-between h-8 items-end border-b border-slate-100 pb-2">
        <div className="space-y-1">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-24 h-3" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-24 h-8" />
        </div>
      </div>

      {/* KPIs Grid (4 columnas) */}
      <div className="grid gap-3 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          // Altura reducida a h-24 para coincidir con las nuevas tarjetas
          <Skeleton
            key={i}
            className="h-24 w-full border border-slate-100 bg-white shadow-none"
          />
        ))}
      </div>

      {/* Main Grid (Chart + Table) */}
      <div className="grid gap-3 md:grid-cols-3 min-h-[300px]">
        <Skeleton className="md:col-span-2 h-full border border-slate-100 bg-white shadow-none" />
        <Skeleton className="h-full border border-slate-100 bg-white shadow-none" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <Skeleton className="w-24 h-5" />
          <Skeleton className="w-36 h-3" />
        </div>
        <Skeleton className="w-20 h-8" />
      </div>
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="h-9 bg-slate-50 border-b border-slate-200" />
        <div className="p-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0"
            >
              <Skeleton className="w-1/3 h-3" />
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-8 h-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
