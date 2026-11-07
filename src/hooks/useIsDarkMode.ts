// src\hooks\useIsDarkMode.ts

import { useEffect, useState } from "react";
import { useTheme } from "@/context/utilThemeProvider";

export function useIsDarkMode(): boolean {
  const { theme } = useTheme();

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const update = () => {
      if (typeof document !== "undefined") {
        setIsDark(document.documentElement.classList.contains("dark"));
      }
    };

    update();

    let observer: MutationObserver | null = null;
    if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
      observer = new MutationObserver(update);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    const mediaQuery =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    mediaQuery?.addEventListener("change", update);

    return () => {
      observer?.disconnect();
      mediaQuery?.removeEventListener("change", update);
    };
  }, [theme]);

  return isDark;
}
