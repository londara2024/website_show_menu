import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Riel } from "./riel";
import { formatPrice, type BadgeTone, type MenuItem } from "@/lib/menu-data";

/**
 * Whether next/image may optimise this src. Admin uploads (/uploads/…) are proxied from the API
 * and served as-is (already long-cached); so are arbitrary external hosts.
 */
export const isOptimizedHost = (src: string) =>
  (src.startsWith("/") && !src.startsWith("/uploads/")) || src.startsWith("https://lh3.googleusercontent.com/");

export const BADGE_TONES: Record<BadgeTone, string> = {
  roast: "bg-roast text-on-roast",
  cocoa: "bg-cocoa text-on-cocoa",
  espresso: "bg-[#3b2116] text-white dark:bg-[#ffdbcb] dark:text-[#341100]",
  honey: "bg-[#f4bc75] text-[#4b2e00]",
  blush: "bg-cocoa-container text-on-cocoa-container",
};

export function MenuCard({
  item,
  priority = false,
  index = 0,
  khrPerUsd,
}: {
  item: MenuItem;
  priority?: boolean;
  /** Position in the list, used to stagger the entrance animation. */
  index?: number;
  /** Current riel per $ (from the API); defaults to the fallback rate. */
  khrPerUsd?: number;
}) {
  return (
    <article
      // Entrance animation replays whenever the list remounts with new results.
      // `fill-mode-backwards` only holds the start frame during the delay, so the
      // hover lift still works once the animation ends.
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className="group flex animate-in flex-col overflow-hidden rounded-2xl border border-border bg-surface-container-lowest shadow-card transition-all duration-300 fill-mode-backwards fade-in-0 slide-in-from-bottom-4 animation-duration-[500ms] hover:-translate-y-1 hover:shadow-card-hover motion-reduce:animate-none"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container">
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          priority={priority}
          // Admin-entered images can come from any host; only the seed host is optimised.
          unoptimized={!isOptimizedHost(item.image)}
          sizes="(min-width: 1024px) 280px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {item.badge && (
          <Badge
            className={cn(
              "label-badge absolute top-3 left-3 h-auto rounded-full px-2.5 py-1 shadow-sm",
              BADGE_TONES[item.badge.tone],
            )}
          >
            {item.badge.label}
          </Badge>
        )}
        <span className="label-badge absolute right-3 bottom-3 rounded-md bg-surface-container-lowest/90 px-2 py-0.5 text-cocoa backdrop-blur-sm">
          {item.tag}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
        <div className="space-y-1.5">
          <h3 className="font-heading text-[19px] leading-normal font-semibold text-on-surface transition-colors group-hover:text-roast-container">
            {item.name}
          </h3>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-on-surface-variant">{item.description}</p>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-2.5 text-center">
            {item.sizes.map((size, i) => (
              <div key={size.label} className="contents">
                {i > 0 && <div className="h-7 w-px bg-surface-container-highest" />}
                <div className="flex-1">
                  <span className="label-caps block text-cocoa">{size.label}</span>
                  <span className="mt-0.5 block text-[18px] leading-relaxed font-bold tracking-[-0.01em] text-roast">
                    {formatPrice(size.price)}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-4 font-semibold text-cocoa">
                    <Riel usd={size.price} rate={khrPerUsd} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
