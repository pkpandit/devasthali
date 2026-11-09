import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * Canonical Shared Content Container
 * Centered and constrained layout (max-width: 1280px, mx-auto)
 * with standard responsive gutters: 16px mobile, 24px small tablet, 32px desktop.
 */
export function Container({
  children,
  className = "",
  as: Component = "div",
  ...props
}: ContainerProps) {
  return (
    <Component
      className={`site-container w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 box-border ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
