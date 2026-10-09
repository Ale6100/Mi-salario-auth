// src\components\Page\EmergencyFund\Page.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle, EyeOff, Landmark, PiggyBank, ChevronsRight, DollarSign, Goal, MousePointerClick, Percent, RefreshCw, TrendingUp, Trophy } from "lucide-react";
import { fetchPatchFondoEmergencia } from "@/lib/fetch/fondoEmergencia";
import { format } from "date-fns";
import { formatPrice, redondearCentavos } from "@/lib/utils";
import { getDataOrThrow } from "@/lib/fetch/backend";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import { useConceptosGastos } from "@/hooks/useConceptosGastos";
import { useConceptosIngresos } from "@/hooks/useConceptosIngresos";
import { useCotizacionDolarMep } from "@/hooks/useCotizacionDolarMep";
import { useFondoEmergencia } from "@/hooks/useFondoEmergencia";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PATCHFondoEmergencia } from "@/types/fondoEmergencia";

const PORCENTAJE_TOTAL_POR_DEFECTO = 33.33;

const MILESTONES = [
  { meses: 1, label: "1 mes" },
  { meses: 2, label: "2 meses" },
  { meses: 3, label: "3 meses" },
  { meses: 4, label: "4 meses" },
  { meses: 6, label: "6 meses" },
  { meses: 12, label: "1 año" },
  { meses: 24, label: "2 años" },
  { meses: 36, label: "3 años" },
  { meses: 48, label: "4 años" },
  { meses: 72, label: "6 años" },
  { meses: 144, label: "12 años" },
] as const;

