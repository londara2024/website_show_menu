import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { PackageOpen, Pencil } from "lucide-react";
import { AdminActionLink, AdminOnly, StatusBadge } from "@/components/admin/admin-access";
import { AdminListSkeleton } from "@/components/admin/admin-skeleton";
import { AdminNotice, AdminPageHeader, AdminPanel, StatCard } from "@/components/admin/admin-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusSwitch } from "@/components/admin/status-switch";
import { isOptimizedHost } from "@/components/menu/menu-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CATEGORY_LABELS, formatPrice } from "@/lib/menu-data";
import { getProducts } from "@/lib/products";
import { canManageMenu } from "@/lib/session";
import { cn } from "@/lib/utils";
import { deleteProductAction, setProductActiveAction } from "./actions";

export const metadata: Metadata = { title: "ផលិតផល" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const STATUS_TABS = [
  { value: "all", label: "ទាំងអស់" },
  { value: "active", label: "កំពុងលក់" },
  { value: "inactive", label: "បិទ" },
] as const;

export default function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <AdminPageHeader
        title="ផលិតផល"
        subtitle="គ្រប់គ្រងភេសជ្ជៈនៅលើម៉ឺនុយ — បន្ថែម កែប្រែ លុប ឬបើក/បិទការលក់។"
        action={
          <Suspense>
            <AdminOnly>
              <AdminActionLink href="/admin/products/new" label="បន្ថែមផលិតផល" />
            </AdminOnly>
          </Suspense>
        }
      />
      <Suspense fallback={<AdminListSkeleton />}>
        <ProductsTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ProductsTable({ searchParams }: { searchParams: SearchParams }) {
  await connection(); // always read the latest file, never a prerendered copy
  const params = await searchParams;
  const status = STATUS_TABS.some((t) => t.value === params.status) ? (params.status as string) : "all";

  const [products, canManage] = await Promise.all([getProducts(), canManageMenu()]);
  const activeCount = products.filter((p) => p.active).length;
  const shown = products.filter((p) => status === "all" || (status === "active" ? p.active : !p.active));

  return (
    <>
      <AdminNotice notice={params.notice} />

      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatCard label="សរុប" value={products.length} />
        <StatCard label="កំពុងលក់" value={activeCount} tone="on" />
        <StatCard label="បិទ" value={products.length - activeCount} tone="off" />
      </div>

      <div className="mb-3 flex gap-1.5" role="tablist" aria-label="តម្រងស្ថានភាព">
        {STATUS_TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value === "all" ? "/admin/products" : `/admin/products?status=${t.value}`}
            role="tab"
            aria-selected={status === t.value}
            className={cn(
              "rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors",
              status === t.value
                ? "bg-roast text-on-roast"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <AdminPanel className="overflow-hidden">
        {shown.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-on-surface-variant">
            <PackageOpen className="size-10 text-outline" />
            <p className="text-[15px]">មិនមានផលិតផលក្នុងតម្រងនេះទេ។</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="pl-5 text-cocoa">ផលិតផល</TableHead>
                <TableHead className="text-cocoa">ប្រភេទ</TableHead>
                <TableHead className="text-cocoa">តម្លៃ (តូច – ធំ)</TableHead>
                <TableHead className="text-cocoa">ស្ថានភាព</TableHead>
                {canManage && <TableHead className="pr-5 text-right text-cocoa">សកម្មភាព</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((p) => (
                <TableRow key={p.id} className={cn("border-border", !p.active && "opacity-60")}>
                  <TableCell className="py-3 pl-5">
                    <div className="flex min-w-56 items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                        <Image
                          src={p.image}
                          alt=""
                          fill
                          sizes="48px"
                          unoptimized={!isOptimizedHost(p.image)}
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-semibold text-on-surface">{p.name}</div>
                        <div className="truncate text-[12px] text-outline">
                          {p.tag}
                          {p.badge && <> · {p.badge.label}</>}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.categories.map((c) => (
                        <span key={c} className="rounded-full bg-surface-container px-2 py-0.5 text-[12px] text-on-surface-variant">
                          {CATEGORY_LABELS[c]}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-[14px] font-semibold whitespace-nowrap text-roast">
                    {formatPrice(p.sizes[0].price)} – {formatPrice(p.sizes[p.sizes.length - 1].price)}
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <StatusSwitch active={p.active} label={p.name} action={setProductActiveAction.bind(null, p.id)} />
                    ) : (
                      <StatusBadge active={p.active} />
                    )}
                  </TableCell>
                  {canManage && (
                  <TableCell className="pr-5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        aria-label={`កែប្រែ ${p.name}`}
                        className="inline-flex size-7 items-center justify-center rounded-lg text-roast transition-colors hover:bg-surface-container"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <DeleteButton label={p.name} action={deleteProductAction.bind(null, p.id)} />
                    </div>
                  </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </AdminPanel>
    </>
  );
}
