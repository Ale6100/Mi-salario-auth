import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExpensesPage } from "./Page";
import { format } from "date-fns";
import type { ConceptoGastosDB } from "@/types/conceptosGastos";

const { useConceptosIngresos, useConceptosGastos, useFuentesGastos } = vi.hoisted(() => ({
  useConceptosIngresos: vi.fn(),
  useConceptosGastos: vi.fn(),
  useFuentesGastos: vi.fn(),
}));

vi.mock("@/hooks/useConceptosIngresos", () => ({ useConceptosIngresos }));
vi.mock("@/hooks/useConceptosGastos", () => ({ useConceptosGastos }));
vi.mock("@/hooks/useFuentesGastos", () => ({ useFuentesGastos }));

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

const renderExpensesPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ExpensesPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("ExpensesPage - Seguimiento diario", () => {
  it("muestra la tarjeta destacada de seguimiento diario si hay un gasto con seguimiento_diario", () => {
    useConceptosIngresos.mockReturnValue({
      data: [{ _id: "ing-1", sub: "user-123", nombre: "Sueldo", valor: 1000000, periodo: currentPeriod }],
      isPending: false,
      isLoadingError: false,
    });
    useConceptosGastos.mockReturnValue({
      data: [gastoStefy],
      isPending: false,
      isFetching: false,
      isLoadingError: false,
    });
    useFuentesGastos.mockReturnValue({
      data: [gastoStefy.id_fuente_gasto],
      isPending: false,
      isFetching: false,
      isLoadingError: false,
    });

    renderExpensesPage();

    expect(screen.getByRole("heading", { name: "Seguimiento diario" })).toBeInTheDocument();
    expect(screen.getAllByText("Stefy").length).toBeGreaterThan(0);
    expect(screen.getByText("Debería quedarte hoy")).toBeInTheDocument();
    expect(screen.getByText(/Gasto diario recomendado:/)).toBeInTheDocument();
  });

  it("no muestra la sección si no hay gastos con seguimiento_diario en el período", () => {
    useConceptosIngresos.mockReturnValue({
      data: [{ _id: "ing-1", sub: "user-123", nombre: "Sueldo", valor: 1000000, periodo: currentPeriod }],
      isPending: false,
      isLoadingError: false,
    });
    useConceptosGastos.mockReturnValue({
      data: [
        {
          _id: "gasto-normal",
          sub: "user-123",
          periodo: currentPeriod,
          monto: 25000,
          pagado: true,
          id_fuente_gasto: {
            _id: "fuente-normal",
            sub: "user-123",
            nombre: "Luz",
            color: "#eab308",
            seguimiento_diario: false,
            updatedAt: "2026-11-01T00:00:00Z",
          },
        },
      ],
      isPending: false,
      isFetching: false,
      isLoadingError: false,
    });
    useFuentesGastos.mockReturnValue({
      data: [],
      isPending: false,
      isFetching: false,
      isLoadingError: false,
    });

    renderExpensesPage();

    expect(screen.queryByRole("heading", { name: "Seguimiento diario" })).not.toBeInTheDocument();
  });
});
