import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { AddOnForm } from "@/components/admin/add-on-form";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { ViewOnlyNotice } from "@/components/admin/admin-access";
import { getAddOn } from "@/lib/add-ons";
import { getKhrPerUsd } from "@/lib/exchange-rate";
import { canManageMenu } from "@/lib/session";
import { updateAddOnAction } from "../../actions";

export const metadata: Metadata = { title: "កែប្រែគ្រឿងបន្ថែម" };

export default function EditAddOnPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <AdminPageHeader title="កែប្រែធាតុ" subtitle="ការកែប្រែនឹងបង្ហាញលើម៉ឺនុយភ្លាមៗបន្ទាប់ពីរក្សាទុក។" />
      <Suspense fallback={<AdminPanel className="h-[420px] max-w-xl animate-pulse" />}>
        <EditAddOn params={params} />
      </Suspense>
    </>
  );
}

async function EditAddOn({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  if (!(await canManageMenu())) return <ViewOnlyNotice />;
  const { id } = await params;
  const [addOn, khrPerUsd] = await Promise.all([getAddOn(id), getKhrPerUsd()]);
  if (!addOn) notFound();

  return (
    <AddOnForm
      action={updateAddOnAction.bind(null, addOn.id)}
      submitLabel="រក្សាទុកការកែប្រែ"
      khrPerUsd={khrPerUsd}
      initial={{ group: addOn.group, name: addOn.name, price: String(addOn.price), active: addOn.active }}
    />
  );
}
