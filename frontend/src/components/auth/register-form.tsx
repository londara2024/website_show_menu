"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { registerAction, type RegisterState } from "@/lib/auth-actions";
import { FormField } from "./form-field";

const INITIAL: RegisterState = { errors: {}, values: { name: "", email: "", terms: false } };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, INITIAL);
  const { errors, values: v } = state;

  return (
    // Keyed on the returned values so fields (and the Radix checkbox) keep what was typed after an error.
    <form key={JSON.stringify(v)} action={formAction} noValidate className="space-y-5">
      {errors.form && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-[14px] font-semibold text-destructive">
          {errors.form}
        </p>
      )}

      <FormField
        id="name"
        name="name"
        label="ឈ្មោះពេញ"
        icon={User}
        placeholder="សុខ ដារា"
        autoComplete="name"
        defaultValue={v.name}
        error={errors.name}
      />
      <FormField
        id="email"
        name="email"
        type="email"
        label="អ៊ីមែល"
        icon={Mail}
        placeholder="you@example.com"
        autoComplete="email"
        defaultValue={v.email}
        error={errors.email}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="password"
          name="password"
          type="password"
          label="ពាក្យសម្ងាត់"
          icon={Lock}
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password}
        />
        <FormField
          id="confirm"
          name="confirm"
          type="password"
          label="បញ្ជាក់ពាក្យសម្ងាត់"
          icon={Lock}
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirm}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="terms"
            name="terms"
            defaultChecked={v.terms}
            aria-invalid={!!errors.terms}
            className="mt-0.5 size-[18px] rounded-[5px] border-outline-variant"
          />
          <Label htmlFor="terms" className="block text-[13px] leading-relaxed font-normal text-on-surface-variant">
            ខ្ញុំយល់ព្រមលើ{" "}
            <Link href="#" className="font-semibold text-roast-container hover:underline">
              លក្ខខណ្ឌប្រើប្រាស់
            </Link>{" "}
            និង{" "}
            <Link href="#" className="font-semibold text-roast-container hover:underline">
              គោលការណ៍ឯកជនភាព
            </Link>
            ។
          </Label>
        </div>
        {errors.terms && <p className="text-[13px] text-destructive">{errors.terms}</p>}
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-xl bg-roast-container text-[15px] font-bold text-on-roast hover:bg-roast dark:bg-roast dark:hover:bg-roast-container"
      >
        {pending ? "កំពុងបង្កើតគណនី…" : "បង្កើតគណនី"}
        {!pending && <ArrowRight className="size-[18px]" />}
      </Button>
    </form>
  );
}
