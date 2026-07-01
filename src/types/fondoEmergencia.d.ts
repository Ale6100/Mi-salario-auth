// src\types\fondoEmergencia.d.ts

export type FondoEmergenciaDB = {
  _id: string;
  sub: string;
  monto_pesos: number;
  monto_dolares: number;
  incluir_dolares: boolean;
  porcentaje_total: number;
};

export type PATCHFondoEmergencia = Omit<FondoEmergenciaDB, "_id" | "sub">;
