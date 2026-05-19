"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  id?: string;
  variant?: "default" | "danger";
}

export function TagInput({
  value,
  onChange,
  placeholder = "Digite e pressione Enter",
  suggestions,
  id,
  variant = "default",
}: TagInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (value.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  };

  const removeTag = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
    inputRef.current?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const tagCls =
    variant === "danger"
      ? "bg-danger/10 text-danger border-danger/30"
      : "bg-brand-accent-soft text-brand-primary border-brand-accent/30";

  return (
    <div>
      <div className="min-h-12 flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-bg-base px-2 py-2 focus-within:border-brand-accent focus-within:ring-[3px] focus-within:ring-brand-accent/20 transition-colors duration-200">
        {value.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-bold",
              tagCls,
            )}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-text-primary/10 transition-colors duration-200"
              aria-label={`Remover ${tag}`}
            >
              <X size={11} strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => draft && addTag(draft)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none px-1 min-h-7"
        />
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs text-text-muted self-center mr-1">Sugestões:</span>
          {suggestions
            .filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="inline-flex items-center px-2 py-1 rounded-md border border-dashed border-border text-xs font-semibold text-text-secondary hover:border-brand-accent hover:text-brand-primary hover:bg-brand-accent-soft/50 transition-colors duration-200 min-h-8"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
