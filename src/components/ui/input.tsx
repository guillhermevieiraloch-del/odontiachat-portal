import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-border bg-bg-base px-4 py-2 text-sm text-text-primary",
        "placeholder:text-text-muted",
        "shadow-xs",
        "transition-[border-color,box-shadow,background-color] duration-200 ease-out-soft",
        "hover:border-border-strong",
        "focus-visible:outline-none focus-visible:border-brand-accent",
        "focus-visible:ring-[3px] focus-visible:ring-brand-accent/22",
        "focus-visible:shadow-[0_0_0_0_rgba(0,0,0,0)]",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-bg-mist",
        "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/25",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
