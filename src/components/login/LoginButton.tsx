// src\components\login\LoginButton.tsx

import { useAuth0 } from '@auth0/auth0-react';

export const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded-md"
      onClick={() => loginWithRedirect()}
    >
      Iniciar Sesión
    </button>
  );
};
