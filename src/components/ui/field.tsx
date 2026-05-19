import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
