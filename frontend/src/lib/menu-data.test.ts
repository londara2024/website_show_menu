// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  ADDON_GROUP_LABELS,
  ADDON_GROUPS,
  CATEGORIES,
  CATEGORY_LABELS,
  KHR_PER_USD,
  MENU_ITEMS,
  SEED_ADD_ONS,
  formatPrice,
  formatRate,
  parseCategory,
  toRiel,
} from "./menu-data";

describe("formatPrice", () => {
  it.each([
    [2, "$2.00"],
    [2.5, "$2.50"],
    [3.75, "$3.75"],
    [0, "$0.00"],
  ])("%s → %s", (value, expected) => {
    expect(formatPrice(value)).toBe(expected);
  });
});

describe("toRiel", () => {
  it("converts at the fixed rate", () => {
    expect(KHR_PER_USD).toBe(4100);
    expect(toRiel(2)).toBe(8200);
  });

  it("rounds to the nearest ៛100", () => {
    expect(toRiel(0.65)).toBe(2700); // 2665 → 2700
    expect(toRiel(3.75)).toBe(15400); // 15375 → 15400
    expect(toRiel(0.5)).toBe(2100); // 2050 → 2100
  });
});

describe("toRiel with a custom rate", () => {
  it("uses the given riel-per-dollar rate", () => {
    expect(toRiel(2, 4000)).toBe(8000);
    expect(toRiel(2.5, 4050)).toBe(10100); // 10125 → 10100
    expect(toRiel(3.75, 4200)).toBe(15800); // 15750 → 15800
  });

  it("falls back to the default rate", () => {
    expect(toRiel(1)).toBe(toRiel(1, KHR_PER_USD));
  });
});

describe("formatRate", () => {
  it("formats as 1$ = N៛", () => {
    expect(formatRate(4100)).toBe("1$ = 4,100៛");
    expect(formatRate(10000)).toBe("1$ = 10,000៛");
  });
});

describe("parseCategory", () => {
  it("accepts every known category key", () => {
    for (const c of CATEGORIES) expect(parseCategory(c)).toBe(c);
  });

  it.each([undefined, "", "bogus", "coffee", ["Latte"]])("falls back to 'all' for %j", (value) => {
    expect(parseCategory(value as string | string[] | undefined)).toBe("all");
  });
});

describe("static data", () => {
  it("has a Khmer label for every category and add-on group", () => {
    for (const c of CATEGORIES) expect(CATEGORY_LABELS[c]).toMatch(/[ក-៿]/);
    for (const g of ADDON_GROUPS) expect(ADDON_GROUP_LABELS[g.key]).toBe(g.title);
  });

  it("seed data is consistent (it becomes the backend's Flyway seed)", () => {
    expect(MENU_ITEMS).toHaveLength(8);
    expect(new Set(MENU_ITEMS.map((p) => p.id)).size).toBe(MENU_ITEMS.length);
    for (const p of MENU_ITEMS) {
      expect(p.sizes).toHaveLength(3);
      expect(p.categories.length).toBeGreaterThan(0);
      for (const c of p.categories) expect(CATEGORIES).toContain(c);
      for (const s of p.sizes) expect(s.price).toBeGreaterThan(0);
    }
    expect(SEED_ADD_ONS).toHaveLength(9);
    for (const a of SEED_ADD_ONS) expect(ADDON_GROUPS.map((g) => g.key)).toContain(a.group);
  });
});
