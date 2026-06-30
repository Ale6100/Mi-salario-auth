// src\components\Page\Income\Graph.tsx

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { formatCompactPrice } from "@/lib/utils";
import { formatPeriodo, ProfessionalTooltip } from "./ProfessionalTooltip";
import { useMemo } from "react";
import type { ConceptoIngresosDB } from "@/types/conceptosIngresos";

type GraphProps = {
  readonly data: ConceptoIngresosDB[];
};

export const Graph = ({ data }: GraphProps) => {
  const { chartConfig, chartData, sourceKeys } = useMemo(() => {
    if (!data?.length) {
      return {
        chartConfig: {},
        chartData: [],
        sourceKeys: [],
      };
    }

    const sourceMap = new Map<string, { nombre: string; color: string }>();
    const periodoMap = new Map<string, Record<string, number>>();

    let minPeriodo = "";
    let maxPeriodo = "";

    for (const item of data) {
      const fuente = item.id_fuente_ingreso;
      if (!fuente) continue;

      if (!sourceMap.has(fuente._id)) {
        sourceMap.set(fuente._id, {
          nombre: fuente.nombre,
          color: fuente.color,
        });
      }

      const prev = periodoMap.get(item.periodo) ?? {};
      prev[fuente._id] = (prev[fuente._id] ?? 0) + item.valor;
      periodoMap.set(item.periodo, prev);

      if (!minPeriodo || item.periodo < minPeriodo) minPeriodo = item.periodo;
      if (!maxPeriodo || item.periodo > maxPeriodo) maxPeriodo = item.periodo;
    }

    const chartConfig: ChartConfig = {};
    const sourceKeys: string[] = [];

    for (const [id, fuente] of sourceMap) {
      chartConfig[id] = {
        label: fuente.nombre,
        color: fuente.color || undefined,
      };
      sourceKeys.push(id);
    }

    sourceKeys.sort((a, b) =>
      String(chartConfig[a]?.label ?? "").localeCompare(
        String(chartConfig[b]?.label ?? ""),
      ),
    );

    const [startYear, startMonth] = minPeriodo.split("-").map(Number);
    const [endYear, endMonth] = maxPeriodo.split("-").map(Number);
    const chartData: { periodo: string; [key: string]: string | number }[] = [];

    const emptyEntry = Object.fromEntries(sourceKeys.map((k) => [k, 0]));

    let year = startYear;
    let month = startMonth;
    while (year < endYear || (year === endYear && month <= endMonth)) {
      const periodo = `${year}-${String(month).padStart(2, "0")}`;
      chartData.push({
        periodo,
        ...emptyEntry,
        ...periodoMap.get(periodo),
      });

      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    return { chartConfig, chartData, sourceKeys };
  }, [data]);

  if (!data?.length) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[440px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="periodo"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatPeriodo}
            />
            <YAxis
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatCompactPrice}
            />
            <ChartTooltip
              cursor={false}
              content={<ProfessionalTooltip chartConfig={chartConfig} />}
            />
            {sourceKeys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={`var(--color-${key})`}
                stackId="a"
                radius={0}
              />
            ))}
          </BarChart>
        </ChartContainer>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {sourceKeys.map((key) => {
            const config = chartConfig[key];
            const color = config?.color;
            return (
              <div key={key} className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 shrink-0 rounded-xs"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-muted-foreground">
                  {config?.label ? String(config.label) : key}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
