import Link from "next/link";
import { User } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full bg-surface/90 shadow-card backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between gap-6 px-5 md:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Admin entry point. Logged-in admins land on /admin directly; everyone else is
              sent to /login?next=/admin by src/proxy.ts and comes back here after signing in. */}
          <Link
            href="/admin"
            prefetch={false}
            aria-label="ផ្ទាំងគ្រប់គ្រង (ចូលគណនី)"
            title="ផ្ទាំងគ្រប់គ្រង"
            className="flex size-9 items-center justify-center rounded-full bg-roast text-on-roast transition-colors hover:bg-roast-container focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <User className="size-[18px]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
