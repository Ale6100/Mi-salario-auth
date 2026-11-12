// src/lib/seguimientoDiario.ts

import { getDate, getDaysInMonth, format } from "date-fns";

export interface SeguimientoDiarioCalculation {
  monto: number;
  dayOfMonth: number;
  daysInMonth: number;
  remainingDays: number;
  mesTranscurrido: number;
  porcentajeMes: number;
  deberiasTenerHoy: number;
  gastoDiarioRecomendado: number;
  esPeriodoActual: boolean;
}

export function calcularSeguimientoDiario(
  monto: number,
  periodo: string,
  referenceDate: Date = new Date()
): SeguimientoDiarioCalculation {
  const [yearStr, monthStr] = periodo.split("-");
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10);
  const periodDate = !Number.isNaN(year) && !Number.isNaN(month) ? new Date(year, month - 1, 1) : referenceDate;

  const daysInMonth = getDaysInMonth(periodDate);
  const currentPeriod = format(referenceDate, "yyyy-MM");

  if (periodo === currentPeriod) {
    const dayOfMonth = getDate(referenceDate);
    const remainingDays = Math.max(0, daysInMonth - dayOfMonth + 1);
    const mesTranscurrido = daysInMonth > 0 ? (dayOfMonth - 1) / daysInMonth : 0;
    const porcentajeMes = daysInMonth > 0 ? Math.min(100, Math.max(0, Math.round((dayOfMonth / daysInMonth) * 100))) : 0;
    const deberiasTenerHoy = daysInMonth > 0 ? (monto * remainingDays) / daysInMonth : 0;
    const gastoDiarioRecomendado = remainingDays > 0 ? deberiasTenerHoy / remainingDays : 0;

    return {
      monto,
      dayOfMonth,
      daysInMonth,
      remainingDays,
      mesTranscurrido,
      porcentajeMes,
      deberiasTenerHoy,
      gastoDiarioRecomendado,
      esPeriodoActual: true,
    };
  }

  if (periodo < currentPeriod) {
    return {
      monto,
      dayOfMonth: daysInMonth,
      daysInMonth,
      remainingDays: 0,
      mesTranscurrido: 1,
      porcentajeMes: 100,
      deberiasTenerHoy: 0,
      gastoDiarioRecomendado: 0,
      esPeriodoActual: false,
    };
  }

  return {
    monto,
    dayOfMonth: 0,
    daysInMonth,
    remainingDays: daysInMonth,
    mesTranscurrido: 0,
    porcentajeMes: 0,
    deberiasTenerHoy: monto,
    gastoDiarioRecomendado: daysInMonth > 0 ? monto / daysInMonth : 0,
    esPeriodoActual: false,
  };
}
