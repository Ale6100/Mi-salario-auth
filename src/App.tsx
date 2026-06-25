import { useAuth0 } from "@auth0/auth0-react";
import { LogoutButton } from "./components/login/LogoutButton";
import { LoginButton } from "./components/login/LoginButton";
import { ModeToggle } from "./context/ModeToggle";
import { useEffect } from "react";

const { VITE_BACKEND_URL, DEV } = import.meta.env;

export const ContentAuthenticated = () => {
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchData = async () => {
      const token = await getAccessTokenSilently();

      const response = await fetch(`${VITE_BACKEND_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await response.json();
    }
    fetchData().then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }, []);

  return (
    <>
      <ModeToggle />
      <div>Contenido visible para usuarios autenticados</div>
    </>
  )
}

function App() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (DEV) {
    return (
      <ContentAuthenticated />
    )
  }

  if (isLoading) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <>
      {isAuthenticated ? <LogoutButton /> : <LoginButton />}
      {user?.name}

      {
        isAuthenticated ? (
          <ContentAuthenticated />
        ) : (
          <div>Contenido visible para usuarios no autenticados</div>
        )
      }
    </>
  )
}

export default App
