// src\context\utilThemeProvider.ts

import { createContext, useContext } from "react"

export type Theme = "dark" | "light" | "system"

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  return context
}
