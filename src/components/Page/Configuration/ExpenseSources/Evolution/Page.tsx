// src\components\Page\Configuration\ExpenseSources\Evolution\Page.tsx

import { AlertCircle, ArrowLeft, Calendar, Clock, DollarSign, Minus, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { cn, formatCompactPrice, formatPrice } from "@/lib/utils";
import { formatPeriodo } from "@/components/Page/Income/graph/ProfessionalTooltip";
import { formatPeriodoLargo, generarRangoPeriodos } from "@/lib/periodo";
import { MENSAJE_ERROR_CARGA, RUTAS } from "@/lib/const";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth0 } from "@auth0/auth0-react";
import { useConceptosGastos } from "@/hooks/useConceptosGastos";
import { useFuentesGastos } from "@/hooks/useFuentesGastos";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";

export const ExpenseSourceEvolutionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth0();

  const { data: fuentes, isPending: isPendingFuentes, isLoadingError: isErrorFuentes } = useFuentesGastos({ user });
  const { data: todosLosGastos, isPending: isPendingGastos, isLoadingError: isErrorGastos } = useConceptosGastos({ user });

  const fuente = useMemo(() => fuentes?.find((f) => f._id === id), [fuentes, id]);

  const gastosFuente = useMemo(() => {
    if (!todosLosGastos?.length || !id) return [];
    return todosLosGastos.filter((g) => g.id_fuente_gasto?._id === id);
  }, [todosLosGastos, id]);

  const stats = useMemo(() => {
    if (!gastosFuente.length) return null;

    const totalAcumulado = gastosFuente.reduce((sum, g) => sum + (g.monto ?? 0), 0);
    const promedio = totalAcumulado / gastosFuente.length;

    const cronologico = [...gastosFuente].sort((a, b) => a.periodo.localeCompare(b.periodo));
    const ultimoGasto = cronologico[cronologico.length - 1];
    const penultimoGasto = cronologico.length >= 2 ? cronologico[cronologico.length - 2] : null;

    let variacionMesAnterior: { porcentaje: number; tipo: "aumento" | "disminucion" | "igual" } | null = null;
    if (
      penultimoGasto?.monto != null &&
      penultimoGasto.monto > 0 &&
      ultimoGasto?.monto != null
    ) {
      const diff = ultimoGasto.monto - penultimoGasto.monto;
      const pct = (diff / penultimoGasto.monto) * 100;
      variacionMesAnterior = {
        porcentaje: Math.abs(pct),
        tipo: diff > 0 ? "aumento" : diff < 0 ? "disminucion" : "igual",
      };
    }

    let maxGasto = cronologico[0];
    for (const g of cronologico) {
      if ((g.monto ?? 0) > (maxGasto.monto ?? 0)) {
        maxGasto = g;
      }
    }

    const periodMap = new Map<
      string,
      { monto: number; cantidad: number; pagado: boolean; aclaracion?: string }
    >();
    let minPeriodo = "";
    let maxPeriodo = "";

    for (const g of gastosFuente) {
      if (!minPeriodo || g.periodo < minPeriodo) minPeriodo = g.periodo;
      if (!maxPeriodo || g.periodo > maxPeriodo) maxPeriodo = g.periodo;

      const prev = periodMap.get(g.periodo) || {
        monto: 0,
        cantidad: 0,
        pagado: true,
        aclaracion: undefined,
      };
      prev.monto += g.monto ?? 0;
      prev.cantidad += 1;
      if (!g.pagado) prev.pagado = false;
      if (g.aclaracion) {
        prev.aclaracion = prev.aclaracion
          ? `${prev.aclaracion}; ${g.aclaracion}`
          : g.aclaracion;
      }
      periodMap.set(g.periodo, prev);
    }

    const todosLosPeriodos = generarRangoPeriodos(minPeriodo, maxPeriodo);
    const chartData = todosLosPeriodos.map((p) => {
      const dataInMonth = periodMap.get(p);
      return {
        periodo: p,
        monto: dataInMonth ? dataInMonth.monto : 0,
        tieneRegistro: Boolean(dataInMonth),
        cantidad: dataInMonth?.cantidad ?? 0,
        pagado: dataInMonth?.pagado ?? true,
        aclaracion: dataInMonth?.aclaracion,
      };
    });

    const descendente = [...gastosFuente].sort((a, b) => b.periodo.localeCompare(a.periodo));

    return {
      promedio,
      ultimoGasto,
      variacionMesAnterior,
      maxGasto,
      chartData,
      descendente,
    };
  }, [gastosFuente]);

  const fuenteColor = fuente?.color || "#3b82f6";

  const chartConfig = useMemo(
    () =>
      ({
        monto: {
          label: "Gasto",
          color: fuenteColor,
        },
      }) satisfies ChartConfig,
    [fuenteColor]
  );

  const isLoading = isPendingFuentes || isPendingGastos;
  const isError = isErrorFuentes || isErrorGastos;

  if (isLoading) {
    return (
      <section className="p-3 sm:p-4 space-y-5 sm:space-y-6 w-full max-w-7xl mx-auto min-w-0 overflow-x-hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2 min-w-0">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-3 w-24" />
            </Card>
          ))}
        </div>
        <Card className="p-4 sm:p-6 min-w-0">
          <Skeleton className="h-[300px] sm:h-[360px] w-full" />
        </Card>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="p-4 space-y-4 max-w-md mx-auto text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{MENSAJE_ERROR_CARGA}</p>
        <Button variant="outline" onClick={() => navigate(RUTAS.configuration.expenseSources)}>
          Volver a fuentes de gastos
        </Button>
      </section>
    );
  }

  if (!fuente) {
    return (
      <section className="p-4 space-y-4 max-w-md mx-auto text-center">
        <Card className="p-6 space-y-4">
          <div className="flex justify-center text-muted-foreground">
            <AlertCircle className="size-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold">Fuente de gasto no encontrada</h2>
          <p className="text-sm text-muted-foreground">
            La fuente solicitada no existe o no pertenece a tu cuenta.
          </p>
          <Button onClick={() => navigate(RUTAS.configuration.expenseSources)} className="cursor-pointer">
            Volver a fuentes de gastos
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="p-3 sm:p-4 space-y-5 sm:space-y-6 w-full max-w-7xl mx-auto min-w-0 overflow-x-hidden">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(RUTAS.configuration.expenseSources)}
          className="cursor-pointer gap-2 -ml-2 text-muted-foreground hover:text-foreground text-xs sm:text-sm"
        >
          <ArrowLeft className="size-4" />
          Volver a fuentes de gastos
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 min-w-0">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <span
              className="size-3.5 sm:size-4 rounded-full shrink-0 border border-border"
              style={{ backgroundColor: fuente.color }}
              title={fuente.color}
            />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words">{fuente.nombre}</h1>
            {fuente.es_indispensable && (
              <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                Indispensable
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Evolución histórica y análisis mensual para esta fuente de gasto
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-medium text-muted-foreground">
            <Calendar className="size-3.5" />
            {gastosFuente.length} {gastosFuente.length === 1 ? "mes registrado" : "meses registrados"}
          </span>
        </div>
      </div>

      <Separator />

      {!stats ? (
        <Card className="p-8 sm:p-12 text-center space-y-4 bg-card rounded-xl shadow-sm border min-w-0">
          <div className="flex justify-center text-muted-foreground">
            <Receipt className="size-10 sm:size-12 stroke-1" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Sin gastos registrados</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Todavía no registraste ningún gasto asociado a <strong>{fuente.nombre}</strong>. Podés agregarlo desde la sección de Gestión de gastos.
            </p>
          </div>
          <Button onClick={() => navigate(RUTAS.expenses)} className="cursor-pointer">
            Ir a Gestionar gastos
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="p-4 sm:p-5 space-y-2 bg-card rounded-xl shadow-sm border min-w-0">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Último gasto</span>
                <Clock className="size-4" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-foreground truncate" title={formatPrice(stats.ultimoGasto.monto ?? 0)}>
                  {formatPrice(stats.ultimoGasto.monto ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatPeriodoLargo(stats.ultimoGasto.periodo)}
                </p>
              </div>
              {stats.variacionMesAnterior && (
                <div className="pt-1 flex items-center gap-1 text-xs">
                  {stats.variacionMesAnterior.tipo === "aumento" && (
                    <>
                      <TrendingUp className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        +{stats.variacionMesAnterior.porcentaje.toFixed(1)}%
                      </span>
                    </>
                  )}
                  {stats.variacionMesAnterior.tipo === "disminucion" && (
                    <>
                      <TrendingDown className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        -{stats.variacionMesAnterior.porcentaje.toFixed(1)}%
                      </span>
                    </>
                  )}
                  {stats.variacionMesAnterior.tipo === "igual" && (
                    <>
                      <Minus className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground font-medium">
                        0.0%
                      </span>
                    </>
                  )}
                  <span className="text-muted-foreground">vs mes anterior</span>
                </div>
              )}
            </Card>

            <Card className="p-4 sm:p-5 space-y-2 bg-card rounded-xl shadow-sm border min-w-0">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Promedio mensual</span>
                <DollarSign className="size-4" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-foreground truncate" title={formatPrice(stats.promedio)}>
                  {formatPrice(stats.promedio)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Calculado sobre {gastosFuente.length} {gastosFuente.length === 1 ? "mes" : "meses"}
                </p>
              </div>
            </Card>

            <Card className="p-4 sm:p-5 space-y-2 bg-card rounded-xl shadow-sm border min-w-0">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Gasto máximo</span>
                <TrendingUp className="size-4" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-foreground truncate" title={formatPrice(stats.maxGasto.monto ?? 0)}>
                  {formatPrice(stats.maxGasto.monto ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pico en {formatPeriodoLargo(stats.maxGasto.periodo)}
                </p>
              </div>
            </Card>
          </div>

          <Card className="bg-card rounded-xl shadow-sm border min-w-0 overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold">Evolución mensual</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Monto gastado por período
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0 min-w-0">
              <ChartContainer config={chartConfig} className="aspect-auto h-[280px] sm:h-[350px] md:h-[400px] w-full min-w-0">
                <AreaChart data={stats.chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradientFuente" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={fuenteColor} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={fuenteColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="periodo"
                    tickLine={false}
                    tickMargin={8}
                    axisLine={false}
                    tickFormatter={formatPeriodo}
                    minTickGap={16}
                  />
                  <YAxis
                    tickLine={false}
                    tickMargin={6}
                    axisLine={false}
                    width={45}
                    tickFormatter={formatCompactPrice}
                  />
                  <ReferenceLine
                    y={stats.promedio}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={{
                      value: `Promedio: ${formatCompactPrice(stats.promedio)}`,
                      position: "insideTopRight",
                      fill: "#94a3b8",
                      fontSize: 12,
                    }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const dataPoint = payload[0].payload as {
                        periodo: string;
                        monto: number;
                        tieneRegistro: boolean;
                        cantidad: number;
                        pagado: boolean;
                        aclaracion?: string;
                      };
                      return (
                        <div className="min-w-40 sm:min-w-44 max-w-[260px] rounded-lg border border-border/50 bg-background/95 p-2.5 sm:p-3 shadow-lg backdrop-blur-sm space-y-1.5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/30 pb-1">
                            {formatPeriodo(dataPoint.periodo)} ({formatPeriodoLargo(dataPoint.periodo)})
                          </p>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-muted-foreground">Monto:</span>
                            <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                              {formatPrice(dataPoint.monto)}
                            </span>
                          </div>
                          {dataPoint.tieneRegistro ? (
                            <>
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs text-muted-foreground">Estado:</span>
                                <span
                                  className={cn(
                                    "text-xs font-medium",
                                    dataPoint.pagado
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-amber-600 dark:text-amber-400"
                                  )}
                                >
                                  {dataPoint.cantidad > 1
                                    ? `${dataPoint.cantidad} registros (${dataPoint.pagado ? "Pagados" : "Pendientes"})`
                                    : dataPoint.pagado
                                      ? "Pagado"
                                      : "Pendiente"}
                                </span>
                              </div>
                              {dataPoint.aclaracion && (
                                <div className="pt-1 text-[11px] text-muted-foreground border-t border-border/30 break-words">
                                  {dataPoint.aclaracion}
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-[11px] text-muted-foreground italic">
                              Sin gastos registrados en este mes
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="monto"
                    stroke={fuenteColor}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradientFuente)"
                    dot={{ fill: fuenteColor, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-card rounded-xl shadow-sm border min-w-0 overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold">Historial de registros</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Detalle cronológico de todos los gastos de esta fuente
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 min-w-0">
              <div className="w-full overflow-x-auto min-w-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap pl-4 sm:pl-6">Período</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Monto</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Estado</TableHead>
                      <TableHead className="pr-4 sm:pr-6 min-w-[140px]">Aclaración / Cuota</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.descendente.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium whitespace-nowrap pl-4 sm:pl-6">
                          {formatPeriodoLargo(item.periodo)}
                          <span className="text-xs text-muted-foreground font-mono ml-1.5">
                            ({item.periodo})
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium whitespace-nowrap">
                          {formatPrice(item.monto ?? 0)}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          {item.pagado ? (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                              Pagado
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                              Pendiente
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs sm:text-sm pr-4 sm:pr-6 max-w-[200px] sm:max-w-xs md:max-w-md break-words whitespace-normal">
                          {item.aclaracion || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
};
