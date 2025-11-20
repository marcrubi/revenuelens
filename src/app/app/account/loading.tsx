import { Skeleton } from "@/components/ui/skeletons";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-wrappers";

export default function Loading() {
  return (
    <StaggerContainer className="space-y-4 max-w-2xl">
      {/* Header */}
      <StaggerItem className="pb-2 border-b border-slate-200">
        <Skeleton className="h-7 w-40 mb-1" />
        <Skeleton className="h-3 w-64" />
      </StaggerItem>

      {/* Profile Card Skeleton */}
      <StaggerItem>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="p-5 grid gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="flex justify-end pt-2">
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* Workspace Card Skeleton */}
      <StaggerItem>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <div className="p-5 grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </StaggerItem>
    </StaggerContainer>
  );
}
