import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardPage } from "./Page";
import { format } from "date-fns";
import type { ConceptoGastosDB } from "@/types/conceptosGastos";

const { useConceptosIngresos, useConceptosGastos, useFondoEmergencia, usePatchSaldoReal } = vi.hoisted(() => ({
  useConceptosIngresos: vi.fn(),
  useConceptosGastos: vi.fn(),
  useFondoEmergencia: vi.fn(),
  usePatchSaldoReal: vi.fn(),
}));

vi.mock("@/hooks/useConceptosIngresos", () => ({ useConceptosIngresos }));
vi.mock("@/hooks/useConceptosGastos", () => ({ useConceptosGastos }));
vi.mock("@/hooks/useFondoEmergencia", () => ({ useFondoEmergencia }));
vi.mock("@/hooks/usePatchSaldoReal", () => ({ usePatchSaldoReal }));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    user: { sub: "user-123" },
    getAccessTokenSilently: () => Promise.resolve("token"),
  }),
}));

const currentPeriod = format(new Date(), "yyyy-MM");

const gastoStefy: ConceptoGastosDB = {
  _id: "gasto-stefy",
  sub: "user-123",
  periodo: currentPeriod,
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

const renderDashboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("DashboardPage - Seguimiento diario", () => {
  it("muestra la tarjeta de seguimiento diario cuando existe un gasto con seguimiento_diario", () => {
    useConceptosIngresos.mockReturnValue({
      data: [{ _id: "ing-1", sub: "user-123", nombre: "Sueldo", valor: 1000000, periodo: currentPeriod }],
      isPending: false,
      isLoadingError: false,
    });
    useConceptosGastos.mockReturnValue({
      data: [gastoStefy],
      isPending: false,
      isLoadingError: false,
    });
    useFondoEmergencia.mockReturnValue({
      data: null,
      isPending: false,
      isLoadingError: false,
    });
    usePatchSaldoReal.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });

    renderDashboard();

    expect(screen.getByText("Seguimiento diario de gastos")).toBeInTheDocument();
    expect(screen.getByText("Stefy")).toBeInTheDocument();
    expect(screen.getAllByText("Debería quedarte hoy").length).toBeGreaterThan(0);
  });

  it("no muestra la sección de seguimiento diario si ningún gasto tiene seguimiento_diario", () => {
    useConceptosIngresos.mockReturnValue({
      data: [{ _id: "ing-1", sub: "user-123", nombre: "Sueldo", valor: 1000000, periodo: currentPeriod }],
      isPending: false,
      isLoadingError: false,
    });
    useConceptosGastos.mockReturnValue({
      data: [
        {
          _id: "gasto-comun",
          sub: "user-123",
          periodo: currentPeriod,
          monto: 50000,
          pagado: true,
          id_fuente_gasto: {
            _id: "fuente-comun",
            sub: "user-123",
            nombre: "Supermercado",
            color: "#3b82f6",
            seguimiento_diario: false,
            updatedAt: "2026-11-01T00:00:00Z",
          },
        },
      ],
      isPending: false,
      isLoadingError: false,
    });
    useFondoEmergencia.mockReturnValue({
      data: null,
      isPending: false,
      isLoadingError: false,
    });
    usePatchSaldoReal.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });

    renderDashboard();

    expect(screen.queryByText("Seguimiento diario de gastos")).not.toBeInTheDocument();
  });
});
