import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ViewOnlyNotice } from "@/components/admin/admin-access";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { QrCodeForm } from "@/components/admin/qr-code-form";
import { getQrCode } from "@/lib/qr-codes";
import { canManageMenu } from "@/lib/session";
import { updateQrCodeAction } from "../../actions";

export const metadata: Metadata = { title: "កែប្រែ QR កូដ" };

export default function EditQrCodePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <AdminPageHeader title="កែប្រែ QR កូដ" subtitle="កូដដែលបានបោះពុម្ពរួច ត្រូវបោះពុម្ពម្ដងទៀត ប្រសិនបើប្ដូរប្រភេទ។" />
      <Suspense fallback={<AdminPanel className="h-[360px] max-w-xl animate-pulse" />}>
        <EditQrCode params={params} />
      </Suspense>
    </>
  );
}

async function EditQrCode({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  if (!(await canManageMenu())) return <ViewOnlyNotice />;
  const { id } = await params;
  const qr = await getQrCode(id);
  if (!qr) notFound();

  return (
    <QrCodeForm
      action={updateQrCodeAction.bind(null, qr.id)}
      submitLabel="រក្សាទុកការកែប្រែ"
      initial={{ name: qr.name, category: qr.category ?? "", active: qr.active }}
    />
  );
}
