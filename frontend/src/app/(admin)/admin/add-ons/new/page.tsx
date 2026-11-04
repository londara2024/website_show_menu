import type { Metadata } from "next";
import { AddOnForm } from "@/components/admin/add-on-form";
import { Suspense } from "react";
import { AdminOnly, ViewOnlyNotice } from "@/components/admin/admin-access";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { getKhrPerUsd } from "@/lib/exchange-rate";
import { createAddOnAction } from "../actions";

export const metadata: Metadata = { title: "បន្ថែមគ្រឿងបន្ថែម" };

export default function NewAddOnPage() {
  return (
    <>
      <AdminPageHeader title="បន្ថែមធាតុថ្មី" subtitle="ទឹកដោះជំនួស អេសប្រេសូបន្ថែម ឬស៊ីរ៉ូ។" />
      <Suspense fallback={<AdminPanel className="h-[420px] max-w-xl animate-pulse" />}>
        <AdminOnly fallback={<ViewOnlyNotice />}>
          <NewAddOnForm />
        </AdminOnly>
      </Suspense>
    </>
  );
}

async function NewAddOnForm() {
  return <AddOnForm action={createAddOnAction} submitLabel="បន្ថែម" khrPerUsd={await getKhrPerUsd()} />;
}
