import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";
import { ViewOnlyNotice } from "@/components/admin/admin-access";
import { getKhrPerUsd } from "@/lib/exchange-rate";
import { getProduct } from "@/lib/products";
import { canManageMenu } from "@/lib/session";
import { updateProductAction } from "../../actions";

export const metadata: Metadata = { title: "កែប្រែផលិតផល" };

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <AdminPageHeader title="កែប្រែផលិតផល" subtitle="ការកែប្រែនឹងបង្ហាញលើម៉ឺនុយភ្លាមៗបន្ទាប់ពីរក្សាទុក។" />
      <Suspense fallback={<AdminPanel className="h-[560px] animate-pulse" />}>
        <EditProduct params={params} />
      </Suspense>
    </>
  );
}

async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  if (!(await canManageMenu())) return <ViewOnlyNotice />;
  const { id } = await params;
  const [product, khrPerUsd] = await Promise.all([getProduct(id), getKhrPerUsd()]);
  if (!product) notFound();

  return (
    <ProductForm
      action={updateProductAction.bind(null, product.id)}
      submitLabel="រក្សាទុកការកែប្រែ"
      khrPerUsd={khrPerUsd}
      initial={{
        name: product.name,
        description: product.description,
        image: product.image,
        tag: product.tag,
        badge: product.badge?.label ?? "",
        categories: product.categories,
        prices: [0, 1, 2].map((i) => String(product.sizes[i]?.price ?? "")) as [string, string, string],
        active: product.active,
      }}
    />
  );
}
