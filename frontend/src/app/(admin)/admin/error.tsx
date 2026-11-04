"use client";

import { CloudOff, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shown when an admin page can't load its data (usually: the backend API is down). */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-16 text-center">
      <CloudOff className="mb-4 size-10 text-outline" />
      <h2 className="font-heading text-[22px] font-semibold text-on-surface">មិនអាចផ្ទុកទិន្នន័យបានទេ</h2>
      <p className="mt-1 max-w-md text-[15px] text-on-surface-variant">
        មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេ (API) បានទេ។ សូមពិនិត្យថា backend កំពុងដំណើរការ ហើយព្យាយាមម្ដងទៀត។
      </p>
      <Button
        type="button"
        onClick={reset}
        className="mt-5 h-10 rounded-xl bg-roast-container px-5 font-semibold text-on-roast hover:bg-roast dark:bg-roast"
      >
        <RotateCw className="size-4" />
        ព្យាយាមម្ដងទៀត
      </Button>
    </div>
  );
}
