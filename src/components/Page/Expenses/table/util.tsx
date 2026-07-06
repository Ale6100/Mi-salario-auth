// src\components\Page\Expenses\table\util.tsx

import z from "zod";

export const formSchema = z.object({
  fuente_gasto: z.string().trim().min(1, 'La fuente de gasto es requerida'),
  periodo: z.string().trim().min(1, 'El periodo es requerido'),
  monto: z.string().trim().default(''),
  modo_porcentaje: z.boolean().default(false),
  porcentaje: z.string().trim().default('1'),
}).superRefine((data, ctx) => {
  if (data.modo_porcentaje) {
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
