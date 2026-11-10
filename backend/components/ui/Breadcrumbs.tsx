import { ChevronRight } from "lucide-react";

export interface BreadcrumbsProps {
  items: string[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`workspace-breadcrumbs ${className}`}>
      {items.map((crumb, index) => (
        <span className="workspace-breadcrumb" key={`${crumb}-${index}`}>
          {index > 0 && <ChevronRight aria-hidden="true" size={14} />}
          <span>{crumb}</span>
        </span>
      ))}
    </nav>
  );
}
