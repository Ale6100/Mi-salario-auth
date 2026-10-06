// src\lib\inflacion.ts

import type { InflacionMensual } from "@/lib/fetch/inflacion";

type TotalesDelPeriodo = {
  periodo: string;
  ingresos: number;
  gastos: number;
}

export type PuntoEvolucionReal = TotalesDelPeriodo & {
  ajustado: boolean;
}

/**
 * Índice de precios acumulado de cada mes (base 1 antes del primer dato).
 * Dividir el índice de dos meses da cuánto subieron los precios entre ambos.
 */
export const calcularIndicesPorPeriodo = (serie: InflacionMensual[]) => {
  const indices = new Map<string, number>();
  let indice = 1;

  for (const { fecha, valor } of serie.toSorted((a, b) => a.fecha.localeCompare(b.fecha))) {
    indice *= 1 + valor / 100;
    indices.set(fecha.slice(0, 7), indice);
  }

  return indices;
}

export const getUltimoPeriodoConDato = (indices: Map<string, number>) => {
  let ultimo: string | undefined;
  for (const periodo of indices.keys()) {
    if (!ultimo || periodo > ultimo) ultimo = periodo;
  }
  return ultimo;
}

/**
 * Expresa los totales de cada período en pesos del último mes con inflación publicada.
 * Los períodos posteriores a ese mes todavía no tienen dato, así que quedan sin ajustar.
 */
export const calcularEvolucionReal = (totales: TotalesDelPeriodo[], indices: Map<string, number>): PuntoEvolucionReal[] => {
  const periodoBase = getUltimoPeriodoConDato(indices);
  const indiceBase = periodoBase ? indices.get(periodoBase) : undefined;

  return totales
    .toSorted((a, b) => a.periodo.localeCompare(b.periodo))
    .map(({ periodo, ingresos, gastos }) => {
      const indice = indices.get(periodo);
      if (!indice || !indiceBase) return { periodo, ingresos, gastos, ajustado: false };

      const factor = indiceBase / indice;
      return { periodo, ingresos: ingresos * factor, gastos: gastos * factor, ajustado: true };
    });
}
