// src\components\Page\Expenses\Page.tsx

import { format } from "date-fns";
import { Graph } from "./graph/Graph";
import { Separator } from "@/components/ui/separator";
import { Table } from "./table/Table";
import { useAuth0 } from "@auth0/auth0-react";
import { useConceptosGastos } from "@/hooks/useConceptosGastos";
import { useConceptosIngresos } from "@/hooks/useConceptosIngresos";
import { useMemo } from "react";

export const ExpensesPage = () => {
  const { user } = useAuth0();

  const { data: ingresosMesActual, isFetching: isFetchingIngresosMesActual } = useConceptosIngresos({ user, periodo: format(new Date(), 'yyyy-MM') });
  const { data, isFetching } = useConceptosGastos({ user });

  const ingresosTotalesDelMes = useMemo(() => {
    if (!ingresosMesActual?.length) return 0;
    return ingresosMesActual.reduce((total, ingreso) => total + ingreso.valor, 0);
  }, [ingresosMesActual]);

  const graphContent = () => {
    if (isFetching || isFetchingIngresosMesActual) {
      return (
        <div className="flex justify-center items-center">
          <p className="text-muted-foreground text-sm">Cargando...</p>
        </div>
      );
    }

    return <Graph data={data} ingresosTotalesDelMes={ingresosTotalesDelMes} />;
  };

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-3xl max-sm:text-lg font-bold text-center">Gastos mensuales</h1>

      <p className="text-muted-foreground text-center text-sm max-w-md mx-auto">
        Aquí puedes gestionar tus gastos mensuales
      </p>

      <Separator className="my-6" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Gráfico de gastos</h2>
        {graphContent()}
      </section>

      <Separator className="my-6" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Gestionar gastos</h2>
        <Table data={data} isFetching={isFetching} />
      </section>
    </section>
  )
}
