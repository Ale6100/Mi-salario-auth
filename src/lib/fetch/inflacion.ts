// src\lib\fetch\inflacion.ts

export type InflacionMensual = {
  fecha: string;
  valor: number;
}

const URL_INFLACION_MENSUAL = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion";

export const fetchInflacionMensual = async ({ signal }: { signal?: AbortSignal } = {}) => {
  const response = await fetch(URL_INFLACION_MENSUAL, { signal });
  if (!response.ok) throw new Error("No se pudo obtener la inflación mensual");
  return await response.json() as InflacionMensual[];
}
