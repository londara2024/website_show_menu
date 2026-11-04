"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Two-step delete: first click asks for confirmation, second click deletes. */
export function DeleteButton({ label, action }: { label: string; action: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`លុប ${label}`}
        onClick={() => setConfirming(true)}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 />
      </Button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => action())}
        className="bg-destructive text-white hover:bg-destructive/90 dark:text-[#3b0907]"
      >
        {pending ? "កំពុងលុប…" : "លុប"}
      </Button>
      <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => setConfirming(false)}>
        បោះបង់
      </Button>
    </span>
  );
}
