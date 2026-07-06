// src\components\Page\EmergencyFund\Page.tsx

import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, CheckCircle, EyeOff, Landmark, PiggyBank, ChevronsRight, DollarSign, Goal, MousePointerClick, Percent, RefreshCw, TrendingUp, Trophy } from "lucide-react";
import { fetchPatchFondoEmergencia } from "@/lib/fetch/fondoEmergencia";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConceptosGastos } from "@/hooks/useConceptosGastos";
import { useConceptosIngresos } from "@/hooks/useConceptosIngresos";
import { useFondoEmergencia } from "@/hooks/useFondoEmergencia";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PATCHFondoEmergencia } from "@/types/fondoEmergencia";

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

  const { data, isFetching } = useFondoEmergencia({ user });

  const { data: ingresosMesActual, isFetching: isFetchingIngresosMesActual } = useConceptosIngresos({
    user,
    periodo: format(new Date(), "yyyy-MM"),
  });
  const { data: gastosMesActual, isFetching: isFetchingGastosMesActual } = useConceptosGastos({
    user,
    periodo: format(new Date(), "yyyy-MM"),
  });

  const ingresosTotalesDelMes = useMemo(() => {
    if (!ingresosMesActual?.length) return 0;
    return ingresosMesActual.reduce((total, ingreso) => total + ingreso.valor, 0);
  }, [ingresosMesActual]);

  const gastosTotalesDelMes = useMemo(() => {
    if (!gastosMesActual?.length) return 0;
    return gastosMesActual.reduce((total, gasto) => total + (gasto.monto ?? 0), 0);
  }, [gastosMesActual]);

  const [montoPesos, setMontoPesos] = useState(0);
  const [montoDolares, setMontoDolares] = useState(0);
  const [porcentajeTotal, setPorcentajeTotal] = useState(66.66);
  const initializedRef = useRef(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isFetching || initializedRef.current) return;
    initializedRef.current = true;
    if (data) {
      setMontoPesos(data.monto_pesos ?? 0);
      setMontoDolares(data.monto_dolares ?? 0);
      setPorcentajeTotal(data.porcentaje_total ?? 66.66);
    }
    setIsDirty(false);
  }, [data, isFetching]);

  const patchMutation = useMutation({
    mutationFn: async (patchData: PATCHFondoEmergencia & { sub: string }) => {
      const token = await getAccessTokenSilently();
      const response = await fetchPatchFondoEmergencia({ token, data: patchData });
      if (response.statusCode !== 200) throw new Error("Error al guardar");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fondo-emergencia"] });
      setIsDirty(false);
    },
    onError: () => {
      setIsDirty(true);
    },
  });

  const debounceRef = useRef<ReturnType<typeof globalThis.setTimeout>>(undefined);

  const save = useCallback(() => {
    if (!initializedRef.current) return;
    if (debounceRef.current) globalThis.clearTimeout(debounceRef.current);
    debounceRef.current = globalThis.setTimeout(() => {
      if (!user?.sub) return;
      patchMutation.mutate({
        sub: user.sub,
        monto_pesos: Number(montoPesos),
        monto_dolares: Number(montoDolares),
        incluir_dolares: false, // Por ahora no se usa
        porcentaje_total: Number(porcentajeTotal),
      });
    }, 800);
  }, [montoPesos, montoDolares, porcentajeTotal, patchMutation]);

  useEffect(() => {
    save();
    return () => {
      if (debounceRef.current) globalThis.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [montoPesos, montoDolares, porcentajeTotal]);

  const excedenteMensual = Math.max(0, ingresosTotalesDelMes - gastosTotalesDelMes);
  const aporteMensualEstimado = excedenteMensual * (porcentajeTotal / 100);
  const puedeAportar = excedenteMensual > 0;

  const milestoneData = useMemo(() => {
    if (gastosTotalesDelMes <= 0) {
      return { current: null, previous: null, next: null, isAllCompleted: false, hasExpenses: false };
    }

    const targets = MILESTONES.map((m) => ({
      ...m,
      target: gastosTotalesDelMes * m.meses,
    }));

    const currentIndex = targets.findIndex((m) => montoPesos < m.target);

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
  }, [gastosTotalesDelMes, montoPesos]);

  const progress = milestoneData.current
    ? Math.min(100, (montoPesos / milestoneData.current.target) * 100)
    : 0;

  const handleMontoPesosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : Number.parseFloat(e.target.value);
    setMontoPesos(Number.isNaN(value) ? 0 : value);
    setIsDirty(true);
  };

  const handleMontoDolaresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : Number.parseFloat(e.target.value);
    setMontoDolares(Number.isNaN(value) ? 0 : value);
    setIsDirty(true);
  };

  const handlePorcentajeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : Number.parseFloat(e.target.value);
    setPorcentajeTotal(Number.isNaN(value) ? 0 : Math.min(100, Math.max(0, value)));
    setIsDirty(true);
  };

  const isDataLoading = isFetching || isFetchingIngresosMesActual || isFetchingGastosMesActual;

  const renderMilestoneSection = () => {
    if (!milestoneData.hasExpenses) {
      return (
        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <EyeOff className="size-10 text-muted-foreground/60" />
            <div>
              <p className="font-medium text-muted-foreground">No hay datos de gastos</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Registrá tus gastos del mes para poder calcular los hitos del fondo de emergencia.
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
                {formatPrice(gastosTotalesDelMes * milestoneData.previous.meses)}
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
                  {formatPrice(montoPesos)}
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
                {formatPrice(gastosTotalesDelMes * milestoneData.next.meses)}
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
            <p className="text-lg font-bold">{formatPrice(montoPesos)}</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
            <DollarSign className="size-6 text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-muted-foreground font-medium">Reserva en USD</p>
            <p className="text-lg font-bold">{formatUSD(montoDolares)}</p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Landmark className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Progreso por hitos</h2>
        </div>
        <p className="text-xs text-muted-foreground/70 -mt-1">
          Cada mes de protección se calcula en base al total de gastos que registraste este mes.
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
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                No es parte del fondo de emergencia, es el total de tus ahorros en dólares.
              </p>
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
                  className="pr-8"
                  placeholder="66.66"
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                  %
                </span>
              </div>
            </div>

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
                  <span className="text-muted-foreground">Gastos estimados</span>
                  <span className="font-medium">{formatPrice(gastosTotalesDelMes)}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Excedente (ingresos − gastos)</span>
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

            <div className="flex items-center justify-end gap-1.5">
              {(() => {
                if (patchMutation.isPending) {
                  return (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <RefreshCw className="size-3 animate-spin" />
                      Guardando...
                    </span>
                  );
                }
                if (isDirty) {
                  return (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <ChevronRight className="size-3" />
                      Sin guardar
                    </span>
                  );
                }
                if (initializedRef.current) {
                  return (
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle className="size-3" />
                      Guardado
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </CardContent>
        </Card>
      </section>
    </section>
  );
};
