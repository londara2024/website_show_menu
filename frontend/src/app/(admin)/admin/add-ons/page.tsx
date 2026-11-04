import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Pencil, Plus } from "lucide-react";
import { AdminActionLink, AdminOnly, StatusBadge } from "@/components/admin/admin-access";
import { AdminListSkeleton } from "@/components/admin/admin-skeleton";
import { AdminNotice, AdminPageHeader, AdminPanel, StatCard } from "@/components/admin/admin-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusSwitch } from "@/components/admin/status-switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAddOns } from "@/lib/add-ons";
import { getKhrPerUsd } from "@/lib/exchange-rate";
import { ADDON_GROUPS, formatPrice, toRiel } from "@/lib/menu-data";
import { canManageMenu } from "@/lib/session";
import { cn } from "@/lib/utils";
import { deleteAddOnAction, setAddOnActiveAction } from "./actions";

export const metadata: Metadata = { title: "ទឹកដោះ និងគ្រឿងបន្ថែម" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function AddOnsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <AdminPageHeader
        title="ទឹកដោះជំនួស និងគ្រឿងបន្ថែម"
        subtitle="ជម្រើសដែលអតិថិជនអាចបន្ថែមលើភេសជ្ជៈណាមួយ។"
        action={
          <Suspense>
            <AdminOnly>
              <AdminActionLink href="/admin/add-ons/new" label="បន្ថែមធាតុថ្មី" />
            </AdminOnly>
          </Suspense>
        }
      />
      <Suspense fallback={<AdminListSkeleton rows={9} />}>
        <AddOnsList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function AddOnsList({ searchParams }: { searchParams: SearchParams }) {
  await connection(); // always read the latest file, never a prerendered copy
  const { notice } = await searchParams;
  const [addOns, canManage, khrPerUsd] = await Promise.all([getAddOns(), canManageMenu(), getKhrPerUsd()]);
  const activeCount = addOns.filter((a) => a.active).length;

  return (
    <>
      <AdminNotice notice={notice} />

      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatCard label="សរុប" value={addOns.length} />
        <StatCard label="កំពុងលក់" value={activeCount} tone="on" />
        <StatCard label="បិទ" value={addOns.length - activeCount} tone="off" />
      </div>

      <div className="space-y-5">
        {ADDON_GROUPS.map((group) => {
          const items = addOns.filter((a) => a.group === group.key);
          return (
            <AdminPanel key={group.key} className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                <h2 className="text-[17px] font-bold text-roast-container">
                  {group.title}
                  <span className="ml-2 text-[13px] font-normal text-outline">{items.length} មុខ</span>
                </h2>
              </div>

              {items.length === 0 ? (
                <div className="flex items-center justify-between gap-3 px-5 py-6 text-[14px] text-on-surface-variant">
                  មិនទាន់មានធាតុក្នុងក្រុមនេះទេ។
                  {canManage && (
                  <Link
                    href="/admin/add-ons/new"
                    className="inline-flex items-center gap-1 font-semibold text-roast-container hover:underline"
                  >
                    <Plus className="size-4" /> បន្ថែម
                  </Link>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="pl-5 text-cocoa">ឈ្មោះ</TableHead>
                      <TableHead className="text-cocoa">តម្លៃបន្ថែម</TableHead>
                      <TableHead className="text-cocoa">ស្ថានភាព</TableHead>
                      {canManage && <TableHead className="pr-5 text-right text-cocoa">សកម្មភាព</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((a) => (
                      <TableRow key={a.id} className={cn("border-border", !a.active && "opacity-60")}>
                        <TableCell className="min-w-48 py-3 pl-5 text-[15px] font-semibold text-on-surface">{a.name}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="text-[14px] font-semibold text-roast">+{formatPrice(a.price)}</span>
                          <span className="ml-1.5 text-[12px] text-outline">
                            +{toRiel(a.price, khrPerUsd).toLocaleString("en-US")}៛
                          </span>
                        </TableCell>
                        <TableCell>
                          {canManage ? (
                            <StatusSwitch active={a.active} label={a.name} action={setAddOnActiveAction.bind(null, a.id)} />
                          ) : (
                            <StatusBadge active={a.active} />
                          )}
                        </TableCell>
                        {canManage && (
                        <TableCell className="pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/add-ons/${a.id}/edit`}
                              aria-label={`កែប្រែ ${a.name}`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-roast transition-colors hover:bg-surface-container"
                            >
                              <Pencil className="size-4" />
                            </Link>
                            <DeleteButton label={a.name} action={deleteAddOnAction.bind(null, a.id)} />
                          </div>
                        </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </AdminPanel>
          );
        })}
      </div>
    </>
  );
}
