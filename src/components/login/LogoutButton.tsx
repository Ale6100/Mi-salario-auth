// src\components\login\LogoutButton.tsx

import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/button";

export const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => logout({ logoutParams: { returnTo: globalThis.location.origin } })}
    >
      Cerrar Sesión
    </Button>
  );
};
