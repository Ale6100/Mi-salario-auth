// src\types\fuentesIngresos.d.ts

export type FuenteIngresosDB = {
  _id: string;
  sub: string;
  nombre: string;
  activo: boolean;
  aguinaldo: boolean;
  color: string;
};

export type POSTFuenteIngresos = {
  nombre: string;
  activo: boolean;
  aguinaldo: boolean;
  color: string;
}

export type PUTFuenteIngresos = POSTFuenteIngresos