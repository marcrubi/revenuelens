import { TableSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto space-y-4 mt-2">
      {/* Imitamos el Header de la página real */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="h-8 w-28 bg-slate-900/10 rounded animate-pulse" />
      </div>

      {/* La tabla en sí */}
      <TableSkeleton />
    </div>
  );
}
