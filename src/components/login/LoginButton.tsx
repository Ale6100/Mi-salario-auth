// src\components\login\LoginButton.tsx

import { Button } from "../ui/button";
import { useAuth0 } from "@auth0/auth0-react";

export const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Button
      variant="default"
      size="sm"
      onClick={() => loginWithRedirect()}
      className="cursor-pointer"
    >
      Iniciar Sesión
    </Button>
  );
};
