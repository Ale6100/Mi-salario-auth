// src\components\sidebar\AppSidebar.tsx

"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, Wallet, CreditCard, Shield, List, ClipboardList, LogOut, User, BarChart3 } from "lucide-react"
import { Link, useLocation } from "react-router"
import { ModeToggle } from "@/context/ModeToggle"
import { RUTAS } from "@/lib/const"
import { SearchTrigger } from "@/components/search/SearchTrigger"
import { Separator } from "@/components/ui/separator"
import { useSearch } from "@/components/search/SearchContext"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth0 } from "@auth0/auth0-react"

const mainNavItems = [
  { title: "Dashboard", url: RUTAS.dashboard, icon: LayoutDashboard },
  { title: "Ingresos", url: RUTAS.income, icon: Wallet },
  { title: "Gastos", url: RUTAS.expenses, icon: CreditCard },
  { title: "Fondo de emergencia", url: RUTAS.emergencyFund, icon: Shield },
  { title: "Reportes", url: RUTAS.reports, icon: BarChart3 },
] as const

const configNavItems = [
  { title: "Fuentes de ingreso", url: RUTAS.configuration.incomeSources, icon: List },
  { title: "Fuentes de gastos", url: RUTAS.configuration.expenseSources, icon: ClipboardList },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth0()
  const location = useLocation()
  const { openSearch } = useSearch()

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="relative flex h-8 items-center justify-between">
          <SidebarTrigger className="cursor-pointer" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
            <ModeToggle />
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="group-data-[collapsible=icon]:p-0!"
            >
              <Link to={RUTAS.dashboard}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <img
                    src="/favicon-dark.svg"
                    alt="Mi salario"
                    className="size-4"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0">
                  <span className="truncate font-semibold">Mi salario</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Gestión financiera
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="px-1 pt-1 group-data-[collapsible=icon]:hidden">
          <SearchTrigger onOpen={openSearch} variant="sidebar" />
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex justify-center pt-1">
          <SearchTrigger onOpen={openSearch} variant="icon" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
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
            <SidebarMenu className="space-y-1">
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
        <div className="relative flex h-8 items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 pr-8 transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt="Avatar"
                  className="size-full object-cover"
                />
              ) : (
                <User className="size-3.5" />
              )}
            </div>
            <span className="truncate text-sm text-muted-foreground">
              {user?.name || user?.email || "Usuario"}
            </span>
          </div>
          <Button
            variant="destructive"
            size="icon-sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer shrink-0"
            onClick={() =>
              logout({
                logoutParams: { returnTo: globalThis.location.origin },
              })
            }
            title="Cerrar sesión"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
