import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink } from "lucide-react";
import { ViewOnlyBanner } from "@/components/admin/admin-access";
import { AdminNav, AdminNavFallback } from "@/components/admin/admin-nav";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const metadata: Metadata = {
  title: { default: "ផ្ទាំងគ្រប់គ្រង — CoffeeShop", template: "%s — ផ្ទាំងគ្រប់គ្រង CoffeeShop" },
  robots: { index: false, follow: false },
};

// Admin shell. Access: src/proxy.ts sends logged-out visitors to /login. Any signed-in user
// may enter — ADMINs manage the menu, CUSTOMERs see it view-only (controls hidden, and the
// Spring Boot API rejects their changes with 403).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-surface-container-low/50">
      <header className="sticky top-0 z-40 print:hidden border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-5 md:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="label-badge rounded-full bg-cocoa-container px-2.5 py-1 text-on-cocoa-container">ផ្ទាំងគ្រប់គ្រង</span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold text-cocoa transition-colors hover:bg-surface-container hover:text-roast sm:inline-flex"
            >
              មើលហាង
              <ExternalLink className="size-3.5" />
            </Link>
            <ThemeToggle />
            <Suspense>
              <AdminUserMenu />
            </Suspense>
          </div>
        </div>
        <div className="mx-auto max-w-[1200px] px-5 pb-3 md:px-6">
          <Suspense fallback={<AdminNavFallback />}>
            <AdminNav />
          </Suspense>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-6">
        <div className="print:hidden">
          <Suspense>
            <ViewOnlyBanner />
          </Suspense>
        </div>
        {children}
      </main>
    </div>
  );
}
