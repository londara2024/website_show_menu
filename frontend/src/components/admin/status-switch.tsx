"use client";

import { useOptimistic, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** Active/inactive toggle that flips instantly and rolls back if the server action fails. */
export function StatusSwitch({
  active,
  label,
  action,
  onLabel = "កំពុងលក់",
  offLabel = "បិទ",
  subject = "ការលក់",
}: {
  active: boolean;
  /** Item name, for the accessible label. */
  label: string;
  action: (next: boolean) => Promise<void>;
  /** Status text; defaults suit menu items ("on sale" / "off"). */
  onLabel?: string;
  offLabel?: string;
  /** What is switched, for the accessible name ("បិទការលក់ ឡាតេ"); "" for just "បិទ <label>". */
  subject?: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(active);
  const [pending, startTransition] = useTransition();

  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5">
      <Switch
        checked={optimistic}
        disabled={pending}
        aria-label={`${optimistic ? "បិទ" : "បើក"}${subject} ${label}`}
        onCheckedChange={(next) =>
          startTransition(async () => {
            setOptimistic(next);
            try {
              await action(next);
            } catch {
              // useOptimistic reverts to the server value once the transition ends.
            }
          })
        }
        className="data-checked:bg-[#2f7d4f] dark:data-checked:bg-[#7fd1a0]"
      />
      <span
        className={cn(
          "text-[13px] font-semibold",
          optimistic ? "text-[#2f7d4f] dark:text-[#7fd1a0]" : "text-outline",
        )}
      >
        {optimistic ? onLabel : offLabel}
      </span>
    </label>
  );
}
