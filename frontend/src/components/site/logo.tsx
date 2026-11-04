import Link from "next/link";
import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="ទំព័រដើម CoffeeShop">
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-lg",
          inverted ? "bg-inverse-roast/15 text-inverse-roast" : "bg-roast text-on-roast",
        )}
      >
        <Coffee className="size-5" />
      </span>
      <span
        className={cn(
          "font-heading text-[26px] leading-none font-medium",
          inverted ? "text-inverse-on-surface" : "text-roast",
        )}
      >
        CoffeeShop
      </span>
    </Link>
  );
}
