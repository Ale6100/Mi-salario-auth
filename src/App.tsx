// src\App.tsx

import { AppSidebar } from "./components/sidebar/AppSidebar";
import { BrowserRouter } from "react-router";
// import { ContentAuthenticated } from "./components/ContentAuthenticated";
import { LoginButton } from "./components/login/LoginButton";
import { ModeToggle } from "./context/ModeToggle";
import { Separator } from "./components/ui/separator";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./components/ui/sidebar";
import { TooltipProvider } from "./components/ui/tooltip";
import { useAuth0 } from "@auth0/auth0-react";
import { useCookies } from 'react-cookie';

function App() {
  const { isAuthenticated, isLoading } = useAuth0();
  const [cookies] = useCookies(['sidebar_state'])
  const defaultOpen = Boolean(cookies.sidebar_state);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Mi salario</h1>
          <p className="text-muted-foreground">Iniciá sesión para continuar</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <TooltipProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b md:hidden">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-8" />
                <span className="text-sm font-semibold">Mi salario</span>
              </div>
            </header>
            {
              <p className="flex items-center justify-center h-full text-lg font-semibold text-muted-foreground">
                Modo Mantenimiento
              </p>
            }
            {/* <ContentAuthenticated /> */}
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App
