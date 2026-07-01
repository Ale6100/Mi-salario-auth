// src\components\sidebar\AppSidebar.tsx

"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, Wallet, CreditCard, Shield, List, ClipboardList, DollarSign, LogOut, User, BarChart3 } from "lucide-react"
import { Link, useLocation } from "react-router"
import { ModeToggle } from "@/context/ModeToggle"
import { RUTAS } from "@/lib/const"
import { Separator } from "@/components/ui/separator"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"
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
  { title: "Precio dólar", url: RUTAS.configuration.dollarRate, icon: DollarSign },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth0()
  const location = useLocation()

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
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
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Mi salario</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Gestión financiera
                  </span>
                </div>
              </Link>
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
            <div className="flex size-7 items-center justify-center rounded-full bg-muted overflow-hidden">
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
