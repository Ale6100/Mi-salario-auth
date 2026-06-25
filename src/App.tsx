// src\App.tsx

import { LoginButton } from "./components/login/LoginButton";
import { LogoutButton } from "./components/login/LogoutButton";
import { ModeToggle } from "./context/ModeToggle";
import { useAuth } from "./hooks/useAuth";

const { DEV } = import.meta.env;

export const ContentAuthenticated = () => {
  return (
    <div>Contenido visible para usuarios autenticados</div>
  )
}

function App() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated && !DEV) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Mi Salario</h1>
          <p className="text-muted-foreground">Iniciá sesión para continuar</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between p-4 border-b">
        <ModeToggle />
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.name || user?.email || 'Usuario'}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="p-4">
        <ContentAuthenticated />
      </main>
    </div>
  );
}

export default App
