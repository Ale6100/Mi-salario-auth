// src\lib\periodo.ts

import { format } from "date-fns";
import { es } from "date-fns/locale";

const periodoToDate = (periodo: string) => {
  const [year, month] = periodo.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

const PERIODO_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export const esPeriodoValido = (periodo: string) => PERIODO_REGEX.test(periodo);

export const getPeriodoActual = () => format(new Date(), "yyyy-MM");

export const getPeriodoAnterior = (periodo: string) => {
  const date = periodoToDate(periodo);
  date.setMonth(date.getMonth() - 1);
  return format(date, "yyyy-MM");
}

export const formatPeriodoLargo = (periodo: string) => {
  const formatted = format(periodoToDate(periodo), "MMMM yyyy", { locale: es });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
