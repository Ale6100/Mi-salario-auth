// src\components\Page\Configuration\IncomeSources\util.tsx

import z from "zod";

export const formSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  activo: z.boolean(),
  aguinaldo: z.boolean(),
  color: z.string().trim().min(1, 'El color es requerido')
});

export type FormSchema = z.infer<typeof formSchema>;
