import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm, LoginFormFromUrl } from "@/components/auth/login-form";
import { MENU_ITEMS } from "@/lib/menu-data";

export const metadata: Metadata = { title: "ចូលគណនី — CoffeeShop" };

const latte = MENU_ITEMS.find((i) => i.id === "latte")!;

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="សូមស្វាគមន៍ការត្រឡប់មកវិញ"
      title="ចូលគណនីរបស់អ្នក"
      subtitle="បន្តពីកន្លែងដែលអ្នកបានឈប់ — ភេសជ្ជៈដែលអ្នកចូលចិត្ត និងកំណត់ត្រារសជាតិកំពុងរង់ចាំ។"
      image={{ src: latte.image, alt: latte.imageAlt }}
      quote="“កាហ្វេឆ្ងាញ់ ពេលវេលាល្អ។”"
      footer={
        <>
          ទើបមកដល់ CoffeeShop?{" "}
          <Link href="/register" className="font-semibold text-roast-container hover:underline">
            បង្កើតគណនីថ្មី
          </Link>
        </>
      }
    >
      {/* The form reads ?next= / ?registered=; the static fallback keeps the page prerendered. */}
      <Suspense fallback={<LoginForm />}>
        <LoginFormFromUrl />
      </Suspense>
    </AuthShell>
  );
}
