// src\components\Page\Configuration\ExpenseSources\Evolution\Page.test.tsx

import { describe, expect, it, vi, beforeEach } from "vitest";
import { ExpenseSourceEvolutionPage } from "./Page";
import { MemoryRouter, Route, Routes } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FuenteGastosDB } from "@/types/fuentesGastos";
import type { ConceptoGastosDB } from "@/types/conceptosGastos";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const { useFuentesGastos, useConceptosGastos, mockNavigate } = vi.hoisted(() => ({
  useFuentesGastos: vi.fn(),
  useConceptosGastos: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock("@/hooks/useFuentesGastos", () => ({ useFuentesGastos }));
vi.mock("@/hooks/useConceptosGastos", () => ({ useConceptosGastos }));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({ user: { sub: "auth0|usuario" }, getAccessTokenSilently: () => Promise.resolve("token") }),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockFuente: FuenteGastosDB = {
  _id: "fuente-1",
  nombre: "Tarjeta Visa",
  color: "#f43f5e",
  es_indispensable: true,
  sub: "auth0|usuario",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

const mockGastos: ConceptoGastosDB[] = [
  {
    _id: "gasto-1",
    sub: "auth0|usuario",
    id_fuente_gasto: mockFuente,
    periodo: "2026-05",
    monto: 10000,
    pagado: true,
    aclaracion: "Cuota 1/3",
  },
  {
    _id: "gasto-2",
    sub: "auth0|usuario",
    id_fuente_gasto: mockFuente,
    periodo: "2026-06",
    monto: 12000,
    pagado: false,
    aclaracion: "Cuota 2/3",
  },
];

const renderComponent = (sourceId = "fuente-1") => {
  return render(
    <MemoryRouter initialEntries={[`/configuration/expense-sources/${sourceId}`]}>
      <Routes>
        <Route
          path="/configuration/expense-sources/:id"
          element={<ExpenseSourceEvolutionPage />}
        />
      </Routes>
    </MemoryRouter>
  );
};

describe("ExpenseSourceEvolutionPage", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    vi.clearAllMocks();
  });

  it("muestra el mensaje de fuente no encontrada si el id no existe", () => {
    useFuentesGastos.mockReturnValue({ data: [mockFuente], isPending: false, isLoadingError: false });
    useConceptosGastos.mockReturnValue({ data: [], isPending: false, isLoadingError: false });

    renderComponent("id-inexistente");

    expect(screen.getByText("Fuente de gasto no encontrada")).toBeInTheDocument();
  });

  it("muestra estado vacío si la fuente no tiene gastos registrados", () => {
    useFuentesGastos.mockReturnValue({ data: [mockFuente], isPending: false, isLoadingError: false });
    useConceptosGastos.mockReturnValue({ data: [], isPending: false, isLoadingError: false });

    renderComponent("fuente-1");

    expect(screen.getByRole("heading", { name: "Tarjeta Visa" })).toBeInTheDocument();
    expect(screen.getByText("Sin gastos registrados")).toBeInTheDocument();
  });

  it("muestra estadísticas, métricas y tabla cuando existen gastos registrados", () => {
    useFuentesGastos.mockReturnValue({ data: [mockFuente], isPending: false, isLoadingError: false });
    useConceptosGastos.mockReturnValue({ data: mockGastos, isPending: false, isLoadingError: false });

    renderComponent("fuente-1");

    expect(screen.getByRole("heading", { name: "Tarjeta Visa" })).toBeInTheDocument();
    expect(screen.getByText("Indispensable")).toBeInTheDocument();
    expect(screen.getByText("2 meses registrados")).toBeInTheDocument();

    expect(screen.getByText("Último gasto")).toBeInTheDocument();
    expect(screen.getByText("Promedio mensual")).toBeInTheDocument();
    expect(screen.getByText("Gasto máximo")).toBeInTheDocument();
    expect(screen.queryByText("Total acumulado")).not.toBeInTheDocument();

    expect(screen.getByText("Cuota 1/3")).toBeInTheDocument();
    expect(screen.getByText("Cuota 2/3")).toBeInTheDocument();
  });

  it("permite navegar de regreso al hacer click en el botón de volver", async () => {
    const user = userEvent.setup();
    useFuentesGastos.mockReturnValue({ data: [mockFuente], isPending: false, isLoadingError: false });
    useConceptosGastos.mockReturnValue({ data: mockGastos, isPending: false, isLoadingError: false });

    renderComponent("fuente-1");

    const backButton = screen.getByRole("button", { name: /Volver a fuentes de gastos/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/configuration/expense-sources");
  });

  it("rellena meses vacíos con valor 0 para mantener el eje X equiespaciado cuando hay saltos temporales", () => {
    const gastosConSalto: ConceptoGastosDB[] = [
      {
        _id: "gasto-salto-1",
        sub: "auth0|usuario",
        id_fuente_gasto: mockFuente,
        periodo: "2025-09",
        monto: 15000,
        pagado: true,
      },
      {
        _id: "gasto-salto-2",
        sub: "auth0|usuario",
        id_fuente_gasto: mockFuente,
        periodo: "2026-10",
        monto: 25000,
        pagado: true,
      },
    ];

    useFuentesGastos.mockReturnValue({ data: [mockFuente], isPending: false, isLoadingError: false });
    useConceptosGastos.mockReturnValue({ data: gastosConSalto, isPending: false, isLoadingError: false });

    renderComponent("fuente-1");

    expect(screen.getByText("Evolución mensual")).toBeInTheDocument();
  });
});
