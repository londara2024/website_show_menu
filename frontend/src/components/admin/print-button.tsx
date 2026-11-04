"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ label = "បោះពុម្ព" }: { label?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => window.print()}
      className="h-11 rounded-xl border-outline-variant px-4 text-[14px] font-semibold text-roast-container hover:bg-surface-container hover:text-roast-container"
    >
      <Printer className="size-[18px]" />
      {label}
    </Button>
  );
}
