export type Category = "Coffee" | "Latte" | "Espresso" | "Cold Drinks" | "Non-Coffee";

export const CATEGORIES: Category[] = ["Coffee", "Latte", "Espresso", "Cold Drinks", "Non-Coffee"];

export const CATEGORY_LABELS: Record<Category, string> = {
  Coffee: "កាហ្វេ",
  Latte: "ឡាតេ",
  Espresso: "អេសប្រេសូ",
  "Cold Drinks": "ភេសជ្ជៈត្រជាក់",
  "Non-Coffee": "មិនមែនកាហ្វេ",
};

export type BadgeTone = "roast" | "cocoa" | "espresso" | "honey" | "blush";

/** Ready-made photo badges the admin can pick from. */
export const BADGE_PRESETS: { label: string; tone: BadgeTone }[] = [
  { label: "ពេញនិយមក្នុងហាង", tone: "roast" },
  { label: "ពេញនិយម", tone: "cocoa" },
  { label: "ត្រាំត្រជាក់", tone: "espresso" },
  { label: "ថ្មី", tone: "honey" },
  { label: "បុគ្គលិកណែនាំ", tone: "blush" },
];

export const SIZE_LABELS = ["តូច", "មធ្យម", "ធំ"] as const;

export type SizePrice = { label: string; price: number; volume: string };

export type MenuItem = {
  id: string;
  name: string;
  categories: Category[];
  image: string;
  imageAlt: string;
  badge?: { label: string; tone: BadgeTone };
  tag: string;
  calories?: string;
  description: string;
  sizes: SizePrice[];
};

/** A menu item as stored by the admin. Only active products appear on the public menu. */
export type Product = MenuItem & { active: boolean; createdAt: string };

const IMG = "https://lh3.googleusercontent.com/aida-public/";

const sizes = (
  [s, m, l]: [number, number, number],
  [vs, vm, vl]: [string, string, string] = ["8 oz", "12 oz", "16 oz"],
): SizePrice[] => [
  { label: "តូច", price: s, volume: vs },
  { label: "មធ្យម", price: m, volume: vm },
  { label: "ធំ", price: l, volume: vl },
];

/**
 * Original catalogue. The backend's Flyway seed (V2__seed_menu.sql) is generated from this;
 * the live menu comes from the API. Also used for the photos on the auth pages.
 */
