import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { MENU_ITEMS } from "@/lib/menu-data";

export const metadata: Metadata = { title: "បង្កើតគណនី — CoffeeShop" };

const matcha = MENU_ITEMS.find((i) => i.id === "matcha")!;

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="ចូលរួមជាមួយយើង"
      title="បង្កើតគណនីថ្មី"
      subtitle="រក្សាទុកភេសជ្ជៈដែលអ្នកចូលចិត្ត និងទទួលព័ត៌មានគ្រាប់កាហ្វេតាមរដូវមុនគេ។"
      image={{ src: matcha.image, alt: matcha.imageAlt }}
      quote="“កាហ្វេមួយកែវ និទានរឿងពីប្រភពរបស់វា។”"
      footer={
        <>
          មានគណនីរួចហើយ?{" "}
          <Link href="/login" className="font-semibold text-roast-container hover:underline">
            ចូលគណនី
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
