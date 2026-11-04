"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CircleCheck, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "@/lib/auth-actions";
import { FormField } from "./form-field";

const INITIAL: LoginState = { errors: {}, values: { email: "", remember: false } };

/** Reads ?next= and ?registered= — render inside <Suspense> with <LoginForm /> as the fallback. */
export function LoginFormFromUrl() {
  const params = useSearchParams();
  return <LoginForm next={params.get("next") ?? undefined} registered={params.get("registered") === "1"} />;
}

export function LoginForm({ next, registered = false }: { next?: string; registered?: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);
  const v = state.values;

  return (
    // Keyed on the returned values so fields (and the Radix checkbox) keep what was typed after an error.
    <form key={JSON.stringify(v)} action={formAction} noValidate className="space-y-5">
      {registered && !state.errors.form && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl bg-[#2f7d4f]/10 px-4 py-3 text-[14px] font-semibold text-[#2f7d4f] dark:text-[#7fd1a0]"
        >
          <CircleCheck className="size-[18px] shrink-0" />
          បានបង្កើតគណនីរួចរាល់។ សូមចូលគណនី។
        </p>
      )}
      {state.errors.form && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-[14px] font-semibold text-destructive">
          {state.errors.form}
        </p>
      )}
      {next && <input type="hidden" name="next" value={next} />}

      <FormField
        id="email"
        name="email"
        type="email"
        label="អ៊ីមែល"
        icon={Mail}
        placeholder="you@example.com"
        autoComplete="email"
        defaultValue={v.email}
        error={state.errors.email}
      />
      <FormField
        id="password"
        name="password"
        type="password"
        label="ពាក្យសម្ងាត់"
        icon={Lock}
        placeholder="ពាក្យសម្ងាត់របស់អ្នក"
        autoComplete="current-password"
        error={state.errors.password}
        hint={
          <Link href="#" className="text-[13px] font-semibold text-roast-container hover:underline">
            ភ្លេចពាក្យសម្ងាត់?
          </Link>
        }
      />

      <div className="flex items-center gap-2.5">
        <Checkbox
          id="remember"
          name="remember"
          defaultChecked={v.remember}
          className="size-[18px] rounded-[5px] border-outline-variant"
        />
        <Label htmlFor="remember" className="text-[13px] font-normal text-on-surface-variant">
          ចងចាំខ្ញុំ
        </Label>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-xl bg-roast-container text-[15px] font-bold text-on-roast hover:bg-roast dark:bg-roast dark:hover:bg-roast-container"
      >
        {pending ? "កំពុងចូល…" : "ចូលគណនី"}
        {!pending && <ArrowRight className="size-[18px]" />}
      </Button>
    </form>
  );
}
