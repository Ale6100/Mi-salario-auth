// src\components\Page\Reports\graph\Graph.tsx

import { calcularEvolucionReal, calcularIndicesPorPeriodo, getUltimoPeriodoConDato } from "@/lib/inflacion";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatCompactPrice, formatPrice } from "@/lib/utils";
import { formatPeriodo } from "@/components/Page/Income/graph/ProfessionalTooltip";
import { formatPeriodoLargo } from "@/lib/periodo";
import { useInflacionMensual } from "@/hooks/useInflacionMensual";
import { useMemo } from "react";
import type { ConceptoGastosDB } from "@/types/conceptosGastos";
import type { ConceptoIngresosDB } from "@/types/conceptosIngresos";

type GraphProps = {
  readonly incomes: ConceptoIngresosDB[];
  readonly expenses: ConceptoGastosDB[];
}

const chartConfig = {
  ingresos: { label: "Ingresos", color: "#22c55e" },
  gastos: { label: "Gastos", color: "#f59e0b" },
} satisfies ChartConfig;

const sumarPorPeriodo = <T,>(items: T[], getPeriodo: (item: T) => string, getMonto: (item: T) => number) => {
  const totales = new Map<string, number>();
  for (const item of items) {
    const periodo = getPeriodo(item);
    totales.set(periodo, (totales.get(periodo) ?? 0) + getMonto(item));
  }
  return totales;
}

export const Graph = ({ incomes, expenses }: GraphProps) => {
  const { data: inflacion, isLoading, isError } = useInflacionMensual();

  const indices = useMemo(() => calcularIndicesPorPeriodo(inflacion ?? []), [inflacion]);
  const periodoBase = getUltimoPeriodoConDato(indices);

  const evolucion = useMemo(() => {
    const ingresosPorPeriodo = sumarPorPeriodo(incomes, i => i.periodo, i => i.valor);
    const gastosPorPeriodo = sumarPorPeriodo(expenses, e => e.periodo, e => e.monto ?? 0);
    const periodos = new Set([...ingresosPorPeriodo.keys(), ...gastosPorPeriodo.keys()]);

    const totales = [...periodos].map(periodo => ({
      periodo,
      ingresos: ingresosPorPeriodo.get(periodo) ?? 0,
      gastos: gastosPorPeriodo.get(periodo) ?? 0,
    }));

    return calcularEvolucionReal(totales, indices);
  }, [incomes, expenses, indices]);

  const periodosAjustados = evolucion.filter(p => p.ajustado);
  const hayPeriodosSinAjustar = periodosAjustados.length < evolucion.length;

  if (isLoading) {
    return <p className="text-muted-foreground text-sm text-center py-8">Cargando inflación...</p>;
  }

  if (isError || !periodoBase) {
    return <p className="text-muted-foreground text-sm text-center py-8">No se pudo obtener la inflación. Probá de nuevo más tarde.</p>;
  }

  if (periodosAjustados.length < 2) {
    return <p className="text-muted-foreground text-sm text-center py-8">Necesitás al menos dos meses con datos para ver la evolución.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Montos expresados en pesos de <strong>{formatPeriodoLargo(periodoBase)}</strong> (último mes con inflación publicada), para poder comparar meses distintos.
      </p>

      <ChartContainer config={chartConfig} className="max-h-[400px] w-full">
        <LineChart data={periodosAjustados} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="periodo" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={formatPeriodo} />
          <YAxis tickLine={false} tickMargin={10} axisLine={false} tickFormatter={formatCompactPrice} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => formatPeriodo(String(payload?.[0]?.payload?.periodo ?? ""))}
                formatter={(value, name) => (
                  <div className="flex w-full justify-between gap-4">
                    <span className="text-muted-foreground">{chartConfig[name as keyof typeof chartConfig]?.label ?? name}</span>
                    <span className="font-mono font-medium">{formatPrice(Number(value))}</span>
                  </div>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line dataKey="ingresos" type="monotone" stroke="var(--color-ingresos)" strokeWidth={2} dot={false} />
          <Line dataKey="gastos" type="monotone" stroke="var(--color-gastos)" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartContainer>

      {hayPeriodosSinAjustar && (
        <p className="text-xs text-muted-foreground text-center">
          Los meses posteriores a {formatPeriodoLargo(periodoBase)} todavía no tienen inflación publicada, así que no se muestran.
        </p>
      )}
    </div>
  );
};
