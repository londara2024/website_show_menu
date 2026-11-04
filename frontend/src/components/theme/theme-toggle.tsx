"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS = [
  { value: "light", label: "ភ្លឺ", icon: Sun },
  { value: "dark", label: "ងងឹត", icon: Moon },
  { value: "system", label: "តាមប្រព័ន្ធ", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="ប្ដូររូបរាង"
          className="rounded-full text-roast hover:bg-surface-container hover:text-roast"
        >
          {/* Icon swaps via CSS so it never mismatches during hydration */}
          <Sun className="size-[18px] dark:hidden" />
          <Moon className="hidden size-[18px] dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl border-border bg-surface-container-lowest shadow-panel">
        <DropdownMenuLabel className="label-caps text-cocoa">រូបរាង</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setTheme(value)}
            className="gap-2 rounded-lg text-on-surface focus:bg-surface-container focus:text-on-surface"
          >
            <Icon className="size-4 text-roast" />
            {label}
            <Check
              suppressHydrationWarning
              className={`ml-auto size-4 text-roast ${theme === value ? "opacity-100" : "opacity-0"}`}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
