// src\components\Page\Reports\util.ts

import { format } from "date-fns";
import { es } from "date-fns/locale";

const SEPARATOR = "=".repeat(60);
const SUB_SEPARATOR = "-".repeat(60);
const SUB_SEPARATOR_SMALL = "-".repeat(44);

const formatPrice = (value: number | undefined | null): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
};

type Income = {
  fuente: string;
  valor: number;
};

type Expense = {
  fuente: string;
  color: string;
  montoEstimado: number;
  montoReal: number | undefined | null;
  aclaracion?: string;
};

type SingleReportParams = {
  month: string;
  year: string;
  incomes: Income[];
  expenses: Expense[];
};

type PeriodData = {
  periodo: string;
  incomes: Income[];
  expenses: Expense[];
};

type FullReportParams = {
  periods: PeriodData[];
};

const padValue = (label: string, value: string, pad: number = 44): string => {
  return ` ${label.padEnd(pad - value.length - 1)}${value}`;
};

const monthYearFromPeriodo = (periodo: string): string => {
  const [year, month] = periodo.split("-");
  const monthName = format(new Date(Number(year), Number(month) - 1), "MMMM", { locale: es });
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
};

const buildPeriodSection = (incomes: Income[], expenses: Expense[]): string[] => {
  const totalIncomes = incomes.reduce((sum, inc) => sum + inc.valor, 0);
  const totalExpensesEstimated = expenses.reduce((sum, exp) => sum + exp.montoEstimado, 0);
  const totalExpensesReal = expenses.reduce((sum, exp) => sum + (exp.montoReal ?? 0), 0);
  const hasRealExpenses = expenses.some((exp) => exp.montoReal != null);

  const lines: string[] = [
    "INGRESOS DEL MES",
    SUB_SEPARATOR,
    ` ${"Fuente".padEnd(30)} ${"Monto".padStart(14)}`,
    SUB_SEPARATOR_SMALL,
    ...(incomes.length === 0
      ? [` ${"Sin ingresos registrados".padEnd(44)}`]
      : incomes.map((inc) => ` ${inc.fuente.padEnd(30)} ${formatPrice(inc.valor).padStart(14)}`)),
    SUB_SEPARATOR_SMALL,
    padValue("TOTAL INGRESOS", formatPrice(totalIncomes)),
    "",
    "GASTOS ESTIMADOS DEL MES",
    SUB_SEPARATOR,
    ` ${"Fuente".padEnd(30)} ${"Monto Estimado".padStart(14)}`,
    SUB_SEPARATOR_SMALL,
    ...(expenses.length === 0
      ? [` ${"Sin gastos registrados".padEnd(44)}`]
      : expenses.map((exp) => {
        const line = ` ${exp.fuente.padEnd(30)} ${formatPrice(exp.montoEstimado).padStart(14)}`;
        if (exp.aclaracion) {
          return `${line}
 ${`→ ${exp.aclaracion}`.padEnd(46)}`;
        }
        return line;
      })),
    SUB_SEPARATOR_SMALL,
    padValue("TOTAL GASTOS ESTIMADOS", formatPrice(totalExpensesEstimated)),
    "",
  ];

  if (hasRealExpenses) {
    lines.push(
      "GASTOS REALES DEL MES",
      SUB_SEPARATOR,
      ` ${"Fuente".padEnd(30)} ${"Monto Real".padStart(14)}`,
      SUB_SEPARATOR_SMALL,
    );
    for (const exp of expenses) {
      if (exp.montoReal == null) continue;
      const line = ` ${exp.fuente.padEnd(30)} ${formatPrice(exp.montoReal).padStart(14)}`;
      if (exp.aclaracion) {
        lines.push(line, ` ${`→ ${exp.aclaracion}`.padEnd(46)}`);
      } else {
        lines.push(line);
      }
    }
    lines.push(SUB_SEPARATOR_SMALL, padValue("TOTAL GASTOS REALES", formatPrice(totalExpensesReal)), "");
  }

  lines.push(
    "INDICADORES",
    SUB_SEPARATOR,
    ` ${"Total ingresos:".padEnd(30)} ${formatPrice(totalIncomes).padStart(14)}`,
    ` ${"Total gastos estimados:".padEnd(30)} ${formatPrice(totalExpensesEstimated).padStart(14)}`,
  );

  if (hasRealExpenses) {
    const diff = totalIncomes - totalExpensesReal;
    lines.push(
      ` ${"Total gastos reales:".padEnd(30)} ${formatPrice(totalExpensesReal).padStart(14)}`,
      SUB_SEPARATOR_SMALL,
      ` ${"SALDO:".padEnd(30)} ${formatPrice(diff).padStart(14)}`,
    );
  }

  return lines;
};

