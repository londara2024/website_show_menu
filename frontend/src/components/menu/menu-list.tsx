import Link from "next/link";
import { CloudOff, Coffee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BackendUnavailableError } from "@/lib/api";
import { parseCategory, type Product } from "@/lib/menu-data";
import { getKhrPerUsd } from "@/lib/exchange-rate";
import { getActiveProducts } from "@/lib/products";
import { MenuCard } from "./menu-card";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Server component: asks the backend for active products matching the URL filters and renders the cards. */
export async function MenuList({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const category = parseCategory(params.category);
  const query = typeof params.q === "string" ? params.q : "";
  const resultKey = `${category}|${query.trim().toLowerCase()}`;

  let items: Product[];
  let khrPerUsd: number;
  try {
    [items, khrPerUsd] = await Promise.all([getActiveProducts({ category, query }), getKhrPerUsd()]);
  } catch (err) {
    if (!(err instanceof BackendUnavailableError)) throw err;
    return (
      <>
        <MenuListHeader />
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-16 text-center">
          <CloudOff className="mb-4 size-10 text-outline" />
          <h3 className="font-heading text-[22px] font-semibold text-on-surface">មិនអាចផ្ទុកម៉ឺនុយបានទេ</h3>
          <p className="mt-1 text-[15px] text-on-surface-variant">សូមព្យាយាមម្ដងទៀតក្នុងពេលបន្តិចទៀត។</p>
        </div>
      </>
    );
  }

  return (
    <>
      <MenuListHeader count={items.length} />

      {items.length > 0 ? (
        // Keyed by the active filters: every new server result remounts the
        // grid, so the cards' CSS entrance animation plays again.
        <div key={resultKey} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <MenuCard key={item.id} item={item} index={i} priority={i < 4} khrPerUsd={khrPerUsd} />
          ))}
        </div>
      ) : (
        <div
          key={resultKey}
          className="flex animate-in flex-col items-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-16 text-center fade-in-0 zoom-in-95 animation-duration-[400ms] motion-reduce:animate-none"
        >
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-surface-container text-roast">
            <Coffee className="size-7" />
          </div>
          <h3 className="font-heading text-[22px] font-semibold text-on-surface">រកមិនឃើញភេសជ្ជៈ</h3>
          <p className="mt-1 text-[15px] text-on-surface-variant">
            សូមសាកល្បងស្វែងរកគ្រឿងផ្សំផ្សេង ឬកំណត់តម្រងប្រភេទឡើងវិញ។
          </p>
          <Link
            href="/"
            scroll={false}
            replace
            className="mt-5 inline-flex h-10 items-center rounded-lg border-[1.5px] border-roast-container px-5 text-sm font-semibold text-roast-container transition-colors hover:bg-roast-container/5"
          >
            កំណត់តម្រងឡើងវិញ
          </Link>
        </div>
      )}
    </>
  );
}

function MenuListHeader({ count }: { count?: number }) {
  return (
    <div className="mb-6 flex items-center justify-between pb-2">
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-[22px] leading-normal font-semibold text-on-surface">ម៉ឺនុយភេសជ្ជៈ</h2>
        {count !== undefined && (
          <Badge className="label-badge h-auto rounded-full bg-cocoa-container px-2 py-0.5 text-on-cocoa-container">
            {count} មុខ
          </Badge>
        )}
      </div>
      <div className="hidden text-[13px] text-cocoa sm:block">កុម្ម៉ង់នៅបញ្ជរ • រៀបចំដោយបារីស្តា</div>
    </div>
  );
}

/** Skeleton grid streamed first while <MenuList> renders on the server. */
export function MenuListSkeleton() {
  return (
    <>
      <MenuListHeader />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface-container-lowest shadow-card">
            <div className="aspect-[4/3] animate-pulse bg-surface-container" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-2/3 animate-pulse rounded bg-surface-container" />
              <div className="h-4 w-full animate-pulse rounded bg-surface-container-low" />
              <div className="h-16 animate-pulse rounded-xl bg-surface-container-low" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
