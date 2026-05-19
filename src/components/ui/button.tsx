import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-display font-bold",
    "transition-[transform,background-color,box-shadow,color,border-color] duration-200 ease-out-soft",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.96] active:duration-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/55 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
    "btn-sheen", // diagonal light sweep on hover
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "text-white bg-brand-primary",
          "shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_8px_20px_-4px_rgba(13,59,102,0.36)]",
          "hover:bg-brand-primary-dark hover:-translate-y-0.5",
          "hover:shadow-[0_1px_0_0_rgba(255,255,255,0.22)_inset,0_18px_40px_-8px_rgba(13,59,102,0.55),0_0_24px_-8px_rgba(64,224,208,0.45)]",
        ].join(" "),
        accent: [
          "bg-brand-accent text-brand-primary",
          "shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_6px_16px_-4px_rgba(64,224,208,0.55)]",
          "hover:bg-brand-accent-dark hover:-translate-y-0.5",
          "hover:shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset,0_16px_36px_-8px_rgba(64,224,208,0.75)]",
        ].join(" "),
        secondary: [
          "bg-bg-base text-text-primary border border-border",
          "hover:bg-bg-soft hover:border-border-strong hover:-translate-y-0.5",
          "shadow-xs hover:shadow-md",
        ].join(" "),
        outline: [
          "border border-brand-primary text-brand-primary bg-transparent",
          "hover:bg-brand-primary hover:text-white hover:-translate-y-0.5 hover:shadow-md",
        ].join(" "),
        ghost: "text-text-secondary hover:text-brand-primary hover:bg-bg-mist [&.btn-sheen::after]:hidden",
        link: "text-brand-primary underline-offset-4 hover:underline [&.btn-sheen::after]:hidden",
        destructive: [
          "bg-danger text-white",
          "hover:bg-red-600 hover:-translate-y-0.5",
          "shadow-[0_8px_20px_-4px_rgba(239,68,68,0.36)]",
          "hover:shadow-[0_16px_36px_-8px_rgba(239,68,68,0.55)]",
        ].join(" "),
        gradient: [
          "text-white",
          "bg-[linear-gradient(135deg,var(--brand-primary)_0%,var(--brand-primary-light)_45%,var(--brand-accent-dark)_100%)]",
          "bg-[length:200%_200%] bg-[position:0%_50%]",
          "shadow-[0_8px_24px_-4px_rgba(13,59,102,0.45)]",
          "hover:bg-[position:100%_50%] hover:-translate-y-0.5",
          "hover:shadow-[0_18px_40px_-8px_rgba(13,59,102,0.6),0_0_28px_-6px_rgba(64,224,208,0.5)]",
        ].join(" "),
      },
      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