export const MENU_ITEMS: MenuItem[] = [
  {
    id: "americano",
    name: "អាមេរិកាណូ",
    categories: ["Coffee", "Espresso"],
    image:
      IMG +
      "AB6AXuDRggt_WlMhLpMIk8CUPtO0uQkRTMrjmu2CmCYHSFa6ejydR9JyffWlPbIquGiJRvBsZe1-mCaExrh7dSAGOo-aRDHW8GQO0bFS1oyGa0j4A8-zCv7lB9yYe8vkv4E9injeowzkkkI03PxeQr1Q1wQmRtQdkVoloPvxQP9yKWhQIe1Bw7wlIeqJ7GQPDrIbo9TvR-VdBzSEn2675jJcr8V3DbywYTMgQLq0JabDyd3TBMSWBx24Z_40xw",
    imageAlt: "កាហ្វេអាមេរិកាណូក្តៅក្នុងពែងសេរ៉ាមិចលើតុឈើ",
    badge: { label: "ពេញនិយមក្នុងហាង", tone: "roast" },
    tag: "លីងខ្លាំង",
    calories: "10–15 kcal",
    description:
      "អេសប្រេសូទ្វេចាក់លើទឹកក្តៅចម្រោះ បង្កើតបានស្រទាប់ក្រែម៉ាសម្បូរ និងរសជាតិខ្លាំងមានតុល្យភាព។",
    sizes: sizes([2.0, 2.5, 3.0]),
  },
  {
    id: "latte",
    name: "កាហ្វេឡាតេ",
    categories: ["Latte", "Coffee"],
    image:
      IMG +
      "AB6AXuBJqXOVhNP-xpbFp7shlA8R8Jw1Lkv4FbL9_cGQCkYpw_rvJP7p2_Fg07tCQslA2Ifz_PRyVyW9zTe5uFOrreko4XDJxPUp_qNJwHtY4MIqnom6tdz2pXP-s-O-cBRg2X37LZmbQtrvSC0TtP7YaPJzlV8Ti9fs2uBOASsqZsOEBBAurU7C-2duOhw2pOUSkLCu_JtnalEmS0mZEObrcxcjQiIuK9NI8y98KdDitkqw4rsnZF7pE8dkKw",
    imageAlt: "កាហ្វេឡាតេមានគំនូរស្លឹកឈើលើពពុះក្នុងពែងដីដុត",
    badge: { label: "ពេញនិយម", tone: "cocoa" },
    tag: "លីងមធ្យម",
    calories: "140–220 kcal",
    description:
      "អេសប្រេសូរលាយចូលក្នុងទឹកដោះគោចំហុយពពុះម៉ដ្ឋ ជាមួយគំនូរឡាតេដោយដៃយ៉ាងល្អិតល្អន់។",
    sizes: sizes([2.5, 3.5, 4.0]),
  },
  {
    id: "cappuccino",
    name: "កាពូឈីណូ",
    categories: ["Coffee", "Espresso"],
    image:
      IMG +
      "AB6AXuC-pbQ2XdWSCDy675VkBmrgBkQVFOmRmMJrAD6NV1obQLOY9Lcz6v8P50xGlbPaduv7FO0EKNh_zzoEozVm2LImBSS7CE9TGNQij6RA73-RTOcxFh6a4viTv3OxRXLBk29GsdU3fyGRZjDoYEfJOqWySqWPN2vKuDRhtR-xqzcdYkfEI8e-SCRTspRoyfIbffU5qG7Af0DpxDQdfytyfScxBPWqGbgG6bUZJULo6nYUYqtXV3o81onrfg",
    imageAlt: "កាពូឈីណូពពុះក្រាស់ រោយម្សៅកាកាវ",
    tag: "ពពុះពិសេស",
    calories: "110–180 kcal",
    description:
      "អេសប្រេសូ ទឹកដោះគោចំហុយ និងពពុះក្រាស់ក្នុងបរិមាណស្មើគ្នា រោយម្សៅកាកាវស្រាលៗ។",
    sizes: sizes([2.5, 3.5, 4.0], ["6 oz", "10 oz", "14 oz"]),
  },
  {
    id: "mocha",
    name: "កាហ្វេម៉ូកា",
    categories: ["Latte", "Coffee"],
    image:
      IMG +
      "AB6AXuDqHi0a9OLelckEbBviQ8wkvZAtp5C1k3S_K6H0bWzXYWUROy8L5xjpEnlCkhSf0aYTY7zqF2WKHc10cD-eYaPNCEzKL4JeNOaK8M0izdlVszKv83nl_XSu6XTfBu5_nR4zI1HQjezcLx628KXKmq6JNf7HeAasIuoWhFKK9wnskJe4EUcLZ8LHUv7Ie2JL6ClBuU6pPcjtLJgZKgyRSxqDn43lGEujpRpdx5ijihd2vpGzVzOl9nbv8Q",
    imageAlt: "កាហ្វេម៉ូកាបាញ់ក្រែម និងស្រោចសូកូឡា",
    badge: { label: "ពេញនិយម", tone: "cocoa" },
    tag: "សូកូឡាហូឡង់",
    calories: "230–360 kcal",
    description:
      "សូកូឡាខ្មៅហូឡង់ ច្របល់ជាមួយអេសប្រេសូ និងទឹកដោះគោចំហុយទន់រលោង។",
    sizes: sizes([3.0, 3.75, 4.5]),
  },
  {
    id: "cold-brew",
    name: "ខូលប្រ៊ូទឹកកក",
    categories: ["Cold Drinks", "Coffee"],
    image:
      IMG +
      "AB6AXuDJNQp2aLNTf4mTV7ysNMpvTkhutpm2g5eS0KTvpnh48NZ_Uw9sHbwy5hNubV3EGfiL9ZwKMQOAJbJCcwjyjxcf5Tq-otRVgHSJP2hdI7CEEnQRdsHX4hTpSVgS6igTmx3vIDirk6bh81zd6bSbitchTEkCi5zdgAvO2EPpRQw2BWVTCO8NtmpMRGRMWQCz1yuM7gCoKvbTyJI1SCQWQ-KfstiQ_yh-TI_gqH1mCh5DLwq9Ncqup65ghQ",
    imageAlt: "កាហ្វេខូលប្រ៊ូជាមួយទឹកកក",
    badge: { label: "ត្រាំត្រជាក់", tone: "espresso" },
    tag: "ត្រាំ 18 ម៉ោង",
    calories: "5–20 kcal",
    description:
      "ត្រាំក្នុងទឹកត្រជាក់ចម្រោះរយៈពេល 18 ម៉ោង បម្រើជាមួយទឹកកកថ្លា និងក្លិនក្រូចស្រាលៗ។",
    sizes: sizes([2.0, 2.75, 3.5], ["12 oz", "16 oz", "20 oz"]),
  },
  {
    id: "caramel-macchiato",
    name: "ការ៉ាមែល ម៉ាគីយ៉ាតូ",
    categories: ["Latte", "Coffee"],
    image:
      IMG +
      "AB6AXuBDGyEAItvfo7ZWoVOLEIR91Ra70wjdOLxx6hVEosmHJjSp3KVTMGuevz_ZTmB2HejtjaW0Xpz4w_cuvPoZv_uyhG_iy_Bn2sk7ck3nCuIjTP77EPVGNU4x-bM77ifUf92ARJ5SxD5Jv0ShkPxBZ9v4lwnRSZU8OwotG2lPKLyVyfOSehK7AosjBHVoCppxIBPr4rshA-kK8chPxYQuf0jV4wZQmFjjkRA4lPm55A7OX6qkYRXoHhVMXQ",
    imageAlt: "ការ៉ាមែលម៉ាគីយ៉ាតូជាស្រទាប់ៗក្នុងកែវខ្ពស់",
    badge: { label: "ថ្មី", tone: "honey" },
    tag: "ការ៉ាមែលផលិតផ្ទាល់",
    calories: "180–280 kcal",
    description:
      "ទឹកដោះគោចំហុយក្លិនវ៉ានីឡា ចាក់អេសប្រេសូខ្លាំង និងស្រោចការ៉ាមែលប៊ឺ។",
    sizes: sizes([3.0, 4.0, 4.75]),
  },
  {
    id: "matcha",
    name: "តែបៃតងម៉ាឆា",
    categories: ["Non-Coffee", "Latte"],
    image:
      IMG +
      "AB6AXuCP0tIK5ildPxbUneW4OWEvG00rvELiS4KaDdgiB9Iy_NiXrkARHB-TmVtT_T8NyoyDJQ8VrKYnUxpjJT1S7UJdxX2oO6qPsppzcmDSXWLm_-LM0Dg5kzxlaArMSvVB1I26q-_CRzqpQ-R6FfnEaDHHJjyjJHbx34iW97jUeWY3YmavExlIYhtJoT9BtMWRgbsxB3R7ObcK_hhkOkMpvearG9PSiWx-l6KYUVnq61JtVuJBV1cQgARgjA",
    imageAlt: "ម៉ាឆាឡាតេក្នុងចានសេរ៉ាមិចធ្វើដោយដៃ",
    badge: { label: "បុគ្គលិកណែនាំ", tone: "blush" },
    tag: "ម៉ាឆាអ៊ូជិ",
    calories: "120–210 kcal",
    description:
      "តែបៃតងម៉ាឆាថ្នាក់ពិធីពីអ៊ូជិ ប្រទេសជប៉ុន វាយជាមួយទឹកដោះ oat ចំហុយ និងទឹកឃ្មុំផ្កាព្រៃ។",
    sizes: sizes([2.75, 3.75, 4.5]),
  },
  {
    id: "hot-chocolate",
    name: "សូកូឡាក្តៅបែលហ្ស៊ិក",
    categories: ["Non-Coffee"],
    image:
      IMG +
      "AB6AXuAJ1jfs4SJ9ntQqWmUYtifMknZ0EzLXbo5BJFiDPSSIYSqj3LW4U_uhYbCfqmMmq6438rc4aBgomfpAArMxkIxXTgm_mvwg0ec6pJO2NyNZmOX-lLKxd2O1wfAuvV7_tudEDoHpPQtX8JcVZ_32CXEmRGvvH_HN3t_Y2ot85w9KFFAmyUqvKn7LUgJkX1aPO2SndMFLxzVu5ZaC_Ub3j5yiRMidrxHViyw0ywndw4hUFrbnI8G-_9Z5dQ",
    imageAlt: "សូកូឡាក្តៅបែលហ្ស៊ិកបាញ់ក្រែម និងសូកូឡាចិត",
    tag: "បែលហ្ស៊ិក 70%",
    calories: "260–390 kcal",
    description:
      "សូកូឡាខ្មៅបែលហ្ស៊ិក 70% រលាយជាមួយទឹកដោះគោស្រស់ ហើយបាញ់ក្រែមវ៉ានីឡាពីលើ។",
    sizes: sizes([2.5, 3.25, 4.0]),
  },
];

