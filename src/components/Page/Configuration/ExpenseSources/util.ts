// src\components\Page\Configuration\ExpenseSources\util.ts

import z from "zod";

export const formSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  color: z.string().trim().min(1, 'El color es requerido')
});

export type FormSchema = z.infer<typeof formSchema>;
