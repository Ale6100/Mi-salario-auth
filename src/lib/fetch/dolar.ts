// src\lib\fetch\dolar.ts

export type CotizacionDolar = {
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

const URL_DOLAR_MEP = "https://dolarapi.com/v1/dolares/bolsa";

export const fetchCotizacionDolarMep = async ({ signal }: { signal?: AbortSignal } = {}) => {
  const response = await fetch(URL_DOLAR_MEP, { signal });
  if (!response.ok) throw new Error("No se pudo obtener la cotización del dólar");
  return await response.json() as CotizacionDolar;
}
