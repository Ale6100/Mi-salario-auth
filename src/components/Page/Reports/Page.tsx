// src\components\Page\Reports\Page.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, History } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { generateReport, generateFullReport } from "./util";
import { Separator } from "@/components/ui/separator";
import { useAuth0 } from "@auth0/auth0-react";
import { useConceptosGastos } from "@/hooks/useConceptosGastos";
import { useConceptosIngresos } from "@/hooks/useConceptosIngresos";
import { useMemo, useState } from "react";
import CustomReactSelect from "@/components/select/CustomReactSelect";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const monthOptions = MONTHS.map((name, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label: name,
}));

export const ReportsPage = () => {
  const { user } = useAuth0();

  const today = new Date();
  const currentYear = today.getFullYear();
  const defaultMonth = String(today.getMonth() + 1).padStart(2, "0");
  const defaultYear = String(currentYear);

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const { data: allExpenses, isFetching: isFetchingExpenses } = useConceptosGastos({ user });
  const { data: allIncomes, isFetching: isFetchingAllIncomes } = useConceptosIngresos({ user });

  const yearOptions = useMemo(() => {
    const periods = new Set<string>();
    allExpenses.forEach((e) => periods.add(e.periodo));
    allIncomes.forEach((i) => periods.add(i.periodo));

    if (periods.size === 0) {
      return [{ value: String(currentYear), label: String(currentYear) }];
    }

    const years = new Set<number>();
    periods.forEach((p) => {
      const y = Number.parseInt(p.split("-")[0], 10);
      if (!Number.isNaN(y)) years.add(y);
    });

    const minYear = years.size > 0 ? Math.min(...years) : currentYear;
    return Array.from({ length: currentYear - minYear + 1 }, (_, i) => ({
      value: String(currentYear - i),
      label: String(currentYear - i),
    }));
  }, [allExpenses, allIncomes]);

  const filteredExpenses = useMemo(() => {
    const periodo = `${selectedYear}-${selectedMonth}`;
    return allExpenses.filter((exp) => exp.periodo === periodo);
  }, [allExpenses, selectedYear, selectedMonth]);

  const filteredIncomes = useMemo(() => {
    const periodo = `${selectedYear}-${selectedMonth}`;
    return allIncomes.filter((inc) => inc.periodo === periodo);
  }, [allIncomes, selectedYear, selectedMonth]);

  const reportData = useMemo(() => {
    const incomesData = filteredIncomes.map((inc) => ({
      fuente: inc.id_fuente_ingreso?.nombre ?? "Sin fuente",
      valor: inc.valor,
    }));

    const expensesData = filteredExpenses.map((exp) => ({
      fuente: exp.id_fuente_gasto?.nombre ?? "Sin fuente",
      color: exp.id_fuente_gasto?.color ?? "",
      monto: exp.monto ?? 0,
      pagado: exp.pagado,
      aclaracion: exp.aclaracion,
    }));

    return { incomesData, expensesData };
  }, [filteredIncomes, filteredExpenses]);

  const fullReportPeriods = useMemo(() => {
    const expensePeriods = new Set(allExpenses.map((e) => e.periodo));
    const incomePeriods = new Set(allIncomes.map((i) => i.periodo));
    const allPeriodsSet = new Set([...expensePeriods, ...incomePeriods]);
    const sortedPeriods = Array.from(allPeriodsSet).sort((a, b) => a.localeCompare(b));

    return sortedPeriods.map((periodo) => ({
      periodo,
      incomes: allIncomes
        .filter((i) => i.periodo === periodo)
        .map((inc) => ({
          fuente: inc.id_fuente_ingreso?.nombre ?? "Sin fuente",
          valor: inc.valor,
        })),
      expenses: allExpenses
        .filter((e) => e.periodo === periodo)
        .map((exp) => ({
          fuente: exp.id_fuente_gasto?.nombre ?? "Sin fuente",
          color: exp.id_fuente_gasto?.color ?? "",
          monto: exp.monto ?? 0,
          pagado: exp.pagado,
          aclaracion: exp.aclaracion,
        })),
    }));
  }, [allExpenses, allIncomes]);

  const totalIncomes = useMemo(
    () => reportData.incomesData.reduce((sum, inc) => sum + inc.valor, 0),
    [reportData.incomesData],
  );
  const totalGastos = useMemo(
    () => reportData.expensesData.reduce((sum, exp) => sum + exp.monto, 0),
    [reportData.expensesData],
  );

  const saldo = totalIncomes - totalGastos;

  const isFetching = isFetchingExpenses || isFetchingAllIncomes;

  const handleDownload = () => {
    const text = generateReport({
      month: selectedMonth,
      year: selectedYear,
      incomes: reportData.incomesData,
      expenses: reportData.expensesData,
    });

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const monthName = MONTHS[Number(selectedMonth) - 1];
    a.href = url;
    a.download = `reporte-financiero-${selectedYear}-${selectedMonth}-${monthName.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFull = () => {
    const text = generateFullReport({ periods: fullReportPeriods });

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-financiero-completo.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const monthLabel = `${MONTHS[Number(selectedMonth) - 1]} ${selectedYear}`;
  const currentMonthOption = monthOptions.find((o) => o.value === selectedMonth) ?? null;
  const currentYearOption = yearOptions.find((o) => o.value === selectedYear) ?? null;

  return (
    <section className="p-4 space-y-4 w-full max-w-7xl mx-auto">
      <h1 className="text-3xl max-sm:text-lg font-bold text-center">Reportes mensuales</h1>

      <p className="text-muted-foreground text-center text-sm max-w-md mx-auto">
        Seleccioná un mes y descargá un reporte completo de tus finanzas
      </p>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="size-5" />
            Período del reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-1.5">
              <p className="text-sm font-medium leading-none">Mes</p>
              <CustomReactSelect
                value={currentMonthOption}
                onChange={(option) => {
                  if (option) setSelectedMonth(option.value);
                }}
                options={monthOptions}
                placeholder="Seleccionar mes..."
                menuPosition="fixed"
              />
            </div>

            <div className="flex-1 space-y-1.5">
              <p className="text-sm font-medium leading-none">Año</p>
              <CustomReactSelect
                value={currentYearOption}
                onChange={(option) => {
                  if (option) setSelectedYear(option.value);
                }}
                options={yearOptions}
                placeholder="Seleccionar año..."
                menuPosition="fixed"
              />
            </div>

            <Button
              onClick={handleDownload}
              disabled={isFetching}
              className="cursor-pointer gap-2 shrink-0"
            >
              <Download className="size-4" />
              Descargar
            </Button>
          </div>
        </CardContent>
      </Card>

      {fullReportPeriods.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="size-5" />
              Historial completo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {fullReportPeriods.length} períodos con actividad registrada.
              Descargá un reporte consolidado de todo tu historial financiero.
            </p>
            <Button
              onClick={handleDownloadFull}
              disabled={isFetching}
              variant="outline"
              className="cursor-pointer gap-2 w-full"
            >
              <Download className="size-4" />
              Descargar historial completo ({fullReportPeriods.length} períodos)
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator className="my-4" />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-center">
          Vista previa - {monthLabel}
        </h2>

        {isFetching ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground text-sm">Cargando datos...</p>
          </div>
        ) : (
          <Card className="p-4">
            <CardContent className="px-0 space-y-3">

              <div>
                <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                  INGRESOS
                </h3>
                {reportData.incomesData.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Sin ingresos registrados</p>
                ) : (
                  <div className="space-y-1">
                    {reportData.incomesData.map((inc, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{inc.fuente}</span>
                        <span className="font-mono">{formatPrice(inc.valor)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between my-2 text-sm font-semibold">
                  <span>Total ingresos</span>
                  <span className="font-mono">{formatPrice(totalIncomes)}</span>
                </div>
              </div>

              {reportData.expensesData.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
                    GASTOS
                  </h3>
                  <div className="space-y-1">
                    {reportData.expensesData.map((exp, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span style={exp.color ? { color: exp.color } : undefined}>
                          {exp.fuente}
                          {exp.aclaracion && (
                            <span className="ml-1 text-xs text-muted-foreground">({exp.aclaracion})</span>
                          )}
                        </span>
                        <span className="font-mono">{formatPrice(exp.monto)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex my-2 justify-between text-sm font-semibold">
                    <span>Total gastos</span>
                    <span className="font-mono">{formatPrice(totalGastos)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Sin gastos registrados</p>
              )}

              <Separator className="my-2" />

              <div className="pt-1 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ingresos - Gastos</span>
                  <span className={`font-mono ${saldo >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                    {formatPrice(saldo)}
                  </span>
                </div>

              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};
