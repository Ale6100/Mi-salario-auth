// src\components\Page\Configuration\ExpenseSources\DialogAddEditExpenseSource.tsx

import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchPostFuenteGastos, fetchPutFuenteGastos } from "@/lib/fetch/fuentesGastos";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FuenteBadge } from "@/components/ui/FuenteBadge";
import { formSchema, type FormSchema } from "./util";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MsgError } from "@/components/forms/MsgError";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { useId, type Dispatch, type SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FuenteGastosDB, POSTFuenteGastos, PUTFuenteGastos } from "@/types/fuentesGastos";

type DialogAddEditExpenseSourceProps = {
  readonly isOpen: { status: boolean; source: FuenteGastosDB | undefined };
  readonly setIsOpen: Dispatch<SetStateAction<{ status: boolean; source: FuenteGastosDB | undefined }>>;
  readonly actualSources: FuenteGastosDB[];
}

export const DialogAddEditExpenseSource = ({ isOpen, setIsOpen, actualSources }: DialogAddEditExpenseSourceProps) => {
  const { user, getAccessTokenSilently } = useAuth0();

  const toastId = useId();
  const queryClient = useQueryClient();

  const isEdit = isOpen.source != null;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: isEdit ? (isOpen.source?.nombre ?? "") : "",
      color: isEdit ? (isOpen.source?.color ?? "") : "",
      es_indispensable: isEdit ? (isOpen.source?.es_indispensable ?? false) : false,
      seguimiento_diario: isEdit ? (isOpen.source?.seguimiento_diario ?? false) : false,
    }
  });

  const onSubmit = async (data: FormSchema) => {
    const token = await getAccessTokenSilently();

    if (isEdit || !user?.sub || !token) return;

    if (actualSources.some(source => source.nombre.toLowerCase() === data.nombre.toLowerCase())) {
      return form.setError("nombre", { type: "manual", message: "Ya tienes una fuente de gasto con ese nombre" });
    }

    const dataToSend: POSTFuenteGastos = {
      nombre: data.nombre,
      color: data.color,
      es_indispensable: data.es_indispensable,
      seguimiento_diario: data.seguimiento_diario,
    }

    toast.loading('Espere...', { id: toastId });
    const response = await fetchPostFuenteGastos({ token, data: dataToSend });

    if (response.statusCode != 201) {
      toast.error('Error al agregar la fuente de gasto', { id: toastId });
      return close();
    }

    await queryClient.invalidateQueries({ queryKey: ['fuentes-gastos'] });
    toast.success('Fuente de gasto agregada correctamente', { id: toastId });
    close();
  }

  const onEdit = async (data: FormSchema) => {
    const token = await getAccessTokenSilently();

    if (!isEdit || !user?.sub || !token || !isOpen.source?._id) return;

    if (actualSources.some(source => source.nombre.toLowerCase() === data.nombre.toLowerCase() && source._id !== isOpen.source?._id)) {
      return form.setError("nombre", { type: "manual", message: "Ya tienes una fuente de gasto con ese nombre" });
    }

    const dataToSend: PUTFuenteGastos = {
      nombre: data.nombre,
      color: data.color,
      es_indispensable: data.es_indispensable,
      seguimiento_diario: data.seguimiento_diario,
    }

    toast.loading('Espere...', { id: toastId });
    const response = await fetchPutFuenteGastos({ id: isOpen.source._id, token, data: dataToSend });

    if (response.statusCode != 200) {
      toast.error('Error al editar la fuente de gasto', { id: toastId });
      return close();
    }

    await queryClient.invalidateQueries({ queryKey: ['fuentes-gastos'] });
    toast.success('Fuente de gasto editada correctamente', { id: toastId });
    close();
  }

  const close = () => {
    setIsOpen({ status: false, source: undefined });
  }

  const { isSubmitting, isDirty } = form.formState;

  return (
    <Dialog open={isOpen.status} onOpenChange={open => {
      if (!open) return close();
      setIsOpen(prev => ({ ...prev, status: open }));
    }}>
      <DialogContent className={'max-w-[95vw]! sm:max-w-[80vw]! max-h-[90dvh] overflow-x-hidden'}>
        <DialogHeader>
          <DialogTitle className="sm:text-lg">{isEdit ? "Editar fuente de gastos" : "Agregar fuente de gastos"}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <section>
          <form onSubmit={form.handleSubmit(isEdit ? onEdit : onSubmit)}>
            <FieldGroup>
              <Controller
                name={`nombre`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="required">Nombre</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      onChange={field.onChange}
                    />
                    <MsgError fieldState={fieldState} />
                  </Field>
                )}
              />

              <Controller
                name="color"
                control={form.control}
                render={({ field, fieldState }) => {
                  const colorValue = field.value || "#000000";
                  const baseColor = colorValue.length >= 7 ? colorValue.slice(0, 7) : "#000000";
                  const alphaHex = colorValue.length >= 9 ? colorValue.slice(7, 9) : "FF";
                  const alphaDecimal = Number.parseInt(alphaHex, 16);
                  const alphaPercent = Math.round((alphaDecimal / 255) * 100);

                  const handleColorBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    field.onChange(`${e.target.value}${alphaHex}`);
                  };

                  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const newAlpha = Number(e.target.value);
                    const newAlphaHex = newAlpha.toString(16).padStart(2, '0').toUpperCase();
                    field.onChange(`${baseColor}${newAlphaHex}`);
                  };

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="required">Color</FieldLabel>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          className="h-10 w-16 cursor-pointer rounded"
                          value={baseColor}
                          onChange={handleColorBaseChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="range"
                            min={0}
                            max={255}
                            value={alphaDecimal}
                            onChange={handleAlphaChange}
                            onBlur={field.onBlur}
                            className="flex-1 cursor-pointer accent-sky-600"
                            name={field.name}
                          />
                          <span className="text-xs text-muted-foreground w-10 text-right font-mono tabular-nums">
                            {alphaPercent}%
                          </span>
                        </div>
                        <div
                          className="size-6 shrink-0 rounded border border-border"
                          style={{ backgroundColor: field.value || "#000000" }}
                          title={field.value || "#000000"}
                        />
                      </div>
                      {field.value && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Vista previa:</span>
                          <FuenteBadge nombre={form.watch('nombre') || 'Ejemplo'} color={field.value} />
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground/70 mt-1 block">
                        {field.value ? `Opacidad: ${alphaPercent}% · ${field.value}` : "Selecciona un color"}
                      </span>
                      <MsgError fieldState={fieldState} />
                    </Field>
                  );
                }}
              />

              <Controller
                name="es_indispensable"
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="es-indispensable" className="text-sm font-medium cursor-pointer">
                        Gasto indispensable
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Se considera para el cálculo del fondo de emergencia
                      </p>
                    </div>
                    <Switch
                      id="es-indispensable"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />

              <Controller
                name="seguimiento_diario"
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="seguimiento-diario" className="text-sm font-medium cursor-pointer">
                        Seguimiento diario del monto mensual
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Calcula día a día cuánto debería quedarte en el mes y el gasto diario recomendado
                      </p>
                    </div>
                    <Switch
                      id="seguimiento-diario"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />

              <div className="flex justify-between">
                <Button type="button" title="Cancelar" className="cursor-pointer" variant="destructive" onClick={close}>
                  Cancelar
                </Button>
                <Button type="submit" title="Guardar" className="cursor-pointer" disabled={isSubmitting || !isDirty}>
                  Guardar
                </Button>
              </div>
            </FieldGroup>
          </form>
        </section>
      </DialogContent>
    </Dialog>
  )
}
