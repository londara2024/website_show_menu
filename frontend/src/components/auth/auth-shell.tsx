import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: { src: string; alt: string };
  quote: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthShell({ eyebrow, title, subtitle, image, quote, children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen w-full bg-background">
      {/* Atmospheric photo panel */}
      <aside className="relative hidden w-[46%] max-w-[640px] overflow-hidden lg:block">
        <Image src={image.src} alt={image.alt} fill priority sizes="46vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1009]/90 via-[#1c1009]/40 to-[#1c1009]/10" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo inverted />
          <div className="max-w-md space-y-4">
            <span className="label-caps text-[#fdb793]">ហាងកាហ្វេ CoffeeShop</span>
            <p className="font-heading text-[32px] leading-normal font-medium text-[#f3f0eb]">{quote}</p>
            <p className="text-[15px] leading-relaxed text-[#f3f0eb]/80">
              កាហ្វេលីងបាច់តូច គ្រាប់កាហ្វេតាមរដូវ និងភេសជ្ជៈរៀបចំដោយបារីស្តា —
              រក្សាទុកក្នុងកំណត់ត្រារសជាតិផ្ទាល់ខ្លួនរបស់អ្នក។
            </p>
          </div>
        </div>
      </aside>

      {/* Form column */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-cocoa-container/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-20 size-80 rounded-full bg-honey-fixed/30 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between px-5 py-5 md:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-cocoa transition-colors hover:text-roast"
          >
            <ArrowLeft className="size-4" />
            ត្រឡប់ទៅម៉ឺនុយ
          </Link>
          <ThemeToggle />
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-5 pb-12 md:px-10">
          <div className="w-full max-w-[440px]">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            <div className="rounded-3xl border border-border bg-surface-container-lowest p-6 shadow-panel sm:p-8">
              <div className="mb-6 space-y-1.5">
                <span className="label-caps text-cocoa">{eyebrow}</span>
                <h1 className="font-heading text-[28px] leading-normal font-medium text-on-surface md:text-[34px] md:leading-normal">
                  {title}
                </h1>
                <p className="text-[15px] leading-relaxed text-on-surface-variant">{subtitle}</p>
              </div>
              {children}
            </div>

            <div className="mt-6 text-center text-[13px] text-on-surface-variant">{footer}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
