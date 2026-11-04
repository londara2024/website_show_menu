import { connection } from "next/server";
import { BadgeCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getActiveAddOnGroups } from "@/lib/add-ons";
import { getKhrPerUsd } from "@/lib/exchange-rate";
import { formatPrice } from "@/lib/menu-data";
import { Riel } from "./riel";

/** Server component: shows the active add-ons managed in /admin/add-ons. */
export async function Customizations() {
  await connection();
  // The add-ons board is optional; if the backend is down, just leave it out.
  const [groups, khrPerUsd] = await Promise.all([getActiveAddOnGroups().catch(() => []), getKhrPerUsd()]);
  if (groups.length === 0) return null;

  return (
    <section className="w-full bg-surface-container-low/60 py-14">
      <div className="mx-auto max-w-[1200px] px-5 md:px-6">
        <div className="rounded-3xl border border-border bg-surface-container-lowest p-6 shadow-card md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="label-caps text-cocoa">រៀបចំកែវតាមចិត្ត</span>
              <h2 className="mt-1 font-heading text-[28px] leading-normal font-medium text-on-surface">
                ទឹកដោះជំនួស និងគ្រឿងបន្ថែម
              </h2>
              <p className="text-[13px] leading-relaxed text-on-surface-variant">
                អាចកែប្រែភេសជ្ជៈណាមួយនៅបញ្ជរពេលកុម្ម៉ង់។
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-surface-container px-4 py-2 text-[13px] font-semibold text-on-surface-variant">
              <BadgeCheck className="size-4 text-roast" />
              រៀបចំស្រស់ៗដោយបារីស្តាមានវិញ្ញាបនបត្រ
            </div>
          </div>

          <Separator className="my-6 bg-surface-container-highest" />

          <div className="grid gap-8 md:grid-cols-3 md:gap-6">
            {groups.map((group) => (
              <div key={group.key}>
                <h3 className="label-caps mb-3 text-roast-container">{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-baseline justify-between gap-3 border-b border-dotted border-outline-variant py-2.5 text-[13px] last:border-0"
                    >
                      <span className="text-on-surface">{item.name}</span>
                      <span className="shrink-0 text-right">
                        <span className="font-semibold text-roast">+{formatPrice(item.price)}</span>
                        <span className="ml-1.5 text-[12px] text-cocoa">/ +<Riel usd={item.price} rate={khrPerUsd} /></span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
