import type { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "doc" | "subtle";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  if (variant === "doc") {
    return (
      <span className={`workspace-tag workspace-tag--doc ${className}`}>
        {children}
      </span>
    );
  }

  if (variant === "subtle") {
    return (
      <span className={`workspace-tag ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <span className={`admin-nav__badge ${className}`}>
      {children}
    </span>
  );
}
