// src/components/Page/Expenses/SeguimientoDiarioCard.tsx

import { Card, CardContent } from "@/components/ui/card";
import { FuenteBadge } from "@/components/ui/FuenteBadge";
import { formatPrice } from "@/lib/utils";
import { calcularSeguimientoDiario } from "@/lib/seguimientoDiario";
import type { ConceptoGastosDB } from "@/types/conceptosGastos";
import { CalendarDays } from "lucide-react";

export interface SeguimientoDiarioCardProps {
  readonly gasto: ConceptoGastosDB;
  readonly periodo: string;
  readonly ingresosTotalesDelMes?: number;
  readonly referenceDate?: Date;
}

export const SeguimientoDiarioCard = ({
  gasto,
  periodo,
  ingresosTotalesDelMes = 0,
  referenceDate,
}: SeguimientoDiarioCardProps) => {
  const monto =
    gasto.monto !== undefined && gasto.monto >= 0
      ? gasto.monto
      : gasto.porcentaje_total !== undefined
        ? (ingresosTotalesDelMes * gasto.porcentaje_total) / 100
        : 0;

  const {
    dayOfMonth,
    daysInMonth,
    remainingDays,
    porcentajeMes,
    deberiasTenerHoy,
    gastoDiarioRecomendado,
    esPeriodoActual,
  } = calcularSeguimientoDiario(monto, periodo, referenceDate);

  const nombreFuente = gasto.id_fuente_gasto?.nombre || "Gasto";
  const colorFuente = gasto.id_fuente_gasto?.color;

  return (
    <Card className="border border-border/80 shadow-sm overflow-hidden bg-card">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FuenteBadge nombre={nombreFuente} color={colorFuente} />
            <span className="text-xs text-muted-foreground font-medium">
              Seguimiento diario
            </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Presupuesto: {formatPrice(monto)}
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Debería quedarte hoy
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {formatPrice(deberiasTenerHoy)}
          </p>
          <p className="text-xs text-muted-foreground">
            {esPeriodoActual
              ? `Gasto diario recomendado: ${formatPrice(gastoDiarioRecomendado)} / día (${remainingDays} ${remainingDays === 1 ? "día restante" : "días restantes"})`
              : "Proyección calculada para el período"}
          </p>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {esPeriodoActual
                ? `Día ${dayOfMonth} de ${daysInMonth}`
                : `Mes (${daysInMonth} días)`}
            </span>
            <span>{porcentajeMes}% del mes</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted-foreground/15">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${porcentajeMes}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
