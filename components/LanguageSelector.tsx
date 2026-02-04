"use client";

import { Globe } from "lucide-react";

export type LanguageCode = "en" | "ar";

interface LanguageSelectorProps {
  selected: LanguageCode;
  onSelect: (lang: LanguageCode) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic" },
] as const;

export function LanguageSelector({ selected, onSelect, disabled }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-3 mt-4">
      <Globe className="w-4 h-4 text-foreground/30" />
      <div className="flex bg-foreground/[0.03] p-1 rounded-xl border border-foreground/[0.05]">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            disabled={disabled}
            className={`px-4 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
              selected === lang.code
                ? "bg-white dark:bg-white/10 text-foreground shadow-sm shadow-purple-500/10"
                : "text-foreground/30 hover:text-foreground/50"
            } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
