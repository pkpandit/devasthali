import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * Canonical Shared Content Container
 * Full-width edge-to-edge layout matching Header & Footer,
 * with standard responsive gutters: 16px mobile, 24px small tablet, 32px desktop, 48px wide screen.
 */
export function Container({
  children,
  className = "",
  as: Component = "div",
  ...props
}: ContainerProps) {
  return (
    <Component
      className={`site-container w-full px-4 sm:px-6 lg:px-8 xl:px-12 box-border ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
