"use client";

import { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = Omit<React.ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  hint?: React.ReactNode;
};

export const inputClass =
  "h-12 rounded-xl border-outline-variant bg-surface-container-lowest pl-11 text-[15px] text-on-surface placeholder:text-cocoa/80 focus-visible:border-roast-container focus-visible:ring-roast-container/20 dark:bg-surface-container-low";

export function FormField({ id, label, icon: Icon, error, hint, type = "text", className, ...props }: FormFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="label-caps text-on-surface-variant">
          {label}
        </Label>
        {hint}
      </div>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-roast" />
        <Input
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(inputClass, isPassword && "pr-11", className)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "លាក់ពាក្យសម្ងាត់" : "បង្ហាញពាក្យសម្ងាត់"}
            className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-cocoa transition-colors hover:bg-surface-container hover:text-roast"
          >
            {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
