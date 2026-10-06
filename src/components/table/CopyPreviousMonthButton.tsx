// src\components\table\CopyPreviousMonthButton.tsx

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { esPeriodoValido, formatPeriodoLargo, getPeriodoActual, getPeriodoAnterior } from "@/lib/periodo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { useId, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AlertAction from "@/components/utils/AlertAction";
import type { ResponseBackend } from "@/types/global";

type CopyPreviousMonthButtonProps = {
  readonly concepto: "gastos" | "ingresos";
  readonly queryKey: string;
  readonly disabled?: boolean;
  readonly copiar: (params: { token: string; periodoDestino: string }) => Promise<ResponseBackend<unknown[]>>;
}

export const CopyPreviousMonthButton = ({ concepto, queryKey, disabled = false, copiar }: CopyPreviousMonthButtonProps) => {
  const { getAccessTokenSilently } = useAuth0();

  const toastId = useId();
  const inputId = useId();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [periodoDestino, setPeriodoDestino] = useState(getPeriodoActual);

  const periodoDestinoValido = esPeriodoValido(periodoDestino);
  const periodoOrigen = periodoDestinoValido ? getPeriodoAnterior(periodoDestino) : "";

  const handleCopiar = async () => {
    if (!periodoDestinoValido) {
      toast.error("Elegí un mes destino válido", { id: toastId });
      return;
    }

    toast.loading("Espere...", { id: toastId });

    let response: ResponseBackend<unknown[]>;
    try {
      const token = await getAccessTokenSilently();
      response = await copiar({ token, periodoDestino });
    } catch {
      toast.error(`Error al copiar los ${concepto}`, { id: toastId });
      return;
    }

    if (response.statusCode !== 201 || !response.data) {
      toast.error(`Error al copiar los ${concepto}`, { id: toastId });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: [queryKey] });

    const cantidad = response.data.length;
    if (cantidad === 0) {
      toast.info(`No había ${concepto} nuevos para copiar desde ${formatPeriodoLargo(periodoOrigen)}`, { id: toastId });
      return;
    }

    toast.success(`Se ${cantidad === 1 ? "copió 1 concepto" : `copiaron ${cantidad} conceptos`} a ${formatPeriodoLargo(periodoDestino)}`, { id: toastId });
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} className="cursor-pointer gap-2" disabled={disabled}>
        <Copy className="size-4" />
        Copiar mes anterior
      </Button>

      {isOpen && (
        <AlertAction
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          title={`Copiar ${concepto} del mes anterior`}
          configBtnAccept={{ text: "Copiar", onClick: handleCopiar }}
          component={
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor={inputId}>Mes destino</Label>
                <Input
                  id={inputId}
                  type="month"
                  value={periodoDestino}
                  onChange={(e) => setPeriodoDestino(e.target.value)}
                />
              </div>
              {periodoDestinoValido && (
                <p className="text-sm">
                  Se copiarán los {concepto} de <strong>{formatPeriodoLargo(periodoOrigen)}</strong> a <strong>{formatPeriodoLargo(periodoDestino)}</strong>.
                  {" "}Las fuentes que ya tengan un concepto en ese mes no se modifican.
                  {concepto === "gastos" && " Los gastos copiados quedan como no pagados."}
                  {concepto === "ingresos" && " No se copian las fuentes inactivas ni las de aguinaldo."}
                </p>
              )}
            </div>
          }
        />
      )}
    </>
  )
}
