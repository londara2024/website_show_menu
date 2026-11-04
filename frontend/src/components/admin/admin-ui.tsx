import { CircleCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Page title row with an optional action slot (e.g. an admin-only "add" button:
 * `<Suspense><AdminOnly><AdminActionLink … /></AdminOnly></Suspense>`).
 */
export function AdminPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-[28px] leading-normal font-bold text-on-surface">{title}</h1>
        {subtitle && <p className="text-[14px] leading-relaxed text-on-surface-variant">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const NOTICES: Record<string, string> = {
  created: "បានបន្ថែមដោយជោគជ័យ។",
  updated: "បានរក្សាទុកការកែប្រែ។",
};

/** Success banner driven by `?notice=` after a create/update redirect. */
export function AdminNotice({ notice }: { notice?: string | string[] }) {
  const message = typeof notice === "string" ? NOTICES[notice] : undefined;
  if (!message) return null;
  return (
    <div
      role="status"
      className="mb-5 flex animate-in items-center gap-2 rounded-xl border border-[#2f7d4f]/25 bg-[#2f7d4f]/10 px-4 py-3 text-[14px] font-semibold text-[#2f7d4f] fade-in-0 dark:text-[#7fd1a0]"
    >
      <CircleCheck className="size-[18px]" />
      {message}
    </div>
  );
}

export function StatCard({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "on" | "off" }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-container-lowest p-4 shadow-card">
      <div className="text-[13px] font-semibold text-cocoa">{label}</div>
      <div
        className={cn(
          "mt-1 text-[28px] leading-none font-bold",
          tone === "on" && "text-[#2f7d4f] dark:text-[#7fd1a0]",
          tone === "off" && "text-outline",
          tone === "default" && "text-on-surface",
        )}
      >
        {value}
      </div>
    </div>
  );
}

/** Rounded white panel used for tables and forms. */
export function AdminPanel({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface-container-lowest shadow-card", className)}>
      {children}
    </div>
  );
}

/** Label + control + error message. */
export function FieldRow({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="label-caps text-on-surface-variant">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-[13px] text-destructive">{error}</p>
      ) : (
        hint && <p className="text-[12px] text-outline">{hint}</p>
      )}
    </div>
  );
}

export const adminInputClass =
  "h-11 rounded-xl border-outline-variant bg-surface-container-lowest text-[15px] text-on-surface placeholder:text-cocoa/70 focus-visible:border-roast-container focus-visible:ring-roast-container/20 dark:bg-surface-container-low";
