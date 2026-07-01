// src\components\Page\Expenses\table\DialogEditMontoReal.tsx

import type { ConceptoGastosDB, PATCHConceptoGastos } from "@/types/conceptosGastos";
import { useAuth0 } from "@auth0/auth0-react";
import { useQueryClient } from "@tanstack/react-query";
import { useId, type Dispatch, type SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import { formSchemaEditMontoReal, type FormSchemaEditMontoReal } from "./util";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MsgError } from "@/components/forms/MsgError";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchPatchConceptoGastos } from "@/lib/fetch/conceptosGastos";

type DialogEditMontoRealProps = {
  readonly isOpen: { status: boolean, expense: ConceptoGastosDB | undefined };
  readonly setIsOpen: Dispatch<SetStateAction<{ status: boolean, expense: ConceptoGastosDB | undefined }>>;
}

export const DialogEditMontoReal = ({ isOpen, setIsOpen }: DialogEditMontoRealProps) => {
  const { getAccessTokenSilently } = useAuth0();

  const toastId = useId();
  const queryClient = useQueryClient();

  const form = useForm<FormSchemaEditMontoReal>({
    resolver: zodResolver(formSchemaEditMontoReal),
    defaultValues: {
      monto_real: isOpen.expense?.monto_real?.toString() ?? '',
      aclaracion: isOpen.expense?.aclaracion ?? '',
    }
  });

  const onSubmit = async (data: FormSchemaEditMontoReal) => {
    const token = await getAccessTokenSilently();

    if (!isOpen.expense?._id) return;

    const dataToSend: PATCHConceptoGastos = {
      monto_real: Number.parseFloat(data.monto_real),
      aclaracion: data.aclaracion,
    }

    toast.loading('Espere...', { id: toastId });
    const response = await fetchPatchConceptoGastos({
      token,
      id: isOpen.expense._id,
      data: dataToSend,
    })

    if (response.statusCode != 200) {
      toast.error('Error al actualizar el gasto', { id: toastId });
      return close();
    }

    toast.success('Gasto actualizado', { id: toastId });
    queryClient.invalidateQueries({ queryKey: ['conceptos-gastos'] });
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
          <DialogTitle className="sm:text-lg">{"Registrar monto real"}</DialogTitle>
          <DialogDescription>
            Escribe el monto real del gasto
          </DialogDescription>
        </DialogHeader>
        <section>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="monto_real"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="required">Monto real</FieldLabel>
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

              <Controller
                name="aclaracion"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Aclaración</FieldLabel>
                    <Input
                      type="text"
                      placeholder="Aclaración opcional adicional"
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
