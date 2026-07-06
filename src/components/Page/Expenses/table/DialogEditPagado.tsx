// src\components\Page\Expenses\table\DialogEditPagado.tsx

import type { ConceptoGastosDB, PATCHConceptoGastos } from "@/types/conceptosGastos";
import { useAuth0 } from "@auth0/auth0-react";
import { useQueryClient } from "@tanstack/react-query";
import { useId, useEffect, type Dispatch, type SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import { formSchemaEditPagado, type FormSchemaEditPagado } from "./util";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MsgError } from "@/components/forms/MsgError";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchPatchConceptoGastos } from "@/lib/fetch/conceptosGastos";
import { formatPrice } from "@/lib/utils";

type DialogEditPagadoProps = {
  readonly isOpen: { status: boolean, expense: ConceptoGastosDB | undefined };
  readonly setIsOpen: Dispatch<SetStateAction<{ status: boolean, expense: ConceptoGastosDB | undefined }>>;
}

export const DialogEditPagado = ({ isOpen, setIsOpen }: DialogEditPagadoProps) => {
  const { getAccessTokenSilently } = useAuth0();

  const toastId = useId();
  const queryClient = useQueryClient();

  const form = useForm<FormSchemaEditPagado>({
    resolver: zodResolver(formSchemaEditPagado),
    defaultValues: {
      monto: '',
      aclaracion: '',
    }
  });

  useEffect(() => {
    if (isOpen.expense) {
      form.reset({
        monto: isOpen.expense.pagado && isOpen.expense.monto != null && isOpen.expense.monto !== -1
          ? isOpen.expense.monto.toString()
          : '',
        aclaracion: isOpen.expense.aclaracion ?? '',
      });
    }
  }, [isOpen.expense, form]);

  const onSubmit = async (data: FormSchemaEditPagado) => {
    const token = await getAccessTokenSilently();

    if (!isOpen.expense?._id) return;

    const dataToSend: PATCHConceptoGastos = {
      aclaracion: data.aclaracion,
    }

    if (data.monto) {
      dataToSend.monto = Number.parseFloat(data.monto);
    }

    toast.loading('Espere...', { id: toastId });
    const response = await fetchPatchConceptoGastos({
      token,
      id: isOpen.expense._id,
      data: dataToSend,
    })

    if (response.statusCode != 200) {
      toast.error('Error al marcar como pagado', { id: toastId });
      return close();
    }

    toast.success('Gasto marcado como pagado', { id: toastId });
    queryClient.invalidateQueries({ queryKey: ['conceptos-gastos'] });
    close();
  }

  const close = () => {
    setIsOpen({ status: false, expense: undefined });
  }

  const { isSubmitting } = form.formState;

  const yaPagado = isOpen.expense?.pagado;

  return (
    <Dialog open={isOpen.status} onOpenChange={open => {
      if (!open) return close();
      setIsOpen(prev => ({ ...prev, status: open }));
    }}>
      <DialogContent className={'max-w-[95vw]! sm:max-w-[80vw]! max-h-[90dvh] overflow-x-hidden'}>
        <DialogHeader>
          <DialogTitle className="sm:text-lg">{yaPagado ? "Editar pago" : "Marcar como pagado"}</DialogTitle>
          <DialogDescription>
            {yaPagado
              ? "Actualizá el monto final o la aclaración de este gasto ya pagado."
              : `Confirmá el pago de este gasto. El monto actual es ${formatPrice(isOpen.expense?.monto ?? 0)}.`
            }
          </DialogDescription>
        </DialogHeader>
        <section>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="monto"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Monto final {!yaPagado && <span className="text-xs text-muted-foreground">(opcional)</span>}</FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={yaPagado ? "0.00" : "Dejalo vacío si no cambia"}
                      {...field}
                      aria-invalid={fieldState.invalid}
                      onChange={field.onChange}
                    />
                    <MsgError fieldState={fieldState} />
                    {!yaPagado && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Si el monto final es el mismo que el estimado, podés dejarlo vacío.
                      </p>
                    )}
                  </Field>
                )}
              />

              <Controller
                name="aclaracion"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Aclaración</FieldLabel>
                    <Input
                      type="text"
                      placeholder="Aclaración opcional"
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
                <Button type="submit" title={yaPagado ? "Guardar cambios" : "Confirmar pago"} className="cursor-pointer" disabled={isSubmitting}>
                  {yaPagado ? "Guardar cambios" : "Confirmar pago"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </section>
      </DialogContent>
    </Dialog>
  )
}
