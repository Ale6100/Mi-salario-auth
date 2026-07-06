// src\components\Page\Income\Page.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Graph } from "./graph/Graph";
import { Separator } from "@/components/ui/separator";
import { Table } from "./table/Table";
import { useAuth0 } from "@auth0/auth0-react";
import { useConceptosIngresos } from "@/hooks/useConceptosIngresos";

export const IncomePage = () => {
  const { user } = useAuth0();

  const { data, isFetching } = useConceptosIngresos({ user });

  const graphContent = () => {
    if (isFetching) {
      return (
        <div className="flex justify-center items-center">
          <p className="text-muted-foreground text-sm">Cargando...</p>
        </div>
      );
    }

    if (!data?.length) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              Aún no tienes ingresos registrados.
            </p>
            <p className="text-muted-foreground text-center text-sm">
              Agrega tu primer ingreso usando el botón <span className="font-medium">Agregar</span> en la tabla de abajo.
            </p>
          </CardContent>
        </Card>
      );
    }

    return <Graph data={data} />;
  };

  return (
    <section className="p-4 space-y-4 w-full max-w-7xl mx-auto">
      <h1 className="text-3xl max-sm:text-lg font-bold text-center">Ingresos mensuales</h1>

      <p className="text-muted-foreground text-center text-sm max-w-md mx-auto">
        Aquí puedes gestionar tus ingresos mensuales
      </p>

      <Separator className="my-6" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Registro histórico</h2>
        {graphContent()}
      </section>

      <Separator className="my-6" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Gestionar ingresos</h2>
        <Table data={data} isFetching={isFetching} />
      </section>
    </section>
  );
}
