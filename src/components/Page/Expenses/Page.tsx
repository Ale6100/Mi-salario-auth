// src\components\Page\Expenses\Page.tsx

import { format } from "date-fns";
import { MENSAJE_ERROR_CARGA } from "@/lib/const";
import { Graph } from "./graph/Graph";
import { Separator } from "@/components/ui/separator";
import { Table } from "./table/Table";
import { useAuth0 } from "@auth0/auth0-react";
import { useConceptosGastos } from "@/hooks/useConceptosGastos";
import { useConceptosIngresos } from "@/hooks/useConceptosIngresos";
import { useMemo } from "react";
import { SeguimientoDiarioCard } from "./SeguimientoDiarioCard";

export const ExpensesPage = () => {
  const { user } = useAuth0();

  const currentPeriod = useMemo(() => format(new Date(), 'yyyy-MM'), []);

  const { data: ingresosMesActual, isPending: isPendingIngresosMesActual, isLoadingError: isErrorIngresosMesActual } = useConceptosIngresos({ user, periodo: currentPeriod });
  const { data, isPending, isFetching, isLoadingError: isErrorGastos } = useConceptosGastos({ user });
  const isError = isErrorGastos || isErrorIngresosMesActual;

  const ingresosTotalesDelMes = useMemo(() => {
    if (!ingresosMesActual?.length) return 0;
    return ingresosMesActual.reduce((total, ingreso) => total + ingreso.valor, 0);
  }, [ingresosMesActual]);

  const gastosConSeguimiento = useMemo(() => {
    return (data ?? []).filter(
      (gasto) => gasto.periodo === currentPeriod && gasto.id_fuente_gasto?.seguimiento_diario
    );
  }, [data, currentPeriod]);

  const graphContent = () => {
    if (isPending || isPendingIngresosMesActual) {
      return (
        <div className="flex justify-center items-center">
          <p className="text-muted-foreground text-sm">Cargando...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex justify-center items-center">
          <p className="text-muted-foreground text-sm">{MENSAJE_ERROR_CARGA}</p>
        </div>
      );
    }

    return <Graph data={data} ingresosTotalesDelMes={ingresosTotalesDelMes} />;
  };

  return (
    <section className="p-4 space-y-4 w-full max-w-7xl mx-auto">
      <h1 className="text-3xl max-sm:text-lg font-bold text-center">Gastos mensuales</h1>

      <p className="text-muted-foreground text-center text-sm max-w-md mx-auto">
        Aquí puedes gestionar tus gastos mensuales
      </p>

      <Separator className="my-6" />

      {gastosConSeguimiento.length > 0 && (
        <>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Seguimiento diario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gastosConSeguimiento.map((gasto) => (
                <SeguimientoDiarioCard
                  key={gasto._id}
                  gasto={gasto}
                  periodo={currentPeriod}
                  ingresosTotalesDelMes={ingresosTotalesDelMes}
                />
              ))}
            </div>
          </section>

          <Separator className="my-6" />
        </>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Gráfico de gastos</h2>
        {graphContent()}
      </section>

      <Separator className="my-6" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Gestionar gastos</h2>
        <Table data={data} isPending={isPending} isFetching={isFetching} />
      </section>
    </section>
  )
}
