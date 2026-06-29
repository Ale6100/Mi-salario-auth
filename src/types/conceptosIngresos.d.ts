// src\types\conceptosIngresos.d.ts

import type { FuenteIngresosDB } from "./fuentesIngresos";

export type ConceptoIngresosDB = {
  _id: string;
  id_fuente_ingreso: FuenteIngresosDB;
  sub: string;
  periodo: string;
  valor: number;
};

export type POSTConceptoIngresos = {
  sub: string;
  id_fuente_ingreso: string;
  periodo: string;
  valor: number;
}

export type PUTConceptoIngresos = Omit<POSTConceptoIngresos, "sub">
