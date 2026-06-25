// src\components\login\LogoutButton.tsx

import { useAuth0 } from '@auth0/auth0-react';

export const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button 
      className="bg-red-600 text-white px-4 py-2 rounded-md"
      onClick={() => logout({ logoutParams: { returnTo: globalThis.location.origin } })}
    >
      Cerrar Sesión
    </button>
  );
};
