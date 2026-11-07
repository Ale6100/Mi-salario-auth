// src\components\Page\Expenses\table\columns.test.tsx

import { describe, expect, it, vi, beforeEach } from "vitest";
import { createPeriodoFilterOptions } from "./columns";
import type { ConceptoGastosDB } from "@/types/conceptosGastos";

const mockFuente = {
  _id: "f1",
  sub: "auth0|1",
  nombre: "Alquiler",
  color: "#3b82f6",
  updatedAt: "2026-01-01",
};

const createMockGasto = (periodo: string): ConceptoGastosDB => ({
  _id: `gasto-${periodo}`,
  sub: "auth0|1",
  id_fuente_gasto: mockFuente,
  periodo,
  monto: 1000,
  pagado: false,
});

describe("createPeriodoFilterOptions", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 5, 15)); // 2026-06
  });

  it("devuelve arreglo vacío si no hay gastos", () => {
    expect(createPeriodoFilterOptions([])).toEqual([]);
  });

  it("selecciona por defecto el mes actual si existe en los datos", () => {
    const gastos = [
      createMockGasto("2026-05"),
      createMockGasto("2026-06"),
      createMockGasto("2026-07"),
    ];

    const options = createPeriodoFilterOptions(gastos);

    expect(options).toHaveLength(3);
    // Ordenados de más reciente a más antiguo
    expect(options.map(o => o.value)).toEqual(["2026-07", "2026-06", "2026-05"]);

    const optActual = options.find(o => o.value === "2026-06");
    const optFuturo = options.find(o => o.value === "2026-07");
    const optPasado = options.find(o => o.value === "2026-05");

    expect(optActual?.defaultSelected).toBe(true);
    expect(optFuturo?.defaultSelected).toBe(false);
    expect(optPasado?.defaultSelected).toBe(false);
  });

  it("selecciona el mes más reciente anterior al actual si el mes actual no está cargado", () => {
    const gastos = [
      createMockGasto("2026-04"),
      createMockGasto("2026-05"),
      createMockGasto("2026-08"),
    ];

    const options = createPeriodoFilterOptions(gastos);

    expect(options.map(o => o.value)).toEqual(["2026-08", "2026-05", "2026-04"]);

    const opt08 = options.find(o => o.value === "2026-08");
    const opt05 = options.find(o => o.value === "2026-05");

    expect(opt05?.defaultSelected).toBe(true);
    expect(opt08?.defaultSelected).toBe(false);
  });
});
