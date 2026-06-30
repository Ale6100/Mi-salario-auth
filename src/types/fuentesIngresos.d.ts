// src\types\fuentesIngresos.d.ts

export type FuenteIngresosDB = {
  _id: string;
  sub: string;
  nombre: string;
  activo: boolean;
  aguinaldo: boolean;
  color: string;
};

export type POSTFuenteIngresos = Omit<FuenteIngresosDB, "_id">;

export type PUTFuenteIngresos = Omit<POSTFuenteIngresos, "sub">;
