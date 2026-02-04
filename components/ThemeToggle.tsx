"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-4 right-4 sm:top-5 sm:right-5 p-2 sm:p-2.5 rounded-full bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-all duration-200 z-50"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
      ) : (
        <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
      )}
    </button>
  );
}
