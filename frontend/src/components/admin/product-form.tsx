"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { ImageOff, LoaderCircle } from "lucide-react";
import { uploadProductImageAction, type ProductFormState, type ProductFormValues } from "@/app/(admin)/admin/products/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BADGE_PRESETS, CATEGORIES, CATEGORY_LABELS, KHR_PER_USD, SIZE_LABELS, formatRate, toRiel } from "@/lib/menu-data";
import { cn } from "@/lib/utils";
import { AdminPanel, FieldRow, adminInputClass } from "./admin-ui";
import { ImageUploadButton } from "./image-upload-button";

const EMPTY_PRODUCT: ProductFormValues = {
  name: "",
  description: "",
  image: "",
  tag: "",
  badge: "",
  categories: [],
  prices: ["", "", ""],
  active: true,
};

const NO_BADGE = "none";

export function ProductForm({
  action,
  initial,
  submitLabel,
  khrPerUsd = KHR_PER_USD,
}: {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  /** Omit for a blank "new product" form. */
  initial?: ProductFormValues;
  submitLabel: string;
  /** Current riel per $ (from /admin/settings), for the ≈៛ hints. */
  khrPerUsd?: number;
}) {
  const [state, formAction, pending] = useActionState(action, { errors: {}, values: initial ?? EMPTY_PRODUCT });
  const v = state.values;
  const [preview, setPreview] = useState(v.image);
  const [prices, setPrices] = useState(v.prices);
  const [previewFailed, setPreviewFailed] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);

  return (
    // React resets the form after each submit, and Radix controls reset to their
    // *first* defaults. Keying on the returned values remounts every field with
    // what was submitted, so nothing is lost on a validation error.
    <form key={JSON.stringify(v)} action={formAction} noValidate className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <AdminPanel className="space-y-5 p-5 md:p-6">
        {state.errors.form && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-[14px] font-semibold text-destructive">
            {state.errors.form}
          </p>
        )}

        <FieldRow label="ឈ្មោះផលិតផល" htmlFor="name" error={state.errors.name}>
          <Input id="name" name="name" defaultValue={v.name} placeholder="ឧ. កាហ្វេទឹកដោះគោទឹកកក" aria-invalid={!!state.errors.name} className={adminInputClass} />
        </FieldRow>

        <FieldRow label="ការពិពណ៌នា" htmlFor="description" error={state.errors.description} hint="បង្ហាញ 2 បន្ទាត់លើកាត (អតិបរមា 240 តួអក្សរ)">
          <Textarea
            id="description"
            name="description"
            defaultValue={v.description}
            rows={3}
            placeholder="រសជាតិ គ្រឿងផ្សំ និងរបៀបរៀបចំ…"
            aria-invalid={!!state.errors.description}
            className={cn(adminInputClass, "h-auto min-h-24 py-3 leading-relaxed")}
          />
        </FieldRow>

        <FieldRow
          label="រូបភាព"
          htmlFor="image"
          error={state.errors.image}
          hint="បង្ហោះរូបភាព (JPG, PNG, WebP, GIF ≤ 5MB) ឬបិទភ្ជាប់តំណ https://…"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <Input
              ref={imageInput}
              id="image"
              name="image"
              type="text"
              inputMode="url"
              defaultValue={v.image}
              onChange={(e) => {
                setPreview(e.target.value.trim());
                setPreviewFailed(false);
              }}
              placeholder="https://… ឬ /uploads/…"
              aria-invalid={!!state.errors.image}
              className={cn(adminInputClass, "sm:flex-1")}
            />
            <ImageUploadButton
              upload={uploadProductImageAction}
              onUploaded={(url) => {
                // The field is uncontrolled; set it directly so the form submits the new URL.
                if (imageInput.current) imageInput.current.value = url;
                setPreview(url);
                setPreviewFailed(false);
              }}
            />
          </div>
        </FieldRow>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldRow label="ស្លាកលើរូបភាព" htmlFor="tag" error={state.errors.tag} hint="ឧ. លីងមធ្យម, ត្រាំ 18 ម៉ោង">
            <Input id="tag" name="tag" defaultValue={v.tag} aria-invalid={!!state.errors.tag} className={adminInputClass} />
          </FieldRow>
          <FieldRow label="ផ្លាកសញ្ញា" htmlFor="badge">
            <Select name="badge" defaultValue={v.badge || NO_BADGE}>
              <SelectTrigger id="badge" className={cn(adminInputClass, "h-11! w-full px-3")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="rounded-xl border-border bg-surface-container-lowest shadow-panel">
                <SelectItem value={NO_BADGE}>គ្មាន</SelectItem>
                {BADGE_PRESETS.map((b) => (
                  <SelectItem key={b.label} value={b.label}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </div>

        <fieldset className="space-y-3">
          <legend className="label-caps mb-2 text-on-surface-variant">ប្រភេទ</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {CATEGORIES.map((c) => (
              <div key={c} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${c}`}
                  name="categories"
                  value={c}
                  defaultChecked={v.categories.includes(c)}
                  className="size-[18px] rounded-[5px] border-outline-variant"
                />
                <Label htmlFor={`cat-${c}`} className="text-[14px] font-normal text-on-surface">
                  {CATEGORY_LABELS[c]}
                </Label>
              </div>
            ))}
          </div>
          {state.errors.categories && <p className="text-[13px] text-destructive">{state.errors.categories}</p>}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-2 flex w-full items-center justify-between gap-2">
            <span className="label-caps text-on-surface-variant">តម្លៃ (ដុល្លារ)</span>
            <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-[12px] font-semibold text-cocoa" title="អត្រាប្តូរប្រាក់">
              {formatRate(khrPerUsd)}
            </span>
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {SIZE_LABELS.map((size, i) => (
              <div key={size} className="space-y-1.5">
                <Label htmlFor={`price-${i}`} className="text-[13px] text-cocoa">
                  {size}
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[15px] text-cocoa">$</span>
                  <Input
                    id={`price-${i}`}
                    name={`price-${i}`}
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.05"
                    defaultValue={v.prices[i]}
                    onChange={(e) => setPrices((p) => p.map((x, j) => (j === i ? e.target.value : x)) as typeof p)}
                    aria-invalid={!!state.errors.prices}
                    className={cn(adminInputClass, "pl-7")}
                  />
                </div>
                <p className="text-[12px] text-outline">
                  {Number(prices[i]) > 0 ? `≈ ${toRiel(Number(prices[i]), khrPerUsd).toLocaleString("en-US")}៛` : " "}
                </p>
              </div>
            ))}
          </div>
          {state.errors.prices && <p className="text-[13px] text-destructive">{state.errors.prices}</p>}
        </fieldset>
      </AdminPanel>

      <div className="space-y-4">
        <AdminPanel className="overflow-hidden">
          <div className="relative flex aspect-[4/3] items-center justify-center bg-surface-container">
            {preview && !previewFailed ? (
              // eslint-disable-next-line @next/next/no-img-element -- live preview of any URL the admin types
              <img src={preview} alt="" className="absolute inset-0 size-full object-cover" onError={() => setPreviewFailed(true)} />
            ) : (
              <div className="flex flex-col items-center gap-2 text-outline">
                <ImageOff className="size-8" />
                <span className="text-[13px]">{previewFailed ? "បើករូបភាពមិនបាន" : "មើលរូបភាពជាមុន"}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 p-4">
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
        </AdminPanel>

        <div className="flex gap-2 lg:flex-col">
          <Button
            type="submit"
            disabled={pending}
            className="h-12 flex-1 rounded-xl bg-roast-container text-[15px] font-bold text-on-roast hover:bg-roast lg:flex-none dark:bg-roast dark:hover:bg-roast-container"
          >
            {pending && <LoaderCircle className="size-[18px] animate-spin" />}
            {pending ? "កំពុងរក្សាទុក…" : submitLabel}
          </Button>
          <Button asChild variant="ghost" className="h-12 flex-1 rounded-xl text-[15px] font-semibold text-on-surface-variant lg:flex-none">
            <Link href="/admin/products">បោះបង់</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}
