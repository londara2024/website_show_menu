import { toRiel } from "@/lib/menu-data";

/** Riel amount for a USD price at `rate` (riel per $). The ៛ glyph is drawn tiny in most fonts, so it gets its own size. */
export function Riel({ usd, rate }: { usd: number; rate?: number }) {
  return (
    <span className="whitespace-nowrap">
      {toRiel(usd, rate).toLocaleString("en-US")}
      <span aria-hidden className="ml-0.5 align-[-0.1em] text-[1.45em] leading-none">
        ៛
      </span>
      <span className="sr-only"> រៀល</span>
    </span>
  );
}
