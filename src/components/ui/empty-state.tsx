"use client";

import { StaggerContainer, StaggerItem } from "@/components/ui/motion-wrappers";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <StaggerContainer
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center mx-auto ${className}`}
    >
      <StaggerItem>
        <div className="h-10 w-10 mx-auto bg-white border border-slate-200 rounded flex items-center justify-center text-slate-400 mb-3 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs text-slate-500 mb-5 max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
        {action && <div>{action}</div>}
      </StaggerItem>
    </StaggerContainer>
  );
}
