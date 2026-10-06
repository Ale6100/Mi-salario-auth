import { format } from "date-fns";
import { es } from "date-fns/locale";

const AVISO_MONEDA = "Todos los montos están expresados en pesos argentinos (ARS).";

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

const monthYearFromPeriodo = (periodo: string): string => {
  const [year, month] = periodo.split("-");
  const monthName = format(new Date(Number(year), Number(month) - 1), "MMMM", { locale: es });
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
};

const getFechaGeneracion = () => format(new Date(), "dd/MM/yyyy HH:mm", { locale: es });

const escapeCeldaMarkdown = (texto: string): string => {
  return texto.replaceAll("|", String.raw`\|`).replaceAll(/\r?\n/g, " ");
};

const buildPeriodMarkdown = (incomes: Income[], expenses: Expense[]): string[] => {
  const totalIncomes = incomes.reduce((sum, inc) => sum + inc.valor, 0);
  const totalGastos = expenses.reduce((sum, e) => sum + e.monto, 0);

  return [
    "### Ingresos",
    "",
    ...(incomes.length === 0
      ? ["Sin ingresos registrados."]
      : [
        "| Fuente | Monto |",
        "| --- | ---: |",
        ...incomes.map((inc) => `| ${escapeCeldaMarkdown(inc.fuente)} | ${formatPrice(inc.valor)} |`),
      ]),
    "",
    `**Total ingresos:** ${formatPrice(totalIncomes)}`,
    "",
    "### Gastos",
    "",
    ...(expenses.length === 0
      ? ["Sin gastos registrados."]
      : [
        "| Fuente | Monto | Aclaración |",
        "| --- | ---: | --- |",
        ...expenses.map((exp) => `| ${escapeCeldaMarkdown(exp.fuente)} | ${formatPrice(exp.monto)} | ${escapeCeldaMarkdown(exp.aclaracion ?? "")} |`),
      ]),
    "",
    `**Total gastos:** ${formatPrice(totalGastos)}`,
  ];
};

export const generateReport = ({ month, year, incomes, expenses }: SingleReportParams): string => {
  const monthYear = monthYearFromPeriodo(`${year}-${month}`);

  const lines: string[] = [
    "# Reporte financiero mensual",
    "",
    AVISO_MONEDA,
    "",
    `- **Generado el:** ${getFechaGeneracion()}`,
    "",
    `## ${monthYear}`,
    "",
    ...buildPeriodMarkdown(incomes, expenses),
    "",
  ];

  return lines.join("\n");
};

export const generateFullReport = ({ periods }: FullReportParams): string => {
  const firstPeriodo = periods.at(0)?.periodo;
  const lastPeriodo = periods.at(-1)?.periodo;

  const globalIncome = periods.reduce((sum, p) => sum + p.incomes.reduce((s, i) => s + i.valor, 0), 0);
  const globalGastos = periods.reduce((sum, p) => sum + p.expenses.reduce((s, e) => s + e.monto, 0), 0);

  const promedio = (total: number) => periods.length > 0 ? total / periods.length : 0;

  const lines: string[] = [
    "# Reporte financiero completo",
    "",
    AVISO_MONEDA,
    "",
    `- **Períodos:** ${periods.length}`,
    `- **Desde:** ${firstPeriodo ? monthYearFromPeriodo(firstPeriodo) : "-"}`,
    `- **Hasta:** ${lastPeriodo ? monthYearFromPeriodo(lastPeriodo) : "-"}`,
    `- **Generado el:** ${getFechaGeneracion()}`,
  ];

  for (const period of periods) {
    lines.push(
      "",
      `## ${monthYearFromPeriodo(period.periodo)}`,
      "",
      ...buildPeriodMarkdown(period.incomes, period.expenses),
    );
  }

  lines.push(
    "",
    "## Resumen global",
    "",
    "| Indicador | Monto |",
    "| --- | ---: |",
    `| Total ingresos | ${formatPrice(globalIncome)} |`,
    `| Total gastos | ${formatPrice(globalGastos)} |`,
    `| Promedio ingresos / mes | ${formatPrice(promedio(globalIncome))} |`,
    `| Promedio gastos / mes | ${formatPrice(promedio(globalGastos))} |`,
    "",
  );

  return lines.join("\n");
};
