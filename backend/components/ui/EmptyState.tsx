import type { ElementType, ReactNode } from "react";
import { FileText } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ElementType;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FileText,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`workspace-placeholder ${className}`}>
      <span aria-hidden="true" className="workspace-placeholder__mark">
        <Icon size={22} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  );
}
