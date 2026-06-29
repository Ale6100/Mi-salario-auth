// src\types\global.d.ts

export type ResponseBackend<T> = {
  statusCode: number;
  message?: string[] | string;
  data?: T;
}
