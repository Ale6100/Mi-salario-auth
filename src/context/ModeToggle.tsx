// src\components\sidebar\ModeToggle.tsx

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useRef } from "react"
import { useTheme } from "@/context/utilThemeProvider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light"

    // Si el navegador soporta View Transitions API
    if (document.startViewTransition && buttonRef.current) {
      const { top, left, width, height } = buttonRef.current.getBoundingClientRect()
      const x = left + width / 2
      const y = top + height / 2
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      const transition = document.startViewTransition(() => {
        setTheme(newTheme)
      })

      await transition.ready

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      )
    } else {
      // Fallback sin animación
      setTheme(newTheme)
    }
  }

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="cursor-pointer"
      title={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 duration-500 dark:-rotate-90 text-amber-500" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 duration-500 dark:rotate-0 text-primary" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
