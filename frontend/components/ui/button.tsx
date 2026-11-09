import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-[color,background-color,border-color] duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-[#B91C1C] text-white shadow-xs hover:bg-[#991B1B] border border-[#991B1B]",
        glow:
          "bg-[#B91C1C] text-white shadow-md hover:bg-[#991B1B] border border-[#991B1B] active:translate-y-0",
        secondary:
          "bg-[#F3F4F6] text-[#111827] hover:bg-gray-200 border border-[#E5E7EB]",
        outline:
          "border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#B91C1C] hover:text-white hover:border-[#B91C1C] disabled:hover:bg-white disabled:hover:text-[#111827] disabled:hover:border-[#E5E7EB] [&_svg]:transition-colors [&_svg]:duration-150 hover:[&_svg]:text-white disabled:hover:[&_svg]:text-inherit",
        ghost:
          "text-[#111827] hover:bg-[#F3F4F6]",
        destructive:
          "bg-[#DC2626] text-white shadow-xs hover:bg-[#B91C1C]",
        link:
          "text-[#B91C1C] underline-offset-4 hover:underline p-0 h-auto",
        whatsapp:
          "bg-[#25D366] text-white shadow-xs hover:bg-[#1ebd5b] border border-[#1ebd5b] focus-visible:ring-[#25D366]",
      },
      size: {
        sm: "h-9 px-3.5 text-sm rounded-lg font-medium",
        default: "h-11 px-5 py-2.5 text-base rounded-xl font-semibold",
        lg: "h-12 px-6 text-base rounded-xl font-bold",
        pill: "h-12 px-7 text-sm rounded-full font-heading font-bold uppercase tracking-wider",
        icon: "h-10 w-10 p-0 rounded-xl",
        "icon-sm": "h-8 w-8 p-0 rounded-lg",
        "icon-pill": "h-12 w-12 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
