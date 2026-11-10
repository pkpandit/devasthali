import type { ElementType, ReactNode } from "react";

export interface CardProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  id?: string;
  "aria-labelledby"?: string;
}

export function Card({
  as: Component = "div",
  children,
  className = "",
  id,
  "aria-labelledby": ariaLabelledBy,
}: CardProps) {
  return (
    <Component
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={`workspace-card ${className}`}
    >
      {children}
    </Component>
  );
}