export type CategoryFilter = "all" | Category;

/** Reads `?category=` and falls back to "all" for missing or unknown values. */
export const parseCategory = (value: string | string[] | undefined): CategoryFilter =>
  typeof value === "string" && (CATEGORIES as string[]).includes(value) ? (value as Category) : "all";

export type AddOnGroupKey = "milk" | "espresso" | "syrup";

/** Fixed sections of the "milk alternatives & additions" board. */
export const ADDON_GROUPS: { key: AddOnGroupKey; title: string }[] = [
  { key: "milk", title: "ទឹកដោះពីរុក្ខជាតិ" },
  { key: "espresso", title: "បន្ថែមអេសប្រេសូ" },
  { key: "syrup", title: "ស៊ីរ៉ូសរីរាង្គ" },
];

export const ADDON_GROUP_LABELS = Object.fromEntries(ADDON_GROUPS.map((g) => [g.key, g.title])) as Record<
  AddOnGroupKey,
  string
>;

export type AddOn = { id: string; group: AddOnGroupKey; name: string; price: number; active: boolean };

/** Original add-ons; source of the backend's Flyway seed. The live list comes from the API. */
export const SEED_ADD_ONS: Omit<AddOn, "id" | "active">[] = [
  { group: "milk", name: "ទឹកដោះ Oat (Minor Figures)", price: 0.5 },
  { group: "milk", name: "ទឹកដោះអាល់ម៉ុន", price: 0.5 },
  { group: "milk", name: "ទឹកដោះដូង", price: 0.5 },
  { group: "espresso", name: "បន្ថែម Ristretto ទ្វេ", price: 0.75 },
  { group: "espresso", name: "ប្ដូរជាកាហ្វេគ្មានកាហ្វេអ៊ីន", price: 0.5 },
  { group: "espresso", name: "គ្រាប់កាហ្វេពិសេសតាមរដូវ", price: 1.0 },
  { group: "syrup", name: "វ៉ានីឡាម៉ាដាហ្គាស្ការ", price: 0.65 },
  { group: "syrup", name: "ផ្កាឡាវេនឌ័របារាំង", price: 0.65 },
  { group: "syrup", name: "គ្រាប់ហាហ្សែលណាត់លីង", price: 0.65 },
];

export const formatPrice = (value: number) => `$${value.toFixed(2)}`;

/**
 * Fallback USD → KHR rate. The live rate is set by admins (/admin/settings) and comes from
 * GET /api/exchange-rate; this is only used if the API can't be reached (and in tests).
 */
export const KHR_PER_USD = 4100;

/** Riel for a USD amount at `khrPerUsd`, rounded to the nearest ៛100 like café price boards. */
export const toRiel = (usd: number, khrPerUsd: number = KHR_PER_USD) => Math.round((usd * khrPerUsd) / 100) * 100;

/** "1$ = 4,100៛" */
export const formatRate = (khrPerUsd: number) => `1$ = ${khrPerUsd.toLocaleString("en-US")}៛`;
