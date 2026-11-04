import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly, ViewOnlyNotice } from "@/components/admin/admin-access";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";
import { getKhrPerUsd } from "@/lib/exchange-rate";
import { createProductAction } from "../actions";

export const metadata: Metadata = { title: "បន្ថែមផលិតផល" };

export default function NewProductPage() {
  return (
    <>
      <AdminPageHeader title="បន្ថែមផលិតផល" subtitle="បំពេញព័ត៌មានភេសជ្ជៈថ្មី ហើយវានឹងបង្ហាញលើម៉ឺនុយភ្លាមៗ។" />
      <Suspense fallback={<AdminPanel className="h-[560px] animate-pulse" />}>
        <AdminOnly fallback={<ViewOnlyNotice />}>
          <NewProductForm />
        </AdminOnly>
      </Suspense>
    </>
  );
}

async function NewProductForm() {
  return <ProductForm action={createProductAction} submitLabel="បន្ថែមផលិតផល" khrPerUsd={await getKhrPerUsd()} />;
}
