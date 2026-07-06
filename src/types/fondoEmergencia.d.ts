// src\types\fondoEmergencia.d.ts

export type FondoEmergenciaDB = {
  _id: string;
  sub: string;
  monto_pesos: number;
  monto_dolares: number;
  incluir_dolares: boolean;
  porcentaje_total: number;
  saldo_real: number | null;
};

export type PATCHFondoEmergencia = Partial<Omit<FondoEmergenciaDB, "_id">>;
