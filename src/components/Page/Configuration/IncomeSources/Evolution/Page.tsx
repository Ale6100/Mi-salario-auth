// src\components\Page\Configuration\IncomeSources\Evolution\Page.tsx

import { AlertCircle, ArrowLeft, Calendar, Clock, DollarSign, Minus, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { formatCompactPrice, formatPrice } from "@/lib/utils";
import { formatPeriodo } from "@/components/Page/Income/graph/ProfessionalTooltip";
import { formatPeriodoLargo, generarRangoPeriodos } from "@/lib/periodo";
import { MENSAJE_ERROR_CARGA, RUTAS } from "@/lib/const";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth0 } from "@auth0/auth0-react";
import { useConceptosIngresos } from "@/hooks/useConceptosIngresos";
import { useFuentesIngresos } from "@/hooks/useFuentesIngresos";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";

export const IncomeSourceEvolutionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth0();

  const { data: fuentes, isPending: isPendingFuentes, isLoadingError: isErrorFuentes } = useFuentesIngresos({ user });
  const { data: todosLosIngresos, isPending: isPendingIngresos, isLoadingError: isErrorIngresos } = useConceptosIngresos({ user });

  const fuente = useMemo(() => fuentes?.find((f) => f._id === id), [fuentes, id]);

  const ingresosFuente = useMemo(() => {
    if (!todosLosIngresos?.length || !id) return [];
    return todosLosIngresos.filter((i) => i.id_fuente_ingreso?._id === id);
  }, [todosLosIngresos, id]);

  const stats = useMemo(() => {
    if (!ingresosFuente.length) return null;

    const totalAcumulado = ingresosFuente.reduce((sum, i) => sum + (i.valor ?? 0), 0);
    const promedio = totalAcumulado / ingresosFuente.length;

    const cronologico = [...ingresosFuente].sort((a, b) => a.periodo.localeCompare(b.periodo));
    const ultimoIngreso = cronologico[cronologico.length - 1];
    const penultimoIngreso = cronologico.length >= 2 ? cronologico[cronologico.length - 2] : null;

    let variacionMesAnterior: { porcentaje: number; tipo: "aumento" | "disminucion" | "igual" } | null = null;
    if (
      penultimoIngreso?.valor != null &&
      penultimoIngreso.valor > 0 &&
      ultimoIngreso?.valor != null
    ) {
      const diff = ultimoIngreso.valor - penultimoIngreso.valor;
      const pct = (diff / penultimoIngreso.valor) * 100;
      variacionMesAnterior = {
        porcentaje: Math.abs(pct),
        tipo: diff > 0 ? "aumento" : diff < 0 ? "disminucion" : "igual",
      };
    }

    let maxIngreso = cronologico[0];
    for (const i of cronologico) {
      if ((i.valor ?? 0) > (maxIngreso.valor ?? 0)) {
        maxIngreso = i;
      }
    }

    const periodMap = new Map<string, { valor: number; cantidad: number }>();
    let minPeriodo = "";
    let maxPeriodo = "";

    for (const i of ingresosFuente) {
      if (!minPeriodo || i.periodo < minPeriodo) minPeriodo = i.periodo;
      if (!maxPeriodo || i.periodo > maxPeriodo) maxPeriodo = i.periodo;

      const prev = periodMap.get(i.periodo) || { valor: 0, cantidad: 0 };
      prev.valor += i.valor ?? 0;
      prev.cantidad += 1;
      periodMap.set(i.periodo, prev);
    }

    const todosLosPeriodos = generarRangoPeriodos(minPeriodo, maxPeriodo);
    const chartData = todosLosPeriodos.map((p) => {
      const dataInMonth = periodMap.get(p);
      return {
        periodo: p,
        valor: dataInMonth ? dataInMonth.valor : 0,
        tieneRegistro: Boolean(dataInMonth),
        cantidad: dataInMonth?.cantidad ?? 0,
      };
    });

    const descendente = [...cronologico].reverse().map((item, index, arr) => {
      const mesAnterior = arr[index + 1];
      let variacion: { porcentaje: number; tipo: "aumento" | "disminucion" | "igual" } | null = null;
      if (mesAnterior && mesAnterior.valor > 0) {
        const diff = item.valor - mesAnterior.valor;
        const pct = (diff / mesAnterior.valor) * 100;
        variacion = {
          porcentaje: Math.abs(pct),
          tipo: diff > 0 ? "aumento" : diff < 0 ? "disminucion" : "igual",
        };
      }
      return { ...item, variacion };
    });

    return {
      promedio,
      ultimoIngreso,
      variacionMesAnterior,
      maxIngreso,
      chartData,
      descendente,
    };
  }, [ingresosFuente]);

  const fuenteColor = fuente?.color || "#10b981";

  const chartConfig = useMemo(
    () =>
      ({
        valor: {
          label: "Ingreso",
          color: fuenteColor,
        },
      }) satisfies ChartConfig,
    [fuenteColor]
  );

  const isLoading = isPendingFuentes || isPendingIngresos;
  const isError = isErrorFuentes || isErrorIngresos;

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
        <Button variant="outline" onClick={() => navigate(RUTAS.configuration.incomeSources)}>
          Volver a fuentes de ingresos
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
          <h2 className="text-xl font-semibold">Fuente de ingreso no encontrada</h2>
          <p className="text-sm text-muted-foreground">
            La fuente solicitada no existe o no pertenece a tu cuenta.
          </p>
          <Button onClick={() => navigate(RUTAS.configuration.incomeSources)} className="cursor-pointer">
            Volver a fuentes de ingresos
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
          onClick={() => navigate(RUTAS.configuration.incomeSources)}
          className="cursor-pointer gap-2 -ml-2 text-muted-foreground hover:text-foreground text-xs sm:text-sm"
        >
          <ArrowLeft className="size-4" />
          Volver a fuentes de ingresos
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
            {fuente.aguinaldo && (
              <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50">
                Aguinaldo
              </span>
            )}
            {!fuente.activo && (
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                Inactiva
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Evolución histórica y análisis mensual para esta fuente de ingreso
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-medium text-muted-foreground">
            <Calendar className="size-3.5" />
            {ingresosFuente.length} {ingresosFuente.length === 1 ? "mes registrado" : "meses registrados"}
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
            <h3 className="text-lg font-semibold">Sin ingresos registrados</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Todavía no registraste ningún ingreso asociado a <strong>{fuente.nombre}</strong>. Podés agregarlo desde la sección de Gestión de ingresos.
            </p>
          </div>
          <Button onClick={() => navigate(RUTAS.income)} className="cursor-pointer">
            Ir a Gestionar ingresos
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="p-4 sm:p-5 space-y-2 bg-card rounded-xl shadow-sm border min-w-0">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Último ingreso</span>
                <Clock className="size-4" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-foreground truncate" title={formatPrice(stats.ultimoIngreso.valor)}>
                  {formatPrice(stats.ultimoIngreso.valor)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatPeriodoLargo(stats.ultimoIngreso.periodo)}
                </p>
              </div>
              {stats.variacionMesAnterior && (
                <div className="pt-1 flex items-center gap-1 text-xs">
                  {stats.variacionMesAnterior.tipo === "aumento" && (
                    <>
                      <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        +{stats.variacionMesAnterior.porcentaje.toFixed(1)}%
                      </span>
                    </>
                  )}
                  {stats.variacionMesAnterior.tipo === "disminucion" && (
                    <>
                      <TrendingDown className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
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
                  Calculado sobre {ingresosFuente.length} {ingresosFuente.length === 1 ? "mes" : "meses"}
                </p>
              </div>
            </Card>

            <Card className="p-4 sm:p-5 space-y-2 bg-card rounded-xl shadow-sm border min-w-0">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Ingreso máximo</span>
                <TrendingUp className="size-4" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-foreground truncate" title={formatPrice(stats.maxIngreso.valor)}>
                  {formatPrice(stats.maxIngreso.valor)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pico en {formatPeriodoLargo(stats.maxIngreso.periodo)}
                </p>
              </div>
            </Card>
          </div>

          <Card className="bg-card rounded-xl shadow-sm border min-w-0 overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold">Evolución mensual</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Monto ingresado por período
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0 min-w-0">
              <ChartContainer config={chartConfig} className="aspect-auto h-[280px] sm:h-[350px] md:h-[400px] w-full min-w-0">
                <AreaChart data={stats.chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradientFuenteIngreso" x1="0" y1="0" x2="0" y2="1">
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
                        valor: number;
                        tieneRegistro: boolean;
                        cantidad: number;
                      };
                      return (
                        <div className="min-w-40 sm:min-w-44 max-w-[260px] rounded-lg border border-border/50 bg-background/95 p-2.5 sm:p-3 shadow-lg backdrop-blur-sm space-y-1.5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/30 pb-1">
                            {formatPeriodo(dataPoint.periodo)} ({formatPeriodoLargo(dataPoint.periodo)})
                          </p>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-muted-foreground">Monto:</span>
                            <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                              {formatPrice(dataPoint.valor)}
                            </span>
                          </div>
                          {!dataPoint.tieneRegistro ? (
                            <p className="text-[11px] text-muted-foreground italic">
                              Sin ingresos registrados en este mes
                            </p>
                          ) : (
                            dataPoint.cantidad > 1 && (
                              <p className="text-[11px] text-muted-foreground">
                                {dataPoint.cantidad} ingresos registrados
                              </p>
                            )
                          )}
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="valor"
                    stroke={fuenteColor}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradientFuenteIngreso)"
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
                Detalle cronológico de todos los ingresos de esta fuente
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 min-w-0">
              <div className="w-full overflow-x-auto min-w-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap pl-4 sm:pl-6">Período</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Valor</TableHead>
                      <TableHead className="text-right whitespace-nowrap pr-4 sm:pr-6">Variación vs mes anterior</TableHead>
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
                          {formatPrice(item.valor)}
                        </TableCell>
                        <TableCell className="text-right pr-4 sm:pr-6">
                          {item.variacion ? (
                            <span
                              className={`inline-flex items-center gap-1 font-mono text-xs font-medium ${
                                item.variacion.tipo === "aumento"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : item.variacion.tipo === "disminucion"
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {item.variacion.tipo === "aumento" && (
                                <TrendingUp className="size-3 shrink-0" />
                              )}
                              {item.variacion.tipo === "disminucion" && (
                                <TrendingDown className="size-3 shrink-0" />
                              )}
                              {item.variacion.tipo === "igual" && (
                                <Minus className="size-3 shrink-0" />
                              )}
                              {item.variacion.tipo === "aumento" && "+"}
                              {item.variacion.tipo === "disminucion" && "-"}
                              {item.variacion.porcentaje.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
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
