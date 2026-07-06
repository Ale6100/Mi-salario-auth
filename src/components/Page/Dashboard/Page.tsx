// src\components\Page\Dashboard\Page.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { es } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";
import { getDate, getDaysInMonth, format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import { RUTAS } from "@/lib/const";
import { Separator } from "@/components/ui/separator";
import { useAuth0 } from "@auth0/auth0-react";
import { useConceptosGastos } from "@/hooks/useConceptosGastos";
import { useConceptosIngresos } from "@/hooks/useConceptosIngresos";
import { useFondoEmergencia } from "@/hooks/useFondoEmergencia";
import { usePatchSaldoReal } from "@/hooks/usePatchSaldoReal";
import { useEffect, useMemo, useState } from "react";
import { Wallet, CreditCard, Shield, PiggyBank, TrendingUp, TrendingDown, ArrowRight, AlertTriangle, CalendarDays, X } from "lucide-react";

export const DashboardPage = () => {
  const { user } = useAuth0();

  const now = useMemo(() => new Date(), []);
  const currentPeriod = useMemo(() => format(now, "yyyy-MM"), [now]);

  const dayOfMonth = getDate(now);
  const daysInMonth = getDaysInMonth(now);
  const remainingDays = daysInMonth - dayOfMonth + 1;
  const mesTranscurrido = daysInMonth > 0 ? (dayOfMonth - 1) / daysInMonth : 0;

  const { data: ingresos, isFetching: isFetchingIngresos } = useConceptosIngresos({
    user,
    periodo: currentPeriod,
  });
  const { data: gastos, isFetching: isFetchingGastos } = useConceptosGastos({
    user,
    periodo: currentPeriod,
  });
  const { data: fondo, isFetching: isFetchingFondo } = useFondoEmergencia({ user });

  const ingresosTotales = useMemo(() => {
    if (!ingresos?.length) return 0;
    return ingresos.reduce((sum, ing) => sum + ing.valor, 0);
  }, [ingresos]);

  const gastosTotales = useMemo(() => {
    if (!gastos?.length) return 0;
    return gastos.reduce((sum, gas) => sum + (gas.monto ?? 0), 0);
  }, [gastos]);

  const [saldoReal, setSaldoReal] = useState<number | null>(null);
  const [saldoRealInput, setSaldoRealInput] = useState("");

  const patchSaldoReal = usePatchSaldoReal({ user });

  useEffect(() => {
    if (fondo) {
      setSaldoReal(fondo.saldo_real ?? null);
    }
  }, [fondo]);

  const excedente = Math.max(0, ingresosTotales - gastosTotales);
  const aporteFondo = fondo ? excedente * (fondo.porcentaje_total / 100) : 0;
  const balance = ingresosTotales - gastosTotales - aporteFondo;
  const balanceSinFondo = ingresosTotales - gastosTotales;

  const gastoDiarioRecomendado = daysInMonth > 0
    ? (saldoReal !== null ? saldoReal / Math.max(remainingDays, 1) : balance / daysInMonth)
    : 0;
  const usandoSaldoReal = saldoReal !== null;
  const deberiasTenerHoy = daysInMonth > 0 ? balance * remainingDays / daysInMonth : 0;

  const monthName = useMemo(
    () => format(now, "MMMM", { locale: es }),
    [now],
  );
  const year = now.getFullYear();

  const handleSaveSaldoReal = () => {
    const normalized = saldoRealInput
      .replace(/[^0-9.,]/g, "")
      .replaceAll(".", "")
      .replaceAll(",", ".");
    const value = Number(normalized);
    if (!Number.isNaN(value) && value >= 0) {
      setSaldoReal(value);
      patchSaldoReal.mutate(value);
      setSaldoRealInput("");
    }
  };

  const handleClearSaldoReal = () => {
    setSaldoReal(null);
    patchSaldoReal.mutate(null);
    setSaldoRealInput("");
  };

  const isFetching = isFetchingIngresos || isFetchingGastos || isFetchingFondo;

  if (isFetching) {
    return (
      <section className="p-4 space-y-4">
        <h1 className="text-3xl max-sm:text-lg font-bold text-center">Dashboard</h1>
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Cargando resumen financiero…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 space-y-4 max-w-7xl mx-auto">
      <h1 className="text-3xl max-sm:text-lg font-bold text-center">Dashboard</h1>
      <p className="text-muted-foreground text-center text-sm max-w-md mx-auto">
        Resumen financiero de {monthName} {year}
      </p>

      <Separator className="my-6" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Resumen del mes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Ingresos
                  </span>
                </div>
                <Wallet className="size-4 text-muted-foreground/30" />
              </div>
              <p className="text-2xl font-bold tracking-tight">
                {formatPrice(ingresosTotales)}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Total de ingresos registrados en {monthName}.
              </p>
              <Link
                to={RUTAS.income}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Ver detalle de ingresos <ArrowRight className="size-3" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <TrendingDown className="size-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Gastos
                  </span>
                </div>
                <CreditCard className="size-4 text-muted-foreground/30" />
              </div>
              <p className="text-2xl font-bold tracking-tight">
                {formatPrice(gastosTotales)}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Total de gastos estimados para {monthName}.
              </p>
              <Link
                to={RUTAS.expenses}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
              >
                Ver detalle de gastos <ArrowRight className="size-3" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Shield className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Aporte a fondo
                  </span>
                </div>
                <PiggyBank className="size-4 text-muted-foreground/30" />
              </div>
              <p className="text-2xl font-bold tracking-tight">
                {fondo ? formatPrice(aporteFondo) : "—"}
              </p>
              {fondo ? (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {fondo.porcentaje_total.toFixed(2)}% del excedente mensual destinado al{" "}
                  fondo de emergencia.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Aún no configuraste un fondo de emergencia.
                </p>
              )}
              <Link
                to={RUTAS.emergencyFund}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {fondo ? "Ajustar configuración" : "Configurar fondo"}{" "}
                <ArrowRight className="size-3" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={
                      `p-2 rounded-lg ${
                        balance >= 0
                          ? "bg-amber-100 dark:bg-amber-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`
                    }
                  >
                    {balance >= 0 ? (
                      <PiggyBank className="size-4 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Balance del mes
                  </span>
                </div>
              </div>
              <p
                className={
                  `text-2xl font-bold tracking-tight ${
                    balance >= 0 ? "" : "text-red-500"
                  }`
                }
              >
                {formatPrice(balance)}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {balance >= 0
                  ? "Disponible después de gastos y aportes."
                  : "Déficit en el mes."}
              </p>
              {balance >= 0 && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {formatPrice(gastoDiarioRecomendado)} / día recomendado
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-6" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Proyección diaria</h2>

        {balance >= 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6 space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Deberías tener hoy
                </p>
                <p className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
                  {formatPrice(deberiasTenerHoy)}
                </p>
                <p className="text-sm text-muted-foreground">
                  para cubrir el día actual más resto del mes
                </p>
              </div>

              <Separator />

              <div className="text-center space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Tu saldo real
                  </p>
                  {saldoReal !== null ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl font-bold">
                        {formatPrice(saldoReal)}
                      </span>
                      <button
                        onClick={handleClearSaldoReal}
                        className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                        title="Usar saldo estimado"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Input
                        type="text"
                        placeholder="Ej: 50000"
                        value={saldoRealInput}
                        onChange={(e) => setSaldoRealInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveSaldoReal()}
                        className="max-w-[140px] h-8 text-center text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveSaldoReal}
                        disabled={!saldoRealInput.trim()}
                        className="h-8"
                      >
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Gasto diario recomendado{usandoSaldoReal ? " usando saldo real" : ""}:{" "}
                  <span className="font-semibold text-foreground">
                    {formatPrice(gastoDiarioRecomendado)}
                  </span>{" "}
                  <span className="text-xs text-muted-foreground">/ día</span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    Día {dayOfMonth} de {daysInMonth}
                  </span>
                  <span>{Math.round(mesTranscurrido * 100)}% del mes</span>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted-foreground/15">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/40 transition-all"
                    style={{ width: `${mesTranscurrido * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 pb-6 space-y-4">
              <div className="flex items-center gap-3 justify-center">
                <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="size-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Mes con déficit</h3>
                  <p className="text-sm text-muted-foreground">
                    Tus gastos superan tus ingresos. Revisá las cuentas para equilibrar la balanza.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-5 pb-5 space-y-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Detalle del mes
            </h3>

            <div className="space-y-2.5 text-sm max-w-sm mx-auto w-full">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ingresos</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  +{formatPrice(ingresosTotales)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Gastos</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  &minus;{formatPrice(gastosTotales)}
                </span>
              </div>
              {fondo && aporteFondo > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Aporte a fondo de emergencia</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    &minus;{formatPrice(aporteFondo)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center text-base font-bold">
                <span>Balance</span>
                <span
                  className={
                    balance >= 0 ? "text-foreground" : "text-red-500"
                  }
                >
                  {formatPrice(balance)}
                </span>
              </div>
            </div>

            {fondo && aporteFondo > 0 && (
              <div className="bg-muted/60 rounded-lg px-4 py-3">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Sin aportar al fondo de emergencia, el balance sería de{" "}
                  <span className="font-semibold text-foreground">{formatPrice(balanceSinFondo)}</span>.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </section>
  );
};