export const generateReport = ({ month, year, incomes, expenses }: SingleReportParams): string => {
  const monthYear = monthYearFromPeriodo(`${year}-${month}`);
  const now = format(new Date(), "dd/MM/yyyy HH:mm", { locale: es });

  const periodLines = buildPeriodSection(incomes, expenses);

  const allLines: string[] = [
    SEPARATOR,
    `           REPORTE FINANCIERO MENSUAL`,
    `           ${monthYear}`,
    SEPARATOR,
    "",
    ...periodLines,
    "",
    SEPARATOR,
    ` Generado el: ${now}`,
    SEPARATOR,
  ];

  return allLines.join("\n");
};

export const generateFullReport = ({ periods }: FullReportParams): string => {
  const now = format(new Date(), "dd/MM/yyyy HH:mm", { locale: es });
  const firstPeriodo = periods.at(0)?.periodo;
  const lastPeriodo = periods.at(-1)?.periodo;

  let globalTotalIncomes = 0;
  let globalTotalEstimated = 0;
  let globalTotalReal = 0;
  let globalCountWithReal = 0;

  const allLines: string[] = [
    SEPARATOR,
    `           REPORTE FINANCIERO COMPLETO`,
    `           Todo el historial`,
    SEPARATOR,
    "",
    ` Períodos: ${periods.length}`,
    ` Desde: ${firstPeriodo ? monthYearFromPeriodo(firstPeriodo) : "-"}`,
    ` Hasta: ${lastPeriodo ? monthYearFromPeriodo(lastPeriodo) : "-"}`,
    "",
    "=".repeat(60),
  ];

  for (const period of periods) {
    const label = monthYearFromPeriodo(period.periodo);
    const periodIncomes = period.incomes.reduce((s, inc) => s + inc.valor, 0);
    const periodEstimated = period.expenses.reduce((s, exp) => s + exp.montoEstimado, 0);
    const periodReal = period.expenses.reduce((s, exp) => s + (exp.montoReal ?? 0), 0);
    const hasReal = period.expenses.some((exp) => exp.montoReal != null);

    globalTotalIncomes += periodIncomes;
    globalTotalEstimated += periodEstimated;
    globalTotalReal += periodReal;
    if (hasReal) globalCountWithReal++;

    const sectionLines = buildPeriodSection(period.incomes, period.expenses);

    allLines.push(
      "",
      `  PERIODO: ${label}`,
      "=".repeat(60),
      "",
      ...sectionLines,
      "",
    );
  }

  const globalAhorro = globalTotalIncomes > 0 ? ((globalTotalIncomes - globalTotalReal) / globalTotalIncomes) * 100 : 0;
  const globalComparacion = globalTotalEstimated > 0 ? (globalTotalReal / globalTotalEstimated) * 100 : 0;
  const hasAnyReal = globalCountWithReal > 0;

  allLines.push(
    SEPARATOR,
    `           RESUMEN GLOBAL`,
    SEPARATOR,
    "",
    "ACUMULADO DE TODOS LOS PERIODOS",
    SUB_SEPARATOR,
    padValue("Total ingresos", formatPrice(globalTotalIncomes)),
    padValue("Total gastos estimados", formatPrice(globalTotalEstimated)),
  );

  if (hasAnyReal) {
    const diff = globalTotalIncomes - globalTotalReal;
    allLines.push(
      padValue("Total gastos reales", formatPrice(globalTotalReal)),
      SUB_SEPARATOR_SMALL,
      padValue("SALDO ACUMULADO (Ingresos - Gtos reales)", formatPrice(diff)),
    );
  }

  allLines.push(
    "",
    "INDICADORES GLOBALES",
    SUB_SEPARATOR,
    ` ${"Porcentaje ahorrado total:".padEnd(30)} ${globalAhorro.toFixed(2).padStart(10)} %`,
  );

  if (hasAnyReal && globalTotalEstimated > 0) {
    allLines.push(` ${"Gastos reales vs estimados:".padEnd(30)} ${globalComparacion.toFixed(2).padStart(10)} %`);
  }

  allLines.push(
    ` ${"Total de períodos:".padEnd(30)} ${String(periods.length).padStart(10)}`,
    ` ${"Promedio ingresos por mes:".padEnd(30)} ${formatPrice(periods.length > 0 ? globalTotalIncomes / periods.length : 0).padStart(14)}`,
    ` ${"Promedio gastos estimados por mes:".padEnd(30)} ${formatPrice(periods.length > 0 ? globalTotalEstimated / periods.length : 0).padStart(14)}`,
  );

  if (hasAnyReal) {
    allLines.push(` ${"Promedio gastos reales por mes:".padEnd(30)} ${formatPrice(periods.length > 0 ? globalTotalReal / periods.length : 0).padStart(14)}`);
  }

  if (globalTotalIncomes > 0) {
    const pct = Math.min(Math.max(globalAhorro, 0), 100);
    const filledCount = Math.round(pct / 5);
    const emptyCount = 20 - filledCount;
    const bar = "█".repeat(filledCount) + "░".repeat(emptyCount);
    allLines.push("", ` Ahorro global: [${bar}] ${pct.toFixed(1)}%`);
  }

  allLines.push("", SEPARATOR, ` Generado el: ${now}`, SEPARATOR);

  return allLines.join("\n");
};
