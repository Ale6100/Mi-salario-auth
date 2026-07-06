import { format } from "date-fns";
import { es } from "date-fns/locale";

const SEPARATOR = "=".repeat(60);
const SUB_SEPARATOR = "-".repeat(60);
const SUB_SEPARATOR_SMALL = "-".repeat(44);

const formatPrice = (value: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

type Income = {
  fuente: string;
  valor: number;
};

type Expense = {
  fuente: string;
  color: string;
  monto: number;
  pagado: boolean;
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
  const totalGastos = expenses.reduce((sum, e) => sum + e.monto, 0);

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
    "GASTOS DEL MES",
    SUB_SEPARATOR,
    ` ${"Fuente".padEnd(30)} ${"Monto".padStart(14)}`,
    SUB_SEPARATOR_SMALL,
    ...(expenses.length === 0
      ? [` ${"Sin gastos registrados".padEnd(44)}`]
      : expenses.map((exp) => {
        const line = ` ${exp.fuente.padEnd(30)} ${formatPrice(exp.monto).padStart(14)}`;
        if (exp.aclaracion) {
          return `${line}
 ${`→ ${exp.aclaracion}`.padEnd(46)}`;
        }
        return line;
      })),
    SUB_SEPARATOR_SMALL,
    padValue("TOTAL GASTOS", formatPrice(totalGastos)),
    "",
  ];

  const saldoReal = totalIncomes - totalGastos;

  lines.push(
    "RESUMEN",
    SUB_SEPARATOR,
    padValue("Ingresos", formatPrice(totalIncomes)),
    padValue("Gastos totales", formatPrice(totalGastos)),
    SUB_SEPARATOR_SMALL,
    padValue("SALDO (Ingresos - Gastos)", formatPrice(saldoReal)),
  );

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

  let globalIncome = 0;
  let globalGastos = 0;

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
    const inc = period.incomes.reduce((s, i) => s + i.valor, 0);
    const gastos = period.expenses.reduce((s, e) => s + e.monto, 0);

    globalIncome += inc;
    globalGastos += gastos;

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

  const saldoGlobal = globalIncome - globalGastos;

  allLines.push(
    SEPARATOR,
    `           RESUMEN GLOBAL`,
    SEPARATOR,
    "",
    "ACUMULADO DE TODOS LOS PERIODOS",
    SUB_SEPARATOR,
    padValue("Total ingresos", formatPrice(globalIncome)),
    padValue("Total gastos", formatPrice(globalGastos)),
    SUB_SEPARATOR_SMALL,
    padValue("SALDO (Ingresos - Gastos)", formatPrice(saldoGlobal)),
  );

  allLines.push(
    "",
    "INDICADORES GLOBALES",
    SUB_SEPARATOR,
    ` ${"Períodos totales:".padEnd(30)} ${String(periods.length).padStart(10)}`,
    ` ${"Promedio ingresos / mes:".padEnd(30)} ${formatPrice(periods.length > 0 ? globalIncome / periods.length : 0).padStart(14)}`,
    ` ${"Promedio gastos / mes:".padEnd(30)} ${formatPrice(periods.length > 0 ? globalGastos / periods.length : 0).padStart(14)}`,
  );

  allLines.push("", SEPARATOR, ` Generado el: ${now}`, SEPARATOR);

  return allLines.join("\n");
};
