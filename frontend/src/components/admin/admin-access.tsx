import Link from "next/link";
import { Eye, Lock, Plus } from "lucide-react";
import { canManageMenu } from "@/lib/session";
import { cn } from "@/lib/utils";
import { AdminPanel } from "./admin-ui";

// Customers can open /admin view-only; only ADMIN may change the menu. The API enforces
// that (403 for customers on every change) — these components just hide what they can't use.
// The async ones read the session, so render them inside <Suspense>.

/** Renders `children` only for admins; everyone else gets `fallback`. */
export async function AdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (await canManageMenu()) ? children : fallback;
}

/** Banner at the top of every admin page for view-only users. */
export async function ViewOnlyBanner() {
  if (await canManageMenu()) return null;
  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-2xl border border-cocoa/20 bg-cocoa-container/40 px-4 py-3 text-[14px] leading-relaxed text-on-cocoa-container"
    >
      <Eye className="mt-0.5 size-[18px] shrink-0" />
      <div>
        <div className="font-semibold">អ្នកកំពុងមើលប៉ុណ្ណោះ</div>
        <div>មានតែអ្នកគ្រប់គ្រងទេដែលអាចបន្ថែម កែប្រែ លុប ឬបើក/បិទផលិតផលបាន។</div>
      </div>
    </div>
  );
}

/** Shown instead of a create/edit form to view-only users. */
export function ViewOnlyNotice() {
  return (
    <AdminPanel className="flex max-w-xl flex-col items-center px-6 py-14 text-center">
      <Lock className="mb-4 size-10 text-outline" />
      <h2 className="text-[20px] font-bold text-on-surface">មិនមានសិទ្ធិកែប្រែ</h2>
      <p className="mt-1 text-[15px] leading-relaxed text-on-surface-variant">
        គណនីរបស់អ្នកអាចមើលម៉ឺនុយបានប៉ុណ្ណោះ។ សូមទាក់ទងអ្នកគ្រប់គ្រងហាង ប្រសិនបើអ្នកត្រូវការកែប្រែ។
      </p>
      <Link
        href="/admin"
        className="mt-5 inline-flex h-10 items-center rounded-xl border-[1.5px] border-roast-container px-5 text-[14px] font-semibold text-roast-container transition-colors hover:bg-roast-container/5"
      >
        ត្រឡប់ទៅបញ្ជី
      </Link>
    </AdminPanel>
  );
}

/** Read-only replacement for <StatusSwitch>. */
export function StatusBadge({ active, onLabel = "កំពុងលក់", offLabel = "បិទ" }: { active: boolean; onLabel?: string; offLabel?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold",
        active ? "bg-[#2f7d4f]/10 text-[#2f7d4f] dark:text-[#7fd1a0]" : "bg-surface-container text-outline",
      )}
    >
      <span className={cn("size-1.5 rounded-full", active ? "bg-current" : "bg-outline")} />
      {active ? onLabel : offLabel}
    </span>
  );
}

/** Primary "add" button of a list page. Wrap in <AdminOnly> so customers don't see it. */
export function AdminActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-roast-container px-5 text-[15px] font-bold text-on-roast shadow-sm transition-colors hover:bg-roast dark:bg-roast dark:hover:bg-roast-container"
    >
      <Plus className="size-[18px]" />
      {label}
    </Link>
  );
}
