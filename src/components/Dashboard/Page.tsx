// src\components\Dashboard\Page.tsx

import { useFuentesIngreso } from "@/hooks/useFuentesIngreso";
import { useAuth0 } from "@auth0/auth0-react";

export const DashboardPage = () => {
  const { user } = useAuth0();

  const { data, isFetching } = useFuentesIngreso({ user });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-3xl font-bold">Bienvenido a Mi Salario</h1>
      <p className="text-muted-foreground">Esta es la página de dashboard para usuarios autenticados.</p>
      {isFetching ? (
        <p className="text-sm text-muted-foreground">Cargando fuentes de ingreso...</p>
      ) : (
        <ul className="space-y-2">
          {data.map((fuente) => (
            <li key={fuente._id} className="p-2 border rounded">
              <p className="font-semibold">{fuente.nombre || "Nombre no disponible"}</p>
              <p className="text-sm text-muted-foreground">Activo: {fuente.activo ? "Sí" : "No"}</p>
              <p className="text-sm text-muted-foreground">Aguinaldo: {fuente.aguinaldo ? "Sí" : "No"}</p>
              <p className="text-sm text-muted-foreground">Color: {fuente.color || "No disponible"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
