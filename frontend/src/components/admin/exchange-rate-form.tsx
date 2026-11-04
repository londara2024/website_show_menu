"use client";

import { useActionState, useState } from "react";
import { LoaderCircle } from "lucide-react";
import type { RateFormState } from "@/app/(admin)/admin/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, formatRate, toRiel } from "@/lib/menu-data";
import { cn } from "@/lib/utils";
import { AdminPanel, FieldRow, adminInputClass } from "./admin-ui";

const EXAMPLES = [1, 2.5, 3.75, 5];

/** ADMIN form to change riel per dollar, with a live preview of how prices will look. */
export function ExchangeRateForm({
  action,
  current,
}: {
  action: (state: RateFormState, formData: FormData) => Promise<RateFormState>;
  current: number;
}) {
  const [state, formAction, pending] = useActionState(action, { errors: {}, values: { khrPerUsd: String(current) } });
  const [typed, setTyped] = useState(state.values.khrPerUsd);
  const preview = Number(typed.replace(/[,\s]/g, ""));
  const valid = Number.isInteger(preview) && preview >= 1000 && preview <= 10000;

  return (
    <form key={JSON.stringify(state.values)} action={formAction} noValidate className="max-w-xl">
      <AdminPanel className="space-y-5 p-5 md:p-6">
        {state.errors.form && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-[14px] font-semibold text-destructive">
            {state.errors.form}
          </p>
        )}

        <FieldRow
          label="អត្រា (រៀល ក្នុង 1 ដុល្លារ)"
          htmlFor="khrPerUsd"
          error={state.errors.khrPerUsd}
          hint="លេខគត់ចន្លោះ 1,000 ដល់ 10,000"
        >
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-[15px] font-semibold text-on-surface">1 $ =</span>
            <div className="relative flex-1">
              <Input
                id="khrPerUsd"
                name="khrPerUsd"
                inputMode="numeric"
                defaultValue={state.values.khrPerUsd}
                onChange={(e) => setTyped(e.target.value)}
                aria-invalid={!!state.errors.khrPerUsd}
                className={cn(adminInputClass, "pr-9 text-[17px] font-semibold")}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[18px] text-cocoa">៛</span>
            </div>
          </div>
        </FieldRow>

        <div className="rounded-xl bg-surface-container-low p-4">
          <div className="label-caps mb-2 text-on-surface-variant">មើលជាមុន</div>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[14px] sm:grid-cols-4">
            {EXAMPLES.map((usd) => (
              <li key={usd} className="flex flex-col">
                <span className="font-semibold text-roast">{formatPrice(usd)}</span>
                <span className="text-cocoa">{valid ? `${toRiel(usd, preview).toLocaleString("en-US")}៛` : "—"}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-outline">បច្ចុប្បន្ន: {formatRate(current)}</span>
          <Button
            type="submit"
            disabled={pending}
            className="h-11 rounded-xl bg-roast-container px-6 text-[15px] font-bold text-on-roast hover:bg-roast dark:bg-roast dark:hover:bg-roast-container"
          >
            {pending && <LoaderCircle className="size-[18px] animate-spin" />}
            {pending ? "កំពុងរក្សាទុក…" : "រក្សាទុក"}
          </Button>
        </div>
      </AdminPanel>
    </form>
  );
}
