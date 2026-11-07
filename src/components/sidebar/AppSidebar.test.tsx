import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/context/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "./AppSidebar"

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    user: {
      name: "Usuario de Prueba",
      email: "usuario@test.com",
      picture: "https://example.com/avatar.jpg",
    },
    logout: vi.fn(),
  }),
}))

const configurarMatchMedia = (esMobile: boolean) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: esMobile ? 500 : 1024,
  })
  Object.defineProperty(globalThis, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("max-width") ? esMobile : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

const renderizarSidebar = (defaultOpen: boolean) => {
  const user = userEvent.setup()
  const result = render(
    <MemoryRouter>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
          </SidebarProvider>
        </TooltipProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
  return { ...result, user }
}

describe("AppSidebar", () => {
  beforeEach(() => {
    configurarMatchMedia(false)
    document.cookie = "sidebar_state=; max-age=0"
  })

  it("expande el sidebar en modo peek al hacer hover y lo contrae al salir sin modificar la preferencia guardada", async () => {
    const { container, user } = renderizarSidebar(false)
    const sidebar = container.querySelector('[data-slot="sidebar"]')
    const sidebarContainer = container.querySelector<HTMLElement>(
      '[data-slot="sidebar-container"]'
    )!

    expect(sidebar).toHaveAttribute("data-state", "collapsed")

    await user.hover(sidebarContainer)

    expect(sidebar).toHaveAttribute("data-state", "expanded")
    expect(sidebar).toHaveAttribute("data-peek", "true")

    await user.unhover(sidebarContainer)

    await waitFor(() => expect(sidebar).toHaveAttribute("data-state", "collapsed"))
    expect(document.cookie).not.toContain("sidebar_state=true")
  })

  it("fija el sidebar como abierto y guarda la preferencia al presionar el botón", async () => {
    const { container, user } = renderizarSidebar(false)
    const sidebar = container.querySelector('[data-slot="sidebar"]')
    const sidebarContainer = container.querySelector<HTMLElement>(
      '[data-slot="sidebar-container"]'
    )!

    await user.hover(sidebarContainer)
    expect(sidebar).toHaveAttribute("data-peek", "true")

    const toggleButton = screen.getAllByRole("button", { name: "Toggle Sidebar" })[0]
    await user.click(toggleButton)

    expect(sidebar).toHaveAttribute("data-state", "expanded")
    expect(sidebar).toHaveAttribute("data-peek", "false")
    expect(document.cookie).toContain("sidebar_state=true")

    await user.unhover(sidebarContainer)
    expect(sidebar).toHaveAttribute("data-state", "expanded")
  })
})
