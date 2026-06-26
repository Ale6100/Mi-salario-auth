// src\components\login\LogoutButton.tsx

import { Button } from "../ui/button";
import { useAuth0 } from "@auth0/auth0-react";

export const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => logout({ logoutParams: { returnTo: globalThis.location.origin } })}
      className="cursor-pointer"
    >
      Cerrar Sesión
    </Button>
  );
};
