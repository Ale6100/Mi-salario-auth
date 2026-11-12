import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SeguimientoDiarioCard } from "./SeguimientoDiarioCard";
import type { ConceptoGastosDB } from "@/types/conceptosGastos";

describe("SeguimientoDiarioCard", () => {
  const gastoStefy: ConceptoGastosDB = {
    _id: "gasto-stefy-1",
    sub: "user-123",
    periodo: "2026-11",
    monto: 300000,
    pagado: false,
    id_fuente_gasto: {
      _id: "fuente-stefy",
      sub: "user-123",
      nombre: "Stefy",
      color: "#ec4899",
      seguimiento_diario: true,
      updatedAt: "2026-11-01T00:00:00Z",
    },
  };

  it("renderiza el nombre de la fuente, el cálculo de lo que debería quedar hoy y el gasto diario", () => {
    // 10 de noviembre de 2026 (mes de 30 días, día 10, restan 21 días)
    const refDate = new Date(2026, 10, 10);

    render(
      <SeguimientoDiarioCard
        gasto={gastoStefy}
        periodo="2026-11"
        referenceDate={refDate}
      />
    );

    expect(screen.getByText("Stefy")).toBeInTheDocument();
    expect(screen.getByText("Seguimiento diario")).toBeInTheDocument();
    expect(screen.getByText("Debería quedarte hoy")).toBeInTheDocument();

    // 300.000 * 21 / 30 = 210.000
    expect(screen.getByText(/210\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Gasto diario recomendado:.*10\.000.*21 días restantes/)).toBeInTheDocument();
    expect(screen.getByText(/Día 10 de 30/)).toBeInTheDocument();
    expect(screen.getByText(/33% del mes/)).toBeInTheDocument();
  });

  it("calcula correctamente el monto cuando el gasto está expresado en porcentaje", () => {
    const gastoPorcentaje: ConceptoGastosDB = {
      ...gastoStefy,
      monto: undefined,
      porcentaje_total: 10, // 10% de 2.000.000 = 200.000
    };
    const refDate = new Date(2026, 10, 10);

    render(
      <SeguimientoDiarioCard
        gasto={gastoPorcentaje}
        periodo="2026-11"
        ingresosTotalesDelMes={2000000}
        referenceDate={refDate}
      />
    );

    // 200.000 * 21 / 30 = 140.000
    expect(screen.getByText(/140\.000/)).toBeInTheDocument();
  });
});
