// src\components\Page\Income\table\DialogAddEditIncome.tsx

import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchPostConceptoIngresos, fetchPutConceptoIngresos } from "@/lib/fetch/conceptosIngresos";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { formSchema, type FormSchema } from "./util";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import { MsgError } from "@/components/forms/MsgError";
import { RUTAS } from "@/lib/const";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { useId, useMemo, type Dispatch, type SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomReactSelect from "@/components/select/CustomReactSelect";
import type { ConceptoIngresosDB, POSTConceptoIngresos, PUTConceptoIngresos } from "@/types/conceptosIngresos";
import type { FuenteIngresosDB } from "@/types/fuentesIngresos";

type FuenteOption = { value: string; label: string; color?: string };

const formatFuenteOptionLabel = (option: FuenteOption) => (
  <span className="flex items-center gap-2">
    {option.color && <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: option.color }} />}
    {option.label}
  </span>
);

type DialogAddEditIncomeProps = {
  readonly isOpen: { status: boolean, income: ConceptoIngresosDB | undefined };
  readonly setIsOpen: Dispatch<SetStateAction<{ status: boolean, income: ConceptoIngresosDB | undefined }>>;
  readonly actualIncomes: ConceptoIngresosDB[];
  readonly fuentesData: FuenteIngresosDB[];
}

export const DialogAddEditIncome = ({ isOpen, setIsOpen, actualIncomes, fuentesData }: DialogAddEditIncomeProps) => {
  const { user, getAccessTokenSilently } = useAuth0();

  const toastId = useId();
  const queryClient = useQueryClient();

  const optionsFuentes = useMemo(() => {
    return fuentesData
      .toSorted((a, b) => {
        if (a.activo && !b.activo) return -1;
        if (!a.activo && b.activo) return 1;
        return a.nombre.localeCompare(b.nombre);
      })
      .map(fuente => ({
        value: fuente._id,
        label: fuente.nombre,
        color: fuente.color,
      }));
  }, [fuentesData]);

  const isEdit = isOpen.income != null;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fuente_ingreso: isEdit ? isOpen.income?.id_fuente_ingreso._id ?? "" : "",
      periodo: isEdit ? isOpen.income?.periodo ?? "" : "",
      valor: isEdit && isOpen.income?.valor != null ? isOpen.income.valor.toString() : "",
    }
  });

  const onSubmit = async (data: FormSchema) => {
    const token = await getAccessTokenSilently();

    if (isEdit || !user?.sub || !token) return;

    const existingIncome = actualIncomes.find(income => income.id_fuente_ingreso._id === data.fuente_ingreso && income.periodo === data.periodo);
    if (existingIncome) {
      return form.setError("periodo", { type: "manual", message: "Ya existe un ingreso para esta fuente y periodo" });
    }

    const dataToSend: POSTConceptoIngresos = {
      sub: user.sub,
      id_fuente_ingreso: data.fuente_ingreso,
      periodo: data.periodo,
      valor: Number.parseFloat(data.valor),
    }

    toast.loading("Espere...", { id: toastId });
    const response = await fetchPostConceptoIngresos({
      token,
      data: dataToSend,
    })

    if (response.statusCode != 201) {
      toast.error("Error al agregar el ingreso", { id: toastId });
      return close();
    }

    toast.success("Ingreso agregado correctamente", { id: toastId });
    await queryClient.invalidateQueries({ queryKey: ["conceptos-ingreso"] });
    close();
  }

  const onEdit = async (data: FormSchema) => {
    const token = await getAccessTokenSilently();

    if (!isEdit || !user?.sub || !token || !isOpen.income) return;

    if (isOpen.income.id_fuente_ingreso._id !== data.fuente_ingreso || isOpen.income.periodo !== data.periodo) {
      const existingIncome = actualIncomes.find(income => income.id_fuente_ingreso._id === data.fuente_ingreso && income.periodo === data.periodo);
      if (existingIncome) {
        return form.setError("periodo", { type: "manual", message: "Ya existe un ingreso para esta fuente y periodo" });
      }
    }

    const dataToSend: PUTConceptoIngresos = {
      id_fuente_ingreso: data.fuente_ingreso,
      periodo: data.periodo,
      valor: Number.parseFloat(data.valor),
    }

    toast.loading("Espere...", { id: toastId });
    const response = await fetchPutConceptoIngresos({
      token,
      id: isOpen.income._id,
      data: dataToSend,
    })

    if (response.statusCode != 200) {
      toast.error("Error al editar el ingreso", { id: toastId });
      return close();
    }

    toast.success("Ingreso editado correctamente", { id: toastId });
    await queryClient.invalidateQueries({ queryKey: ["conceptos-ingreso"] });
    close();
  }

  const close = () => {
    setIsOpen({ status: false, income: undefined });
  }

  const { isSubmitting, isDirty } = form.formState;

  return (
    <Dialog open={isOpen.status} onOpenChange={open => {
      if (!open) return close();
      setIsOpen(prev => ({ ...prev, status: open }));
    }}>
      <DialogContent className={'max-w-[95vw]! sm:max-w-[80vw]! max-h-[90dvh] overflow-x-hidden'}>
        <DialogHeader>
          <DialogTitle className="sm:text-lg">{isEdit ? "Editar ingreso" : "Agregar ingreso"}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <section>
          <form onSubmit={form.handleSubmit(isEdit ? onEdit : onSubmit)}>
            <FieldGroup>
              <Controller
                name="fuente_ingreso"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="required">
                      Fuente de ingreso
                    </FieldLabel>
                    {optionsFuentes.length === 0 ? (
                      <div className="flex items-center justify-between gap-2 rounded-md border border-dashed border-input px-3 py-2">
                        <span className="text-sm text-muted-foreground">
                          No hay fuentes de ingreso
                        </span>
                        <Link
                          to={RUTAS.configuration.incomeSources}
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
                        placeholder="Seleccione una fuente de ingreso..."
                        noOptionsMessage={() => "No hay fuentes de ingreso disponibles"}
                        isClearable
                        formatOptionLabel={formatFuenteOptionLabel}
                      />
                    )}
                    <MsgError fieldState={fieldState} />
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

              <Controller
                name="valor"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="required">Valor</FieldLabel>
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
