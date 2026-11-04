"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { AddOnFormState, AddOnFormValues } from "@/app/(admin)/admin/add-ons/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ADDON_GROUPS, KHR_PER_USD, formatRate, toRiel } from "@/lib/menu-data";
import { cn } from "@/lib/utils";
import { AdminPanel, FieldRow, adminInputClass } from "./admin-ui";

const EMPTY_ADD_ON: AddOnFormValues = { group: "milk", name: "", price: "", active: true };

export function AddOnForm({
  action,
  initial,
  submitLabel,
  khrPerUsd = KHR_PER_USD,
}: {
  action: (state: AddOnFormState, formData: FormData) => Promise<AddOnFormState>;
  /** Omit for a blank "new add-on" form. */
  initial?: AddOnFormValues;
  submitLabel: string;
  /** Current riel per $ (from /admin/settings), for the ≈៛ hint. */
  khrPerUsd?: number;
}) {
  const [state, formAction, pending] = useActionState(action, { errors: {}, values: initial ?? EMPTY_ADD_ON });
  const v = state.values;
  const [price, setPrice] = useState(v.price);

  return (
    // Remount with the submitted values after each submit (see ProductForm).
    <form key={JSON.stringify(v)} action={formAction} noValidate className="max-w-xl">
      <AdminPanel className="space-y-5 p-5 md:p-6">
        {state.errors.form && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-[14px] font-semibold text-destructive">
            {state.errors.form}
          </p>
        )}

        <FieldRow label="ក្រុម" htmlFor="group" error={state.errors.group}>
          <Select name="group" defaultValue={v.group}>
            <SelectTrigger id="group" className={cn(adminInputClass, "h-11! w-full px-3")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className="rounded-xl border-border bg-surface-container-lowest shadow-panel">
              {ADDON_GROUPS.map((g) => (
                <SelectItem key={g.key} value={g.key}>
                  {g.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>

        <FieldRow label="ឈ្មោះ" htmlFor="name" error={state.errors.name}>
          <Input id="name" name="name" defaultValue={v.name} placeholder="ឧ. ទឹកដោះសណ្ដែក" aria-invalid={!!state.errors.name} className={adminInputClass} />
        </FieldRow>

        <FieldRow
          label="តម្លៃបន្ថែម (ដុល្លារ)"
          htmlFor="price"
          error={state.errors.price}
          hint={Number(price) > 0 ? `≈ ${toRiel(Number(price), khrPerUsd).toLocaleString("en-US")}៛ (${formatRate(khrPerUsd)})` : "បញ្ចូល 0 ប្រសិនបើឥតគិតថ្លៃ"}
        >
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[15px] text-cocoa">+$</span>
            <Input
              id="price"
              name="price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              defaultValue={v.price}
              onChange={(e) => setPrice(e.target.value)}
              aria-invalid={!!state.errors.price}
              className={cn(adminInputClass, "pl-9")}
            />
          </div>
        </FieldRow>

        <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low p-4">
          <div>
            <Label htmlFor="active" className="text-[15px] font-semibold text-on-surface">
              បង្ហាញលើម៉ឺនុយ
            </Label>
            <p className="text-[12px] text-outline">បិទ ដើម្បីលាក់ពីអតិថិជន</p>
          </div>
          <Switch
            id="active"
            name="active"
            defaultChecked={v.active}
            className="data-checked:bg-[#2f7d4f] dark:data-checked:bg-[#7fd1a0]"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            type="submit"
            disabled={pending}
            className="h-12 flex-1 rounded-xl bg-roast-container text-[15px] font-bold text-on-roast hover:bg-roast dark:bg-roast dark:hover:bg-roast-container"
          >
            {pending && <LoaderCircle className="size-[18px] animate-spin" />}
            {pending ? "កំពុងរក្សាទុក…" : submitLabel}
          </Button>
          <Button asChild variant="ghost" className="h-12 rounded-xl px-6 text-[15px] font-semibold text-on-surface-variant">
            <Link href="/admin/add-ons">បោះបង់</Link>
          </Button>
        </div>
      </AdminPanel>
    </form>
  );
}
