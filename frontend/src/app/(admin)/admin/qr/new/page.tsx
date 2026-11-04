import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly, ViewOnlyNotice } from "@/components/admin/admin-access";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { QrCodeForm } from "@/components/admin/qr-code-form";
import { createQrCodeAction } from "../actions";

export const metadata: Metadata = { title: "បន្ថែម QR កូដ" };

export default function NewQrCodePage() {
  return (
    <>
      <AdminPageHeader title="បន្ថែម QR កូដ" subtitle="ឧ. មួយសម្រាប់តុនីមួយៗ ឬមួយសម្រាប់បញ្ជរ។" />
      <Suspense fallback={<AdminPanel className="h-[360px] max-w-xl animate-pulse" />}>
        <AdminOnly fallback={<ViewOnlyNotice />}>
          <QrCodeForm action={createQrCodeAction} submitLabel="បន្ថែម" />
        </AdminOnly>
      </Suspense>
    </>
  );
}
