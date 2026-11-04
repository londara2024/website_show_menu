import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";
import { canManage } from "@/lib/jwt";
import { getSessionUser } from "@/lib/session";

/** Signed-in user's name, role and logout. Reads the session cookie, so render inside <Suspense>. */
export async function AdminUserMenu() {
  const user = await getSessionUser();
  if (!user) return null;
  const admin = canManage(user);

  return (
    <form action={logoutAction} className="flex items-center gap-1">
      <span className="hidden max-w-40 truncate text-[13px] font-semibold text-on-surface-variant md:inline" title={user.email}>
        {user.name}
      </span>
      <span
        className={
          admin
            ? "hidden rounded-full bg-roast/10 px-2 py-0.5 text-[11px] font-semibold text-roast sm:inline"
            : "hidden rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant sm:inline"
        }
      >
        {admin ? "អ្នកគ្រប់គ្រង" : "មើលប៉ុណ្ណោះ"}
      </span>
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold text-cocoa transition-colors hover:bg-surface-container hover:text-roast"
      >
        <LogOut className="size-4" />
        ចាកចេញ
      </button>
    </form>
  );
}
