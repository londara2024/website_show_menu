"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { QrCodeFormState, QrCodeFormValues } from "@/app/(admin)/admin/qr/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/menu-data";
import { cn } from "@/lib/utils";
import { AdminPanel, FieldRow, adminInputClass } from "./admin-ui";

const EMPTY_QR_CODE: QrCodeFormValues = { name: "", category: "", active: true };

export function QrCodeForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: QrCodeFormState, formData: FormData) => Promise<QrCodeFormState>;
  /** Omit for a blank "new QR code" form. */
  initial?: QrCodeFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { errors: {}, values: initial ?? EMPTY_QR_CODE });
  const v = state.values;

  return (
    // Remount with the submitted values after each submit (see ProductForm).
    <form key={JSON.stringify(v)} action={formAction} noValidate className="max-w-xl">
      <AdminPanel className="space-y-5 p-5 md:p-6">
        {state.errors.form && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-[14px] font-semibold text-destructive">
            {state.errors.form}
          </p>
        )}

        <FieldRow label="ឈ្មោះ" htmlFor="name" error={state.errors.name} hint="បង្ហាញនៅលើកាតដែលបោះពុម្ព">
          <Input id="name" name="name" defaultValue={v.name} placeholder="ឧ. តុលេខ 1" aria-invalid={!!state.errors.name} className={adminInputClass} />
        </FieldRow>

        <FieldRow label="បើកទៅកាន់" htmlFor="category" error={state.errors.category}>
          {/* Radix Select can't hold an empty value, so "all" stands for the whole menu. */}
          <Select name="category" defaultValue={v.category || "all"}>
            <SelectTrigger id="category" className={cn(adminInputClass, "h-11! w-full px-3")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className="rounded-xl border-border bg-surface-container-lowest shadow-panel">
              <SelectItem value="all">ម៉ឺនុយទាំងមូល</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  ម៉ឺនុយ · {CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>

        <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low p-4">
          <div>
            <Label htmlFor="active" className="text-[15px] font-semibold text-on-surface">
              ប្រើប្រាស់
            </Label>
            <p className="text-[12px] text-outline">បិទ ដើម្បីដកចេញពីសន្លឹកបោះពុម្ព</p>
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
            <Link href="/admin/qr">បោះបង់</Link>
          </Button>
        </div>
      </AdminPanel>
    </form>
  );
}
