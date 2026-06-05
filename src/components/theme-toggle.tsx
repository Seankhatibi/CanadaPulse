"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("canada-pulse-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = stored ? stored === "dark" : prefersDark;

    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("canada-pulse-theme", next ? "dark" : "light");
    setIsDark(next);
  }

  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      title="Toggle color theme"
      onClick={toggleTheme}
      className="grid size-10 shrink-0 place-items-center rounded-md border border-black/10 bg-white/70 text-stone-900 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-stone-50 dark:hover:bg-white/15"
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}
