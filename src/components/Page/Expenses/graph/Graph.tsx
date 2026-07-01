// src\components\Page\Expenses\graph\Graph.tsx

import { Pie, PieChart } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { formatPrice } from "@/lib/utils";
import { useMemo } from "react";
import { format } from "date-fns";
import type { ConceptoGastosDB } from "@/types/conceptosGastos";

type GraphProps = {
  readonly data: ConceptoGastosDB[];
  readonly ingresosTotalesDelMes: number;
};

type TooltipPayloadEntry = {
  name?: string;
  value?: number;
  payload?: { fill?: string };
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-40 rounded-lg border border-border/40 bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.payload?.fill }}
            />
            <span className="text-xs font-medium text-foreground">
              {entry.name}
            </span>
          </div>
          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
            {formatPrice(entry.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
};

const RADIAN = Math.PI / 180;

import type { PieLabelRenderProps } from "recharts";

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: PieLabelRenderProps) => {
  if (
    cx == null ||
    cy == null ||
    midAngle == null ||
    innerRadius == null ||
    outerRadius == null ||
    percent == null ||
    percent < 0.05
  ) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
      style={{ fontSize: 12, fontWeight: 600, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
    >
      {name}
    </text>
  );
};

export const Graph = ({ data, ingresosTotalesDelMes }: GraphProps) => {
  const currentPeriod = useMemo(() => format(new Date(), "yyyy-MM"), []);

  const { pieData, totalGastado, chartConfig } = useMemo(() => {
    const currentExpenses = data.filter((item) => item.periodo === currentPeriod);

    const sourceMap = new Map<string, { nombre: string; color: string; total: number }>();

    for (const item of currentExpenses) {
      const fuente = item.id_fuente_gasto;
      if (!fuente) continue;

      const existing = sourceMap.get(fuente._id);
      if (existing) {
        existing.total += item.columnaMonto;
      } else {
        sourceMap.set(fuente._id, {
          nombre: fuente.nombre,
          color: fuente.color,
          total: item.columnaMonto,
        });
      }
    }

    const totalGastado = Array.from(sourceMap.values()).reduce(
      (sum, s) => sum + s.total,
      0,
    );

    const chartConfig: ChartConfig = {};
    const pieData: { name: string; value: number; fill: string }[] = [];

    for (const [id, source] of sourceMap) {
      chartConfig[id] = {
        label: source.nombre,
        color: source.color || undefined,
      };
      pieData.push({
        name: source.nombre,
        value: source.total,
        fill: source.color,
      });
    }

    pieData.sort((a, b) => b.value - a.value);


    const disponible = Math.max(0, ingresosTotalesDelMes - totalGastado);
    if (ingresosTotalesDelMes > 0 && disponible > 0) {
      chartConfig["disponible"] = {
        label: "Disponible",
        color: "#22c55e",
      };
      pieData.push({
        name: "Disponible",
        value: disponible,
        fill: "#22c55e",
      });
    }

    return { pieData, totalGastado, chartConfig };
  }, [data, ingresosTotalesDelMes, currentPeriod]);

  if (!totalGastado && ingresosTotalesDelMes <= 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            Aún no tienes gastos registrados este mes.
          </p>
          <p className="text-muted-foreground text-center text-sm">
            Agrega tu primer gasto usando el botón{" "}
            <span className="font-medium">Agregar</span> en la tabla de abajo.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!totalGastado && ingresosTotalesDelMes > 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            No tienes gastos registrados este mes.
          </p>
          <p className="text-muted-foreground text-center text-sm">
            Tienes{" "}
            <span className="font-semibold text-foreground">
              {formatPrice(ingresosTotalesDelMes)}
            </span>{" "}
            disponibles.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[440px] w-full">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
            />
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
          </PieChart>
        </ChartContainer>

        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Total gastado</p>
              <p className="font-semibold">{formatPrice(totalGastado)}</p>
            </div>
            {ingresosTotalesDelMes > 0 && (
              <>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs">
                    Ingresos del mes
                  </p>
                  <p className="font-semibold">
                    {formatPrice(ingresosTotalesDelMes)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs">Disponible</p>
                  <p className="font-semibold">
                    {formatPrice(
                      Math.max(0, ingresosTotalesDelMes - totalGastado),
                    )}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 shrink-0 rounded-xs"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="text-xs text-muted-foreground">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
