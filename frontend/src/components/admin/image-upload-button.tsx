"use client";

import { useRef, useState, useTransition } from "react";
import { LoaderCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type UploadResult = { url: string; error?: undefined } | { url?: undefined; error: string };

/**
 * "Upload image" button for the product form. Sends the picked file to `upload` (a Server
 * Action) and hands the stored URL back via `onUploaded`. Errors are shown inline in Khmer.
 */
export function ImageUploadButton({
  upload,
  onUploaded,
}: {
  upload: (formData: FormData) => Promise<UploadResult>;
  onUploaded: (url: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function onPick(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    const form = new FormData();
    form.append("file", file);
    startTransition(async () => {
      const result = await upload(form);
      if (result.url) onUploaded(result.url);
      else setError(result.error);
      if (input.current) input.current.value = ""; // allow picking the same file again
    });
  }

  return (
    <div className="space-y-1.5">
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        data-testid="image-file"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => input.current?.click()}
        className="h-11 rounded-xl border-outline-variant px-4 text-[14px] font-semibold text-roast-container hover:bg-surface-container hover:text-roast-container"
      >
        {pending ? <LoaderCircle className="size-[18px] animate-spin" /> : <Upload className="size-[18px]" />}
        {pending ? "កំពុងបង្ហោះ…" : "បង្ហោះរូបភាព"}
      </Button>
      {error && (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
