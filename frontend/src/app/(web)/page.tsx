import { Suspense } from "react";
import { Customizations } from "@/components/menu/customizations";
import { Hero } from "@/components/menu/hero";
import { MenuFilters, MenuFiltersFallback } from "@/components/menu/menu-filters";
import { MenuList, MenuListSkeleton } from "@/components/menu/menu-list";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen w-full bg-background pt-20">
        <Hero />

        {/* Client island: search + category select (writes ?q= & ?category=) */}
        <section className="relative z-20 mx-auto -mt-4 mb-8 w-full max-w-[1200px] px-5 md:px-6">
          <Suspense fallback={<MenuFiltersFallback />}>
            <MenuFilters />
          </Suspense>
        </section>

        {/* Server component: reads the URL and renders the matching cards */}
        <section className="mx-auto mb-14 w-full max-w-[1200px] px-5 md:px-6">
          <Suspense fallback={<MenuListSkeleton />}>
            <MenuList searchParams={searchParams} />
          </Suspense>
        </section>

        {/* Server component: active add-ons from /admin/add-ons */}
        <Suspense>
          <Customizations />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
