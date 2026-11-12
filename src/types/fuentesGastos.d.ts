// src\types\fuentesGastos.d.ts

export type FuenteGastosDB = {
  _id: string;
  sub: string;
  nombre: string;
  color: string;
  es_indispensable?: boolean;
  seguimiento_diario?: boolean;
  updatedAt: string;
};

export type POSTFuenteGastos = Omit<FuenteGastosDB, "_id" | "sub" | "updatedAt">;

export type PUTFuenteGastos = POSTFuenteGastos;
