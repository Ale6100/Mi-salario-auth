// src\lib\periodo.ts

import { format } from "date-fns";
import { es } from "date-fns/locale";

const periodoToDate = (periodo: string) => {
  const [year, month] = periodo.split("-").map(Number);
  return new Date(year, month - 1, 1);
};

const PERIODO_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export const esPeriodoValido = (periodo: string) => PERIODO_REGEX.test(periodo);

export const getPeriodoActual = () => format(new Date(), "yyyy-MM");

export const getPeriodoAnterior = (periodo: string) => {
  const date = periodoToDate(periodo);
  date.setMonth(date.getMonth() - 1);
  return format(date, "yyyy-MM");
};

export const formatPeriodoLargo = (periodo: string) => {
  const formatted = format(periodoToDate(periodo), "MMMM yyyy", { locale: es });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

/**
 * Genera todos los períodos mensuales consecutivos ("YYYY-MM") entre minPeriodo y maxPeriodo inclusives.
 * Permite que los gráficos en el eje X mantengan una escala de tiempo continua y equiespaciada
 * aunque existan meses sin registros intermedios.
 */
export const generarRangoPeriodos = (minPeriodo: string, maxPeriodo: string): string[] => {
  if (!esPeriodoValido(minPeriodo) || !esPeriodoValido(maxPeriodo)) {
    return [];
  }
  if (minPeriodo > maxPeriodo) {
    return [minPeriodo];
  }

  const [startYear, startMonth] = minPeriodo.split("-").map(Number);
  const [endYear, endMonth] = maxPeriodo.split("-").map(Number);
  const periodos: string[] = [];

  let y = startYear;
  let m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    periodos.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }

  return periodos;
};
