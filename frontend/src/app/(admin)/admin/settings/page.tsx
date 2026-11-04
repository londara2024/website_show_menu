import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { AdminNotice, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { ExchangeRateForm } from "@/components/admin/exchange-rate-form";
import { getExchangeRate } from "@/lib/exchange-rate";
import { formatPrice, formatRate, toRiel } from "@/lib/menu-data";
import { canManageMenu } from "@/lib/session";
import { updateExchangeRateAction } from "./actions";

export const metadata: Metadata = { title: "អត្រាប្តូរប្រាក់" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <AdminPageHeader
        title="អត្រាប្តូរប្រាក់"
        subtitle="អត្រាដុល្លារទៅរៀល សម្រាប់បង្ហាញតម្លៃជារៀលនៅលើម៉ឺនុយ។ ការកែប្រែមានប្រសិទ្ធភាពភ្លាមៗ។"
      />
      <Suspense fallback={<AdminPanel className="h-[340px] max-w-xl animate-pulse" />}>
        <RateSettings searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function RateSettings({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const [{ notice }, rate, canManage] = await Promise.all([searchParams, getExchangeRate(), canManageMenu()]);
  const updated = new Date(rate.updatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

  return (
    <>
      <AdminNotice notice={notice} />
      {canManage ? (
        <ExchangeRateForm action={updateExchangeRateAction} current={rate.khrPerUsd} />
      ) : (
        // View-only for customers.
        <AdminPanel className="max-w-xl space-y-3 p-5 md:p-6">
          <div className="text-[28px] leading-normal font-bold text-on-surface">{formatRate(rate.khrPerUsd)}</div>
          <p className="text-[14px] text-on-surface-variant">
            ឧទាហរណ៍: {formatPrice(2.5)} = {toRiel(2.5, rate.khrPerUsd).toLocaleString("en-US")}៛
          </p>
        </AdminPanel>
      )}
      <p className="mt-3 text-[12px] text-outline">
        កែប្រែចុងក្រោយ: {updated}
        {rate.updatedBy && <> · {rate.updatedBy}</>}
      </p>
    </>
  );
}
