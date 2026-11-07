// src\components\Page\Expenses\table\util.tsx

import z from "zod";

export const VALOR_NO_USADO = -1;

export const formSchema = z.object({
  fuente_gasto: z.string().trim().min(1, 'La fuente de gasto es requerida'),
  periodo: z.string().trim().min(1, 'El periodo es requerido'),
  monto: z.string().trim().default(''),
  modo_porcentaje: z.boolean().default(false),
  porcentaje: z.string().trim().default('1'),
  es_cuota: z.boolean().default(false),
  total_cuotas: z.string().trim().default('2'),
  cuota_actual: z.string().trim().default('1'),
  aclaracion: z.string().trim().default(''),
}).superRefine((data, ctx) => {
  if (data.es_cuota) {
    const total = Number.parseInt(data.total_cuotas, 10);
    const actual = Number.parseInt(data.cuota_actual, 10);
    if (Number.isNaN(total) || total < 2) {
      ctx.addIssue({
        code: "custom",
        message: 'El total de cuotas debe ser al menos 2',
        path: ['total_cuotas'],
      });
    }
    if (Number.isNaN(actual) || actual < 1) {
      ctx.addIssue({
        code: "custom",
        message: 'La cuota actual debe ser al menos 1',
        path: ['cuota_actual'],
      });
    } else if (!Number.isNaN(total) && actual > total) {
      ctx.addIssue({
        code: "custom",
        message: 'La cuota actual no puede superar el total de cuotas',
        path: ['cuota_actual'],
      });
    }
    const monto = Number.parseFloat(data.monto);
    if (Number.isNaN(monto) || monto < 0) {
      ctx.addIssue({
        code: "custom",
        message: 'El monto de la cuota debe ser un valor mayor o igual a 0',
        path: ['monto'],
      });
    }
  } else if (data.modo_porcentaje) {
    const pct = Number.parseFloat(data.porcentaje);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      ctx.addIssue({
        code: "custom",
        message: 'El porcentaje debe ser un valor entre 0 y 100',
        path: ['porcentaje'],
      });
    }
  } else {
    const monto = Number.parseFloat(data.monto);
    if (Number.isNaN(monto) || monto < 0) {
      ctx.addIssue({
        code: "custom",
        message: 'El monto debe ser un valor mayor o igual a 0',
        path: ['monto'],
      });
    }
  }
});

export type FormSchema = z.input<typeof formSchema>;

export const formSchemaEditPagado = z.object({
  monto: z.string().trim().default(''),
  aclaracion: z.string().trim().default(''),
})

export type FormSchemaEditPagado = z.input<typeof formSchemaEditPagado>;
