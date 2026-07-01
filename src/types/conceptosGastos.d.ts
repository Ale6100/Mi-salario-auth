// src\types\conceptosGastos.d.ts

import type { FuenteGastosDB } from "./fuentesGastos";

export type ConceptoGastosDB = {
  _id: string;
  id_fuente_gasto: FuenteGastosDB;
  sub: string;
  periodo: string;
  monto_estimado?: number;
  porcentaje_total?: number; // Un porcentaje de X% implicará que el gasto estimado sea un X% de los ingresos totales de este mes
  monto_real?: number;
  aclaracion?: string;
  columnaMonto: number;
}

export type POSTConceptoGastos = {
  sub: string;
  id_fuente_gasto: string;
  periodo: string;
  monto_estimado?: number;
  porcentaje_total?: number;
};

export type PUTConceptoGastos = Omit<POSTConceptoGastos, "sub">;

export type PATCHConceptoGastos = {
  monto_real: number;
  aclaracion?: string;
}
