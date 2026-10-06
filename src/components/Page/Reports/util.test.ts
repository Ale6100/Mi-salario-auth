// src\components\Page\Reports\util.test.ts

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateFullReport, generateReport } from "./util";

const ars = (value: number) => new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(value);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 4, 15, 9, 30));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("generateReport", () => {
  it("incluye el mes, cada concepto, los totales y la fecha de generación", () => {
    const reporte = generateReport({
      month: "03",
      year: "2026",
      incomes: [{ fuente: "Sueldo", valor: 1000 }, { fuente: "Freelance", valor: 250.5 }],
      expenses: [
        { fuente: "Alquiler", color: "#000", monto: 600, pagado: true },
        { fuente: "Luz", color: "#fff", monto: 40.25, pagado: false, aclaracion: "Bimestral" },
      ],
    });

    expect(reporte.startsWith("# Reporte financiero mensual")).toBe(true);
    expect(reporte).toContain("pesos argentinos (ARS)");
    expect(reporte).toContain("## Marzo 2026");
    expect(reporte).toContain(`| Sueldo | ${ars(1000)} |`);
    expect(reporte).toContain(`| Luz | ${ars(40.25)} | Bimestral |`);
    expect(reporte).toContain(`**Total ingresos:** ${ars(1250.5)}`);
    expect(reporte).toContain(`**Total gastos:** ${ars(640.25)}`);
    expect(reporte).toContain("- **Generado el:** 15/05/2026 09:30");
  });

  it("indica cuando no hay ingresos ni gastos y totaliza en cero", () => {
    const reporte = generateReport({ month: "01", year: "2026", incomes: [], expenses: [] });

    expect(reporte).toContain("Sin ingresos registrados.");
    expect(reporte).toContain("Sin gastos registrados.");
    expect(reporte).toContain(`**Total ingresos:** ${ars(0)}`);
    expect(reporte).toContain(`**Total gastos:** ${ars(0)}`);
  });
});

describe("generateFullReport", () => {
  it("genera Markdown con la moneda, un apartado por período y el resumen global", () => {
    const reporte = generateFullReport({
      periods: [
        {
          periodo: "2025-12",
          incomes: [{ fuente: "Sueldo", valor: 1000 }],
          expenses: [{ fuente: "Alquiler", color: "#000", monto: 400, pagado: true, aclaracion: "Incluye expensas" }],
        },
        {
          periodo: "2026-01",
          incomes: [{ fuente: "Sueldo", valor: 2000 }],
          expenses: [{ fuente: "Alquiler", color: "#000", monto: 800, pagado: false }],
        },
      ],
    });

    expect(reporte.startsWith("# Reporte financiero completo")).toBe(true);
    expect(reporte).toContain("pesos argentinos (ARS)");
    expect(reporte).toContain("- **Períodos:** 2");
    expect(reporte).toContain("- **Desde:** Diciembre 2025");
    expect(reporte).toContain("- **Hasta:** Enero 2026");
    expect(reporte).toContain("- **Generado el:** 15/05/2026 09:30");
    expect(reporte).toContain("## Diciembre 2025");
    expect(reporte).toContain("## Enero 2026");
    expect(reporte).toContain(`| Sueldo | ${ars(1000)} |`);
    expect(reporte).toContain(`| Alquiler | ${ars(400)} | Incluye expensas |`);
    expect(reporte).toContain(`**Total ingresos:** ${ars(2000)}`);
    expect(reporte).toContain(`| Total ingresos | ${ars(3000)} |`);
    expect(reporte).toContain(`| Total gastos | ${ars(1200)} |`);
    expect(reporte).toContain(`| Promedio ingresos / mes | ${ars(1500)} |`);
    expect(reporte).toContain(`| Promedio gastos / mes | ${ars(600)} |`);
  });

  it("escapa los caracteres que romperían las tablas de Markdown", () => {
    const reporte = generateFullReport({
      periods: [{
        periodo: "2026-01",
        incomes: [],
        expenses: [{ fuente: "Tarjeta | Visa", color: "#000", monto: 10, pagado: false, aclaracion: "Cuota 1\nde 3" }],
      }],
    });

    expect(reporte).toContain(`| Tarjeta \\| Visa | ${ars(10)} | Cuota 1 de 3 |`);
  });

  it("indica los períodos sin conceptos", () => {
    const reporte = generateFullReport({ periods: [{ periodo: "2026-01", incomes: [], expenses: [] }] });

    expect(reporte).toContain("Sin ingresos registrados.");
    expect(reporte).toContain("Sin gastos registrados.");
  });

  it("sin períodos muestra guiones, totales en cero y no divide por cero", () => {
    const reporte = generateFullReport({ periods: [] });

    expect(reporte).toContain("- **Períodos:** 0");
    expect(reporte).toContain("- **Desde:** -");
    expect(reporte).toContain("- **Hasta:** -");
    expect(reporte).not.toMatch(/^## (?!Resumen global)/m);
    expect(reporte).toContain(`| Promedio ingresos / mes | ${ars(0)} |`);
    expect(reporte).not.toContain("NaN");
  });
});
