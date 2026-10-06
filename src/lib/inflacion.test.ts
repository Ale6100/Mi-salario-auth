// src\lib\inflacion.test.ts

import { describe, expect, it } from "vitest";
import { calcularEvolucionReal, calcularIndicesPorPeriodo, getUltimoPeriodoConDato } from "@/lib/inflacion";

describe("calcularIndicesPorPeriodo", () => {
  it("acumula la inflación mes a mes, indexado por yyyy-MM", () => {
    const indices = calcularIndicesPorPeriodo([
      { fecha: "2025-01-31", valor: 10 },
      { fecha: "2025-02-28", valor: 20 },
    ]);

    expect(indices.get("2025-01")).toBeCloseTo(1.1);
    expect(indices.get("2025-02")).toBeCloseTo(1.32);
  });

  it("ordena la serie por fecha antes de acumular", () => {
    const indices = calcularIndicesPorPeriodo([
      { fecha: "2025-02-28", valor: 20 },
      { fecha: "2025-01-31", valor: 10 },
    ]);

    expect(indices.get("2025-01")).toBeCloseTo(1.1);
    expect(indices.get("2025-02")).toBeCloseTo(1.32);
  });

  it("devuelve un mapa vacío si no hay datos", () => {
    expect(calcularIndicesPorPeriodo([]).size).toBe(0);
  });
});

describe("getUltimoPeriodoConDato", () => {
  it("devuelve el período más reciente sin importar el orden de inserción", () => {
    const indices = new Map([["2025-03", 1.3], ["2024-12", 1], ["2025-01", 1.1]]);

    expect(getUltimoPeriodoConDato(indices)).toBe("2025-03");
  });

  it("devuelve undefined si no hay índices", () => {
    expect(getUltimoPeriodoConDato(new Map())).toBeUndefined();
  });
});

describe("calcularEvolucionReal", () => {
  const indices = calcularIndicesPorPeriodo([
    { fecha: "2025-01-31", valor: 10 },
    { fecha: "2025-02-28", valor: 20 },
  ]);

  it("expresa cada período en pesos del último mes con dato", () => {
    const [enero, febrero] = calcularEvolucionReal([
      { periodo: "2025-01", ingresos: 1000, gastos: 500 },
      { periodo: "2025-02", ingresos: 1000, gastos: 500 },
    ], indices);

    expect(enero.ajustado).toBe(true);
    expect(enero.ingresos).toBeCloseTo(1200);
    expect(enero.gastos).toBeCloseTo(600);

    expect(febrero).toEqual({ periodo: "2025-02", ingresos: 1000, gastos: 500, ajustado: true });
  });

  it("deja sin modificar y con ajustado: false a los períodos sin dato de inflación", () => {
    const resultado = calcularEvolucionReal([
      { periodo: "2024-12", ingresos: 800, gastos: 300 },
      { periodo: "2025-03", ingresos: 1500, gastos: 700 },
    ], indices);

    expect(resultado).toEqual([
      { periodo: "2024-12", ingresos: 800, gastos: 300, ajustado: false },
      { periodo: "2025-03", ingresos: 1500, gastos: 700, ajustado: false },
    ]);
  });

  it("ordena los períodos cronológicamente", () => {
    const resultado = calcularEvolucionReal([
      { periodo: "2025-03", ingresos: 0, gastos: 0 },
      { periodo: "2025-01", ingresos: 0, gastos: 0 },
      { periodo: "2025-02", ingresos: 0, gastos: 0 },
    ], indices);

    expect(resultado.map(({ periodo }) => periodo)).toEqual(["2025-01", "2025-02", "2025-03"]);
  });

  it("no ajusta nada si no hay índices", () => {
    const resultado = calcularEvolucionReal([{ periodo: "2025-01", ingresos: 100, gastos: 50 }], new Map());

    expect(resultado).toEqual([{ periodo: "2025-01", ingresos: 100, gastos: 50, ajustado: false }]);
  });
});
