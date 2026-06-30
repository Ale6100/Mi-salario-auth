// src\components\Page\Income\table\util.tsx

import z from "zod";

export const formSchema = z.object({
  fuente_ingreso: z.string().trim().min(1, 'La fuente de ingreso es requerida'),
  periodo: z.string().trim().min(1, 'El periodo es requerido'),
  valor: z.string().trim().min(1, 'El valor es requerido').regex(/^\d+(\.\d{1,2})?$/, 'El valor debe ser un número válido')
});

export type FormSchema = z.infer<typeof formSchema>;