const formatUSD = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const EmergencyFundPage = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const { data, isPending, isSuccess, isFetching, isLoadingError: isError } = useFondoEmergencia({ user });
  const { data: cotizacionMep, isError: isErrorCotizacion } = useCotizacionDolarMep();

  const { data: ingresosMesActual, isPending: isPendingIngresosMesActual, isLoadingError: isErrorIngresosMesActual } = useConceptosIngresos({
    user,
    periodo: format(new Date(), "yyyy-MM"),
  });
  const { data: gastosMesActual, isPending: isPendingGastosMesActual, isLoadingError: isErrorGastosMesActual } = useConceptosGastos({
    user,
    periodo: format(new Date(), "yyyy-MM"),
  });

  const ingresosTotalesDelMes = useMemo(() => {
    if (!ingresosMesActual?.length) return 0;
    return ingresosMesActual.reduce((total, ingreso) => total + ingreso.valor, 0);
  }, [ingresosMesActual]);

  const gastosIndispensablesDelMes = useMemo(() => {
    if (!gastosMesActual?.length) return [];
    return gastosMesActual.filter(gasto => gasto.id_fuente_gasto?.es_indispensable === true);
  }, [gastosMesActual]);

  const totalGastosDelMes = useMemo(() => {
    if (!gastosMesActual?.length) return 0;
    return gastosMesActual.reduce((total, gasto) => total + (gasto.monto ?? 0), 0);
  }, [gastosMesActual]);

  const totalGastosIndispensables = useMemo(() => {
    if (!gastosIndispensablesDelMes.length) return 0;
    return gastosIndispensablesDelMes.reduce((total, gasto) => total + (gasto.monto ?? 0), 0);
  }, [gastosIndispensablesDelMes]);

  const [montoPesos, setMontoPesos] = useState(0);
  const [montoDolares, setMontoDolares] = useState(0);
  const [incluirDolares, setIncluirDolares] = useState(false);
  const [porcentajeTotal, setPorcentajeTotal] = useState(PORCENTAJE_TOTAL_POR_DEFECTO);
  const [gastosAdicionales, setGastosAdicionales] = useState(0);
  const [inicializado, setInicializado] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isSuccess || isFetching || inicializado) return;
    setInicializado(true);
    if (data) {
      setMontoPesos(data.monto_pesos ?? 0);
      setMontoDolares(data.monto_dolares ?? 0);
      setIncluirDolares(data.incluir_dolares ?? false);
      setPorcentajeTotal(data.porcentaje_total ?? PORCENTAJE_TOTAL_POR_DEFECTO);
      setGastosAdicionales(data.gastos_adicionales ?? 0);
    }
  }, [data, isSuccess, isFetching, inicializado]);

  useEffect(() => {
    if (!isDirty) return;
    const avisarCambiosSinGuardar = (e: BeforeUnloadEvent) => e.preventDefault();
    globalThis.addEventListener("beforeunload", avisarCambiosSinGuardar);
    return () => globalThis.removeEventListener("beforeunload", avisarCambiosSinGuardar);
  }, [isDirty]);

  const patchMutation = useMutation({
    mutationFn: async (patchData: PATCHFondoEmergencia) => {
      const token = await getAccessTokenSilently();
      const response = await fetchPatchFondoEmergencia({ token, data: patchData });
      return getDataOrThrow(response);
    },
    onSuccess: async () => {
      setIsDirty(false);
      toast.success("Fondo de emergencia guardado");
      await queryClient.invalidateQueries({ queryKey: ["fondo-emergencia"] });
    },
    onError: (error) => {
      toast.error(`No se pudo guardar el fondo de emergencia: ${error.message}`);
    },
  });

  const handleGuardar = () => {
    patchMutation.mutate({
      monto_pesos: montoPesos,
      monto_dolares: montoDolares,
      incluir_dolares: incluirDolares,
      porcentaje_total: porcentajeTotal,
      gastos_adicionales: gastosAdicionales,
    });
  };

  const puedeEditar = inicializado && !patchMutation.isPending;

  const dolaresEnPesos = cotizacionMep ? montoDolares * cotizacionMep.compra : 0;
  const fondoTotal = montoPesos + (incluirDolares ? dolaresEnPesos : 0);

  const gastosProteccionMensual = totalGastosIndispensables + gastosAdicionales;
  const excedenteMensual = Math.max(0, ingresosTotalesDelMes - totalGastosDelMes);
  const aporteMensualEstimado = excedenteMensual * (porcentajeTotal / 100);
  const puedeAportar = excedenteMensual > 0;

  const milestoneData = useMemo(() => {
    if (gastosProteccionMensual <= 0) {
      return { current: null, previous: null, next: null, isAllCompleted: false, hasExpenses: false };
    }

    const targets = MILESTONES.map((m) => ({
      ...m,
      target: gastosProteccionMensual * m.meses,
    }));

    const currentIndex = targets.findIndex((m) => fondoTotal < m.target);

    if (currentIndex === -1) {
      return {
        current: null,
        previous: targets.at(-1) ?? null,
        next: null,
        isAllCompleted: true,
        hasExpenses: true,
      };
    }

    return {
      current: targets[currentIndex],
      previous: currentIndex > 0 ? targets[currentIndex - 1] : null,
      next: currentIndex < targets.length - 1 ? targets[currentIndex + 1] : null,
      isAllCompleted: false,
      hasExpenses: true,
    };
  }, [gastosProteccionMensual, fondoTotal]);

  const progress = milestoneData.current
    ? Math.min(100, (fondoTotal / milestoneData.current.target) * 100)
    : 0;

  const parseValorNoNegativo = (texto: string) => {
    const value = texto === "" ? 0 : Number.parseFloat(texto);
    return Number.isNaN(value) ? 0 : redondearCentavos(Math.max(0, value));
  };

  const handleMontoPesosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMontoPesos(parseValorNoNegativo(e.target.value));
    setIsDirty(true);
  };

  const handleMontoDolaresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMontoDolares(parseValorNoNegativo(e.target.value));
    setIsDirty(true);
  };

  const handleIncluirDolaresChange = (checked: boolean) => {
    setIncluirDolares(checked);
    setIsDirty(true);
  };

  const handlePorcentajeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPorcentajeTotal(Math.min(100, parseValorNoNegativo(e.target.value)));
    setIsDirty(true);
  };

  const handleGastosAdicionalesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGastosAdicionales(parseValorNoNegativo(e.target.value));
    setIsDirty(true);
  };

  const isDataLoading = isPending || isPendingIngresosMesActual || isPendingGastosMesActual;
  const isErrorDatosDelMes = isErrorIngresosMesActual || isErrorGastosMesActual;

  const renderMilestoneSection = () => {
    if (isErrorDatosDelMes) {
      return (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No se pudieron cargar los ingresos y gastos del mes. Intentá de nuevo más tarde.
          </CardContent>
        </Card>
      );
    }

    if (!milestoneData.hasExpenses) {
      return (
        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <EyeOff className="size-10 text-muted-foreground/60" />
            <div>
              <p className="font-medium text-muted-foreground">No hay datos de gastos</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Registrá tus gastos del mes y marcá las fuentes como indispensables, o definí gastos adicionales abajo, para poder calcular los hitos del fondo de emergencia.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (milestoneData.isAllCompleted) {
      return (
        <Card className="border-2 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Trophy className="size-12 text-emerald-500" />
            <div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                ¡Todos los hitos completados!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {milestoneData.previous && (
                  <>Alcanzaste <strong>{milestoneData.previous.label}</strong> de gastos cubiertos.</>
                )}
                {!milestoneData.previous && (
                  <>Tu fondo de emergencia está completamente consolidado.</>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {milestoneData.previous && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-50/50 px-4 py-3 dark:bg-emerald-950/15">
            <CheckCircle className="size-6 shrink-0 text-emerald-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                {milestoneData.previous.label} cubierto
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {formatPrice(gastosProteccionMensual * milestoneData.previous.meses)}
              </p>
            </div>
          </div>
        )}

        <Card className="overflow-hidden border-primary/20">
          <CardContent className="p-0">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Goal className="size-5 text-primary" />
                <p className="font-semibold text-sm">
                  Meta actual:{" "}
                  <span className="text-primary">{milestoneData.current?.label}</span>
                  {" "}de protección
                </p>
              </div>

              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-primary to-primary/70 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {formatPrice(fondoTotal)}
                </span>
                <span className="text-muted-foreground">
                  de {milestoneData.current && formatPrice(milestoneData.current.target)}
                </span>
              </div>

              <p className="text-center text-2xl font-bold text-primary">
                {progress.toFixed(1)}%
              </p>
            </div>

            {puedeAportar && (
              <div className="border-t border-border/50 bg-muted/30 px-4 py-2.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="size-3.5" />
                  Aportás <strong>{formatPrice(aporteMensualEstimado)}/mes</strong>{" "}
                  ({porcentajeTotal.toFixed(2)}% del excedente de {formatPrice(excedenteMensual)})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {milestoneData.next && (
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3 opacity-70">
            <ChevronsRight className="size-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">
                Siguiente meta: <span className="font-medium text-foreground">{milestoneData.next.label}</span>
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {formatPrice(gastosProteccionMensual * milestoneData.next.meses)}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="p-4 space-y-6 w-full max-w-7xl mx-auto">
      <div className="text-center space-y-1">
        <h1 className="text-3xl max-sm:text-2xl font-bold">Fondo de emergencia</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Gestioná tu fondo de emergencia y ahorros en dólares
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
            <PiggyBank className="size-6 text-primary" />
            <p className="text-xs text-muted-foreground font-medium">Fondo actual</p>
            <p className="text-lg font-bold">{formatPrice(fondoTotal)}</p>
            {incluirDolares && dolaresEnPesos > 0 && (
              <p className="text-xs text-muted-foreground">Incluye tus dólares convertidos a pesos</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
            <DollarSign className="size-6 text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-muted-foreground font-medium">Reserva en USD</p>
            <p className="text-lg font-bold">{formatUSD(montoDolares)}</p>
            {cotizacionMep && montoDolares > 0 && (
              <p className="text-xs text-muted-foreground">≈ {formatPrice(dolaresEnPesos)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Landmark className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Progreso por hitos</h2>
        </div>
        <p className="text-xs text-muted-foreground/70 -mt-1">
          Cada mes de protección se calcula en base a tus gastos indispensables del mes{" "}
          más los <strong>gastos adicionales</strong> que definas abajo.{" "}
          Podés marcar una fuente de gasto como indispensable desde{" "}
          <strong>Configuración &gt; Fuentes de gastos</strong>.
        </p>
        {isDataLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <RefreshCw className="size-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          renderMilestoneSection()
        )}
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MousePointerClick className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Configuración del fondo</h2>
        </div>

        {isError && !inicializado && (
          <p className="text-sm text-red-600 dark:text-red-400">
            No se pudo cargar tu fondo de emergencia, así que no se puede editar. Intentá de nuevo más tarde.
          </p>
        )}

        <Card>
          <CardContent className="p-4 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="monto-pesos" className="flex items-center gap-1.5">
                <PiggyBank className="size-4 text-muted-foreground" />
                Monto actual del fondo
              </Label>
              <div>
                <Input
                  id="monto-pesos"
                  type="number"
                  min={0}
                  step={100}
                  value={montoPesos || ""}
                  onChange={handleMontoPesosChange}
                  disabled={!puedeEditar}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="monto-dolares" className="flex items-center gap-1.5">
                <DollarSign className="size-4 text-muted-foreground" />
                Reserva en dólares
              </Label>
              <div>
                <Input
                  id="monto-dolares"
                  type="number"
                  min={0}
                  step={10}
                  value={montoDolares || ""}
                  onChange={handleMontoDolaresChange}
                  disabled={!puedeEditar}
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Es el total de tus ahorros en dólares. Solo forma parte del fondo de emergencia si activás la opción de abajo.
              </p>
              <div className="flex items-center justify-between gap-3 pt-1">
                <Label htmlFor="incluir-dolares" className="text-sm font-normal">
                  Sumar los dólares al fondo de emergencia
                </Label>
                <Switch
                  id="incluir-dolares"
                  checked={incluirDolares}
                  onCheckedChange={handleIncluirDolaresChange}
                  disabled={!puedeEditar}
                />
              </div>
              {cotizacionMep && (
                <p className="text-xs text-muted-foreground">
                  Se convierten con el dólar MEP (precio de compra): {formatPrice(cotizacionMep.compra)} por dólar.
                </p>
              )}
              {incluirDolares && isErrorCotizacion && (
                <p className="text-xs text-amber-600">
                  No se pudo obtener la cotización del dólar, así que los dólares no se están sumando al fondo.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="porcentaje" className="flex items-center gap-1.5">
                <Percent className="size-4 text-muted-foreground" />
                Porcentaje destinado al fondo cada mes
              </Label>
              <div className="relative">
                <Input
                  id="porcentaje"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={porcentajeTotal || ""}
                  onChange={handlePorcentajeChange}
                  disabled={!puedeEditar}
                  className="pr-8"
                  placeholder={PORCENTAJE_TOTAL_POR_DEFECTO.toString()}
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gastos-adicionales" className="flex items-center gap-1.5">
                <TrendingUp className="size-4 text-muted-foreground" />
                Gastos adicionales
              </Label>
              <div>
                <Input
                  id="gastos-adicionales"
                  type="number"
                  min={0}
                  step={100}
                  value={gastosAdicionales || ""}
                  onChange={handleGastosAdicionalesChange}
                  disabled={!puedeEditar}
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Gastos que no registraste como fuente pero tendrías en una emergencia (ej: alquiler que paga un familiar). Se suman a los indispensables para definir tu protección mensual.
              </p>
            </div>

            <Separator />

            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="size-3.5" />
                Cálculo del aporte mensual
              </p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ingresos del mes</span>
                  <span className="font-medium">{formatPrice(ingresosTotalesDelMes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gastos del mes</span>
                  <span className="font-medium">−{formatPrice(totalGastosDelMes)}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Excedente mensual</span>
                  <span className="font-medium">{formatPrice(excedenteMensual)}</span>
                </div>
                {puedeAportar ? (
                  <>
                    <div className="flex justify-between text-muted-foreground">
                      <span>× Porcentaje destinado al fondo</span>
                      <span>{porcentajeTotal.toFixed(2)}%</span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between text-primary font-medium">
                      <span>Aporte mensual al fondo</span>
                      <span>{formatPrice(aporteMensualEstimado)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground pt-1">
                    No hay excedente disponible este mes. Ajustá tus ingresos o gastos para generar excedente y empezar a aportar al fondo.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              {isDirty && !patchMutation.isPending && (
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <ChevronRight className="size-3" />
                  Sin guardar
                </span>
              )}
              <Button
                onClick={handleGuardar}
                disabled={!puedeEditar || !isDirty}
                className="cursor-pointer gap-1.5"
              >
                {patchMutation.isPending && <RefreshCw className="size-4 animate-spin" />}
                Guardar
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </section>
  );
};
