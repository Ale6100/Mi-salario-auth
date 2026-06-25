// src\components\login\LoginButton.tsx

import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/button";

export const LoginButton = () => {
  const { loginWithRedirect } = useAuth();

  return (
    <Button
      variant="default"
      size="sm"
      onClick={() => loginWithRedirect()}
    >
      Iniciar Sesión
    </Button>
  );
};
