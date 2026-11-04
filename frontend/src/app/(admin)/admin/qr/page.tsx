import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Coffee, Download, Pencil } from "lucide-react";
import { AdminActionLink, AdminOnly, StatusBadge } from "@/components/admin/admin-access";
import { AdminNotice, AdminPageHeader, AdminPanel, StatCard } from "@/components/admin/admin-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { PrintButton } from "@/components/admin/print-button";
import { StatusSwitch } from "@/components/admin/status-switch";
import { CATEGORY_LABELS } from "@/lib/menu-data";
import { menuUrl, qrSvg } from "@/lib/qr";
import { getQrCodes, type QrCode } from "@/lib/qr-codes";
import { canManageMenu } from "@/lib/session";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import { deleteQrCodeAction, setQrCodeActiveAction } from "./actions";

export const metadata: Metadata = { title: "QR កូដ" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const downloadClass =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-outline-variant px-3 text-[13px] font-semibold text-roast-container transition-colors hover:bg-surface-container";

export default function QrPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <div className="print:hidden">
        <AdminPageHeader
          title="QR កូដ"
          subtitle="ស្កេនដើម្បីបើកម៉ឺនុយភ្លាមៗ។ បោះពុម្ពដាក់លើតុ ឬនៅបញ្ជរ។"
          action={
            <div className="flex flex-wrap gap-2">
              <PrintButton label="បោះពុម្ពទាំងអស់" />
              <Suspense>
                <AdminOnly>
                  <AdminActionLink href="/admin/qr/new" label="បន្ថែម QR កូដ" />
                </AdminOnly>
              </Suspense>
            </div>
          }
        />
      </div>
      <Suspense fallback={<AdminPanel className="h-[520px] animate-pulse" />}>
        <QrCodeList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function QrCodeList({ searchParams }: { searchParams: SearchParams }) {
  await connection(); // SITE_URL / request host and the codes are read at request time
  const { notice } = await searchParams;
  const [codes, canManage, siteUrl] = await Promise.all([getQrCodes(), canManageMenu(), getSiteUrl()]);
  const activeCount = codes.filter((q) => q.active).length;
  const svgs = await Promise.all(codes.map((q) => qrSvg(menuUrl(siteUrl, q.category))));

  return (
    <>
      <div className="print:hidden">
        <AdminNotice notice={notice} />
        <div className="mb-5 grid grid-cols-3 gap-3">
          <StatCard label="សរុប" value={codes.length} />
          <StatCard label="ប្រើប្រាស់" value={activeCount} tone="on" />
          <StatCard label="បិទ" value={codes.length - activeCount} tone="off" />
        </div>
      </div>

      {codes.length === 0 ? (
        <AdminPanel className="px-5 py-10 text-center text-[14px] text-on-surface-variant">
          មិនទាន់មាន QR កូដទេ។
        </AdminPanel>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2">
          {codes.map((q, i) => (
            <QrCodeCard key={q.id} code={q} svg={svgs[i]} canManage={canManage} />
          ))}
        </div>
      )}
    </>
  );
}

function QrCodeCard({ code: q, svg, canManage }: { code: QrCode; svg: string; canManage: boolean }) {
  const params = q.category ? `category=${encodeURIComponent(q.category)}&` : "";

  return (
    // Inactive codes stay visible here but are left off the printed sheet.
    <AdminPanel
      className={cn(
        "flex flex-col break-inside-avoid print:border-0 print:shadow-none",
        !q.active && "opacity-60 print:hidden",
      )}
    >
      {/* The part that gets printed */}
      <div className="p-6 text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-roast">
          <Coffee className="size-5" />
          <span className="text-[20px] leading-none font-medium">CoffeeShop</span>
        </div>
        <div
          role="img"
          aria-label={`QR កូដ ${q.name}`}
          className="mx-auto w-full max-w-[240px] rounded-2xl bg-white p-2 [&>svg]:h-auto [&>svg]:w-full"
          // Generated server-side by the `qrcode` library from our own URL — not user HTML.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p className="mt-3 text-[17px] font-bold text-on-surface" data-testid="qr-name">
          {q.name}
        </p>
        <p className="text-[14px] text-cocoa">
          ស្កេនដើម្បីមើលម៉ឺនុយ{q.category && ` · ${CATEGORY_LABELS[q.category]}`}
        </p>
      </div>

      <div className="mt-auto space-y-3 border-t border-border p-4 print:hidden">
        <div className="flex items-center justify-between gap-2">
          {canManage ? (
            <StatusSwitch
              active={q.active}
              label={q.name}
              subject=""
              onLabel="ប្រើប្រាស់"
              action={setQrCodeActiveAction.bind(null, q.id)}
            />
          ) : (
            <StatusBadge active={q.active} onLabel="ប្រើប្រាស់" />
          )}
          {canManage && (
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/qr/${q.id}/edit`}
                aria-label={`កែប្រែ ${q.name}`}
                className="inline-flex size-7 items-center justify-center rounded-lg text-roast transition-colors hover:bg-surface-container"
              >
                <Pencil className="size-4" />
              </Link>
              <DeleteButton label={q.name} action={deleteQrCodeAction.bind(null, q.id)} />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <a href={`/qr.png?${params}size=1024&download=${q.id}`} download className={downloadClass}>
            <Download className="size-4" /> PNG
          </a>
          <a href={`/qr.svg?${params}download=${q.id}`} download className={downloadClass}>
            <Download className="size-4" /> SVG
          </a>
        </div>
      </div>
    </AdminPanel>
  );
}
