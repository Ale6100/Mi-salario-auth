// src\types\fuentesGastos.d.ts

export type FuenteGastosDB = {
  _id: string;
  sub: string;
  nombre: string;
  color: string;
  es_indispensable?: boolean;
  updatedAt: string;
};

export type POSTFuenteGastos = Omit<FuenteGastosDB, "_id" | "updatedAt">;

export type PUTFuenteGastos = Omit<POSTFuenteGastos, "sub">;
