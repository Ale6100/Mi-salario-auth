// src\components\sidebar\AppSidebar.tsx

"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, Wallet, CreditCard, TrendingUp, Shield, List, ClipboardList, FileText, DollarSign, LogOut, User } from "lucide-react"
import { Link, useLocation } from "react-router"
import { ModeToggle } from "@/context/ModeToggle"
import { RUTAS } from "@/lib/const"
import { Separator } from "@/components/ui/separator"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"
import { useAuth0 } from "@auth0/auth0-react"
import { useTheme } from "@/context/utilThemeProvider"

const mainNavItems = [
  { title: "Dashboard", url: RUTAS.dashboard, icon: LayoutDashboard },
  { title: "Ingresos", url: RUTAS.income, icon: Wallet },
  { title: "Gastos estimados", url: RUTAS.estimatedExpenses, icon: CreditCard },
  { title: "Evolución", url: RUTAS.trends, icon: TrendingUp },
  { title: "Fondo de emergencia", url: RUTAS.emergencyFund, icon: Shield },
] as const

const configNavItems = [
  { title: "Fuentes de ingreso", url: RUTAS.configuration.incomeSources, icon: List },
  { title: "Fuentes de gastos", url: RUTAS.configuration.expenseSources, icon: ClipboardList },
  { title: "Aclaraciones mensuales", url: RUTAS.configuration.monthlyNotes, icon: FileText },
  { title: "Precio dólar", url: RUTAS.configuration.dollarRate, icon: DollarSign },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth0()
  const { theme } = useTheme()
  const location = useLocation()

  const effectiveTheme = (() => {
    if (theme === "system") {
      return globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return theme
  })()

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="group-data-[collapsible=icon]:p-0!"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <img
                  src={effectiveTheme === "dark" ? "/favicon-dark.svg" : "/favicon-light.svg"}
                  alt="Mi Salario"
                  className="size-4"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Mi Salario</span>
                <span className="truncate text-xs text-muted-foreground">
                  Gestión financiera
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator />
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2 truncate">
            <div className="flex size-7 items-center justify-center rounded-full bg-muted">
              <User className="size-3.5" />
            </div>
            <span className="truncate text-sm text-muted-foreground">
              {user?.name || user?.email || "Usuario"}
            </span>
          </div>
          <ModeToggle />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 cursor-pointer"
          onClick={() =>
            logout({
              logoutParams: { returnTo: globalThis.location.origin },
            })
          }
        >
          <LogOut className="size-4" />
          <span>Cerrar Sesión</span>
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
