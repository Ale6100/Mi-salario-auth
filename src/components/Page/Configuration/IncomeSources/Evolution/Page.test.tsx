// src\components\Page\Configuration\IncomeSources\Evolution\Page.test.tsx

import { describe, expect, it, vi, beforeEach } from "vitest";
import { IncomeSourceEvolutionPage } from "./Page";
import { MemoryRouter, Route, Routes } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FuenteIngresosDB } from "@/types/fuentesIngresos";
import type { ConceptoIngresosDB } from "@/types/conceptosIngresos";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const { useFuentesIngresos, useConceptosIngresos, mockNavigate } = vi.hoisted(() => ({
  useFuentesIngresos: vi.fn(),
  useConceptosIngresos: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock("@/hooks/useFuentesIngresos", () => ({ useFuentesIngresos }));
vi.mock("@/hooks/useConceptosIngresos", () => ({ useConceptosIngresos }));

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

const mockFuente: FuenteIngresosDB = {
  _id: "fuente-ing-1",
  nombre: "Sueldo Principal",
  color: "#10b981",
  activo: true,
  aguinaldo: true,
  sub: "auth0|usuario",
};

const mockIngresos: ConceptoIngresosDB[] = [
  {
    _id: "ing-1",
    sub: "auth0|usuario",
    id_fuente_ingreso: mockFuente,
    periodo: "2026-05",
    valor: 800000,
  },
  {
    _id: "ing-2",
    sub: "auth0|usuario",
    id_fuente_ingreso: mockFuente,
    periodo: "2026-06",
    valor: 900000,
  },
];

const renderComponent = (sourceId = "fuente-ing-1") => {
  return render(
    <MemoryRouter initialEntries={[`/configuration/income-sources/${sourceId}`]}>
      <Routes>
        <Route
          path="/configuration/income-sources/:id"
          element={<IncomeSourceEvolutionPage />}
        />
      </Routes>
    </MemoryRouter>
  );
};

describe("IncomeSourceEvolutionPage", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    vi.clearAllMocks();
  });

  it("muestra el mensaje de fuente no encontrada si el id no existe", () => {
    useFuentesIngresos.mockReturnValue({ data: [mockFuente], isPending: false, isLoadingError: false });
    useConceptosIngresos.mockReturnValue({ data: [], isPending: false, isLoadingError: false });

    renderComponent("id-inexistente");

    expect(screen.getByText("Fuente de ingreso no encontrada")).toBeInTheDocument();
  });

  it("muestra estado vacío si la fuente no tiene ingresos registrados", () => {
    useFuentesIngresos.mockReturnValue({ data: [mockFuente], isPending: false, isLoadingError: false });
    useConceptosIngresos.mockReturnValue({ data: [], isPending: false, isLoadingError: false });

    renderComponent("fuente-ing-1");

    expect(screen.getByRole("heading", { name: "Sueldo Principal" })).toBeInTheDocument();
    expect(screen.getByText("Sin ingresos registrados")).toBeInTheDocument();
  });

  it("muestra estadísticas, métricas y tabla cuando existen ingresos registrados", () => {
    useFuentesIngresos.mockReturnValue({ data: [mockFuente], isPending: false, isLoadingError: false });
    useConceptosIngresos.mockReturnValue({ data: mockIngresos, isPending: false, isLoadingError: false });

    renderComponent("fuente-ing-1");

    expect(screen.getByRole("heading", { name: "Sueldo Principal" })).toBeInTheDocument();
    expect(screen.getByText("Aguinaldo")).toBeInTheDocument();
    expect(screen.getByText("2 meses registrados")).toBeInTheDocument();

    expect(screen.getByText("Último ingreso")).toBeInTheDocument();
    expect(screen.getByText("Promedio mensual")).toBeInTheDocument();
    expect(screen.getByText("Ingreso máximo")).toBeInTheDocument();
    expect(screen.queryByText("Total acumulado")).not.toBeInTheDocument();

    expect(screen.getAllByText("+12.5%")).toHaveLength(2);
  });

  it("permite navegar de regreso al hacer click en el botón de volver", async () => {
    const user = userEvent.setup();
    useFuentesIngresos.mockReturnValue({ data: [mockFuente], isPending: false, isLoadingError: false });
    useConceptosIngresos.mockReturnValue({ data: mockIngresos, isPending: false, isLoadingError: false });

    renderComponent("fuente-ing-1");

    const backButton = screen.getByRole("button", { name: /Volver a fuentes de ingresos/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/configuration/income-sources");
  });

  it("rellena meses vacíos con valor 0 para mantener el eje X equiespaciado cuando hay saltos temporales", () => {
    const ingresosConSalto: ConceptoIngresosDB[] = [
      {
        _id: "ing-salto-1",
        sub: "auth0|usuario",
        id_fuente_ingreso: mockFuente,
        periodo: "2025-09",
        valor: 100000,
      },
      {
        _id: "ing-salto-2",
        sub: "auth0|usuario",
        id_fuente_ingreso: mockFuente,
        periodo: "2026-10",
        valor: 150000,
      },
    ];

    useFuentesIngresos.mockReturnValue({ data: [mockFuente], isPending: false, isLoadingError: false });
    useConceptosIngresos.mockReturnValue({ data: ingresosConSalto, isPending: false, isLoadingError: false });

    renderComponent("fuente-ing-1");

    expect(screen.getByText("Evolución mensual")).toBeInTheDocument();
  });
});
