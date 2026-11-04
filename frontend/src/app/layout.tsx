import type { Metadata } from "next";
import { Koh_Santepheap } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

// Main UI font. "swap" + next/font's metric-matched fallback keeps text
// visible and the layout stable while the web font loads.
// Not a variable font: 400 covers regular/medium, 700 covers semibold/bold.
const khmer = Koh_Santepheap({
  variable: "--font-khmer",
  subsets: ["khmer", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CoffeeShop — កាហ្វេលំដាប់ខ្ពស់ និងភេសជ្ជៈផ្សេងៗ",
  description: "ឆុងស្រស់ៗ រៀបចំយ៉ាងល្អឥតខ្ចោះ។ មើលម៉ឺនុយកាហ្វេ ឡាតេ ភេសជ្ជៈត្រជាក់ និងច្រើនទៀត។",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="km"
      className={`${khmer.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
