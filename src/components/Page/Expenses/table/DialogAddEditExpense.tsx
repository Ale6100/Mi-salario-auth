// src\components\Page\Expenses\table\DialogAddEditExpense.tsx

import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchPostConceptoGastos, fetchPutConceptoGastos } from "@/lib/fetch/conceptosGastos";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { format } from "date-fns";
import { FormatFuenteOptionLabel } from "@/components/select/FormatFuenteOptionLabel";
import { formSchema, type FormSchema } from "./util";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import { MsgError } from "@/components/forms/MsgError";
import { RUTAS } from "@/lib/const";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { useId, useMemo, type Dispatch, type SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomReactSelect from "@/components/select/CustomReactSelect";
import type { ConceptoGastosDB, POSTConceptoGastos, PUTConceptoGastos } from "@/types/conceptosGastos";
import type { FuenteGastosDB } from "@/types/fuentesGastos";

type DialogAddEditExpenseProps = {
  readonly isOpen: { status: boolean, expense: ConceptoGastosDB | undefined };
  readonly setIsOpen: Dispatch<SetStateAction<{ status: boolean, expense: ConceptoGastosDB | undefined }>>;
  readonly actualExpenses: ConceptoGastosDB[];
  readonly fuentesData: FuenteGastosDB[];
}

export const DialogAddEditExpense = ({ isOpen, setIsOpen, actualExpenses, fuentesData }: DialogAddEditExpenseProps) => {
  const { user, getAccessTokenSilently } = useAuth0();

  const toastId = useId();
  const queryClient = useQueryClient();

  const optionsFuentes = useMemo(() => {
    return fuentesData
      .toSorted((a, b) => {
        if (a.updatedAt > b.updatedAt) return -1;
        if (a.updatedAt < b.updatedAt) return 1;
        return a.nombre.localeCompare(b.nombre);
      })
      .map(fuente => ({
        value: fuente._id,
        label: fuente.nombre,
        color: fuente.color,
      }));
  }, [fuentesData]);

  const currentMonth = format(new Date(), "yyyy-MM");

  const isEdit = isOpen.expense != null;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fuente_gasto: isEdit ? isOpen.expense?.id_fuente_gasto?._id ?? "" : "",
      periodo: isEdit ? isOpen.expense?.periodo ?? "" : currentMonth,
      monto: isEdit && isOpen.expense?.monto != null && isOpen.expense.monto !== -1 ? isOpen.expense.monto.toString() : "",
      modo_porcentaje: isEdit ? isOpen.expense?.porcentaje_total != null : false,
      porcentaje: isEdit && isOpen.expense?.porcentaje_total != null ? isOpen.expense.porcentaje_total.toString() : "1",
    }
  });

  const modoPorcentaje = form.watch('modo_porcentaje');

  const onSubmit = async (data: FormSchema) => {
    const token = await getAccessTokenSilently();

    if (isEdit || !user?.sub || !token) return;

    const existingExpense = actualExpenses.find(expense => expense.id_fuente_gasto._id === data.fuente_gasto && expense.periodo === data.periodo);
    if (existingExpense) {
      return form.setError("periodo", { type: "manual", message: "Ya existe un gasto para esta fuente en el periodo seleccionado" });
    }

    const dataToSend: POSTConceptoGastos = {
      sub: user.sub,
      id_fuente_gasto: data.fuente_gasto,
      periodo: data.periodo,
      monto: data.modo_porcentaje ? undefined : Number.parseFloat(data.monto || '0'),
      porcentaje_total: data.modo_porcentaje ? Number.parseFloat(data.porcentaje || '0') : undefined,
    }

    toast.loading("Espere...", { id: toastId });
    const response = await fetchPostConceptoGastos({
      token,
      data: dataToSend,
    })

    if (response.statusCode != 201) {
      toast.error("Error al agregar el gasto", { id: toastId });
      return close();
    }

    toast.success("Gasto agregado correctamente", { id: toastId });
    await queryClient.invalidateQueries({ queryKey: ["conceptos-gastos"] });
    close();
  }

  const onEdit = async (data: FormSchema) => {
    const token = await getAccessTokenSilently();

    if (!isEdit || !user?.sub || !token || !isOpen.expense) return;

    if (isOpen.expense.id_fuente_gasto._id !== data.fuente_gasto || isOpen.expense.periodo !== data.periodo) {
      const existingExpense = actualExpenses.find(expense => expense.id_fuente_gasto._id === data.fuente_gasto && expense.periodo === data.periodo);
      if (existingExpense) {
        return form.setError("periodo", { type: "manual", message: "Ya existe un gasto para esta fuente en el periodo seleccionado" });
      }
    }

    const dataToSend: PUTConceptoGastos = {
      id_fuente_gasto: data.fuente_gasto,
      periodo: data.periodo,
      monto: data.modo_porcentaje ? undefined : Number.parseFloat(data.monto || '0'),
      porcentaje_total: data.modo_porcentaje ? Number.parseFloat(data.porcentaje || '0') : undefined,
    }

    toast.loading("Espere...", { id: toastId });
    const response = await fetchPutConceptoGastos({
      token,
      id: isOpen.expense._id,
      data: dataToSend,
    })

    if (response.statusCode != 200) {
      toast.error("Error al editar el gasto", { id: toastId });
      return close();
    }

    toast.success("Gasto editado correctamente", { id: toastId });
    await queryClient.invalidateQueries({ queryKey: ["conceptos-gastos"] });
    close();
  }

  const close = () => {
    setIsOpen({ status: false, expense: undefined });
  }

  const { isSubmitting, isDirty } = form.formState;

  return (
    <Dialog open={isOpen.status} onOpenChange={open => {
      if (!open) return close();
      setIsOpen(prev => ({ ...prev, status: open }));
    }}>
      <DialogContent className={'max-w-[95vw]! sm:max-w-[80vw]! max-h-[90dvh] overflow-x-hidden'}>
        <DialogHeader>
          <DialogTitle className="sm:text-lg">{isEdit ? "Editar gasto" : "Agregar gasto"}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <section>
          <form onSubmit={form.handleSubmit(isEdit ? onEdit : onSubmit)}>
            <FieldGroup>
              <Controller
                name="fuente_gasto"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="required">
                      Fuente de gasto
                    </FieldLabel>
                    {optionsFuentes.length === 0 ? (
                      <div className="flex items-center justify-between gap-2 rounded-md border border-dashed border-input px-3 py-2">
                        <span className="text-sm text-muted-foreground">
                          No hay fuentes de gastos
                        </span>
                        <Link
                          to={RUTAS.configuration.expenseSources}
                          onClick={close}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Configurar
                        </Link>
                      </div>
                    ) : (
                      <CustomReactSelect
                        value={optionsFuentes.find(fuente => fuente.value === field.value) || null}
                        onChange={(option) => field.onChange(option?.value || '')}
                        options={optionsFuentes}
                        placeholder="Seleccione una fuente de gasto..."
                        noOptionsMessage={() => "No hay fuentes de gastos disponibles"}
                        isClearable
                        formatOptionLabel={FormatFuenteOptionLabel}
                        minMenuHeight={200}
                        maxMenuHeight={200}
                      />
                    )}
                    <MsgError fieldState={fieldState} />
                      <p className="mt-1 text-xs text-muted-foreground">
                        ¿No encontrás la fuente que buscás? Podés{" "}
                        <Link
                          to={RUTAS.configuration.expenseSources}
                          onClick={close}
                          className="font-medium text-primary hover:underline"
                        >
                          agregarla en configuración
                        </Link>
                      </p>
                  </Field>
                )}
              />

              <Controller
                name="periodo"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="required">Periodo</FieldLabel>
                    <Input
                      type="month"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      onChange={field.onChange}
                    />
                    <MsgError fieldState={fieldState} />
                  </Field>
                )}
              />

              {!modoPorcentaje && (
                <Controller
                  name="monto"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="required">Monto</FieldLabel>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        aria-invalid={fieldState.invalid}
                        onChange={field.onChange}
                      />
                      <MsgError fieldState={fieldState} />
                    </Field>
                  )}
                />
              )}

              <div className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="estimar-porcentaje" className="text-sm font-medium cursor-pointer">
                    Estimar como porcentaje de ingresos
                  </Label>
                  <Controller
                    name="modo_porcentaje"
                    control={form.control}
                    render={({ field }) => (
                      <Switch
                        id="estimar-porcentaje"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                {modoPorcentaje && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    Estimar un
                    <Controller
                      name="porcentaje"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          {...field}
                          className="inline-flex h-7 w-14 px-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      )}
                    />
                    % de mis ingresos mensuales
                  </div>
                )}
              </div>

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
