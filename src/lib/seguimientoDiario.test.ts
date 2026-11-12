import { describe, it, expect } from "vitest";
import { calcularSeguimientoDiario } from "./seguimientoDiario";

describe("calcularSeguimientoDiario", () => {
  it("calcula correctamente a mitad de mes en el período actual", () => {
    // 10 de noviembre de 2026 (mes de 30 días)
    const refDate = new Date(2026, 10, 10);
    const result = calcularSeguimientoDiario(300000, "2026-11", refDate);

    expect(result.esPeriodoActual).toBe(true);
    expect(result.daysInMonth).toBe(30);
    expect(result.dayOfMonth).toBe(10);
    expect(result.remainingDays).toBe(21); // 30 - 10 + 1
    expect(result.deberiasTenerHoy).toBe(210000); // 300000 * 21 / 30
    expect(result.gastoDiarioRecomendado).toBe(10000);
    expect(result.porcentajeMes).toBe(33); // 10 / 30 = 33%
  });

  it("calcula correctamente el primer día del mes", () => {
    const refDate = new Date(2026, 10, 1);
    const result = calcularSeguimientoDiario(300000, "2026-11", refDate);

    expect(result.dayOfMonth).toBe(1);
    expect(result.remainingDays).toBe(30);
    expect(result.deberiasTenerHoy).toBe(300000);
    expect(result.gastoDiarioRecomendado).toBe(10000);
  });

  it("calcula correctamente el último día del mes", () => {
    const refDate = new Date(2026, 10, 30);
    const result = calcularSeguimientoDiario(300000, "2026-11", refDate);

    expect(result.dayOfMonth).toBe(30);
    expect(result.remainingDays).toBe(1);
    expect(result.deberiasTenerHoy).toBe(10000);
    expect(result.gastoDiarioRecomendado).toBe(10000);
    expect(result.porcentajeMes).toBe(100);
  });

  it("maneja un mes pasado correctamente (debería quedar 0)", () => {
    const refDate = new Date(2026, 10, 15);
    const result = calcularSeguimientoDiario(300000, "2026-10", refDate);

    expect(result.esPeriodoActual).toBe(false);
    expect(result.remainingDays).toBe(0);
    expect(result.deberiasTenerHoy).toBe(0);
    expect(result.gastoDiarioRecomendado).toBe(0);
    expect(result.porcentajeMes).toBe(100);
  });

  it("maneja un mes futuro correctamente (monto completo disponible)", () => {
    const refDate = new Date(2026, 10, 15);
    const result = calcularSeguimientoDiario(310000, "2026-12", refDate);

    expect(result.esPeriodoActual).toBe(false);
    expect(result.daysInMonth).toBe(31);
    expect(result.remainingDays).toBe(31);
    expect(result.deberiasTenerHoy).toBe(310000);
    expect(result.gastoDiarioRecomendado).toBe(10000);
    expect(result.porcentajeMes).toBe(0);
  });

  it("maneja monto en cero sin errores de división", () => {
    const refDate = new Date(2026, 10, 15);
    const result = calcularSeguimientoDiario(0, "2026-11", refDate);

    expect(result.deberiasTenerHoy).toBe(0);
    expect(result.gastoDiarioRecomendado).toBe(0);
  });
});
