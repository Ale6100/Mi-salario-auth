// src\context\theme-provider.tsx

import { ThemeProviderContext, type Theme } from "./utilThemeProvider"
import { Toaster } from "@/components/ui/sonner"
import { useEffect, useMemo, useState, type ReactNode } from "react"

type ThemeProviderProps = {
  readonly children: ReactNode
  readonly defaultTheme?: Theme
  readonly storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme | null) || defaultTheme
  )

  useEffect(() => {
    const root = globalThis.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = globalThis.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = useMemo(() => ({
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
  }), [theme, storageKey])

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
      <Toaster richColors theme={theme} toastOptions={{}} position="top-right" closeButton />
    </ThemeProviderContext.Provider>
  )
}
