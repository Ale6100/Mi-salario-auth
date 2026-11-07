// src\lib\periodo.test.ts

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  esPeriodoValido,
  formatPeriodoLargo,
  generarRangoPeriodos,
  getPeriodoActual,
  getPeriodoAnterior,
} from "@/lib/periodo";

describe("esPeriodoValido", () => {
  it("acepta períodos yyyy-MM con mes entre 01 y 12", () => {
    expect(esPeriodoValido("2026-01")).toBe(true);
    expect(esPeriodoValido("2026-12")).toBe(true);
  });

  it("rechaza valores vacíos, meses fuera de rango o con otro formato", () => {
    expect(esPeriodoValido("")).toBe(false);
    expect(esPeriodoValido("2026-00")).toBe(false);
    expect(esPeriodoValido("2026-13")).toBe(false);
    expect(esPeriodoValido("2026-1")).toBe(false);
    expect(esPeriodoValido("26-01")).toBe(false);
    expect(esPeriodoValido("2026-01-15")).toBe(false);
  });
});

describe("getPeriodoAnterior", () => {
  it("devuelve el mes anterior dentro del mismo año", () => {
    expect(getPeriodoAnterior("2025-06")).toBe("2025-05");
  });

  it("pasa a diciembre del año anterior cuando el período es enero", () => {
    expect(getPeriodoAnterior("2025-01")).toBe("2024-12");
  });

  it("no se desborda desde meses cortos ni largos", () => {
    expect(getPeriodoAnterior("2024-03")).toBe("2024-02");
    expect(getPeriodoAnterior("2025-08")).toBe("2025-07");
  });
});

describe("getPeriodoActual", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("devuelve el año y mes de la fecha local en formato yyyy-MM", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 31, 23, 59));

    expect(getPeriodoActual()).toBe("2026-01");
  });
});

describe("formatPeriodoLargo", () => {
  it("formatea el período con el nombre del mes en español y en mayúscula inicial", () => {
    expect(formatPeriodoLargo("2025-03")).toBe("Marzo 2025");
    expect(formatPeriodoLargo("2024-12")).toBe("Diciembre 2024");
  });
});

describe("generarRangoPeriodos", () => {
  it("genera una lista completa y consecutiva de meses entre dos períodos", () => {
    expect(generarRangoPeriodos("2025-08", "2025-10")).toEqual([
      "2025-08",
      "2025-09",
      "2025-10",
    ]);
  });

  it("cruza el cambio de año correctamente", () => {
    expect(generarRangoPeriodos("2025-11", "2026-02")).toEqual([
      "2025-11",
      "2025-12",
      "2026-01",
      "2026-02",
    ]);
  });

  it("incluye todos los meses intermedios en un salto de más de un año (ej. Sep 25 a Oct 26)", () => {
    const rango = generarRangoPeriodos("2025-09", "2026-10");
    expect(rango).toHaveLength(14);
    expect(rango[0]).toBe("2025-09");
    expect(rango[1]).toBe("2025-10");
    expect(rango[3]).toBe("2025-12");
    expect(rango[4]).toBe("2026-01");
    expect(rango[13]).toBe("2026-10");
  });

  it("devuelve un solo período si inicio y fin son iguales", () => {
    expect(generarRangoPeriodos("2026-05", "2026-05")).toEqual(["2026-05"]);
  });

  it("devuelve array vacío si algún período es inválido", () => {
    expect(generarRangoPeriodos("invalido", "2026-05")).toEqual([]);
  });
});
