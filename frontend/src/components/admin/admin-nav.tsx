"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Banknote, Coffee, Milk, QrCode, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/products", label: "ផលិតផល", icon: Coffee },
  { href: "/admin/add-ons", label: "ទឹកដោះ និងគ្រឿងបន្ថែម", icon: Milk },
  { href: "/admin/settings", label: "អត្រាប្តូរប្រាក់", icon: Banknote },
  { href: "/admin/qr", label: "QR កូដ", icon: QrCode },
];

/** Highlights the current section. Must sit inside <Suspense> (it reads the URL). */
export function AdminNav() {
  return <NavLinks pathname={usePathname()} />;
}

/** Same links with nothing highlighted — the Suspense fallback for <AdminNav>. */
export function AdminNavFallback() {
  return <NavLinks pathname="" />;
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="scrollbar-none flex gap-1 overflow-x-auto" aria-label="ម៉ឺនុយគ្រប់គ្រង">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-semibold whitespace-nowrap transition-colors",
              active
                ? "bg-roast text-on-roast shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
