// src\components\Page\Expenses\table\DialogAddEditExpense.test.tsx

import { beforeEach, describe, expect, it, vi } from "vitest";
import { DialogAddEditExpense } from "./DialogAddEditExpense";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ConceptoGastosDB } from "@/types/conceptosGastos";
import type { FuenteGastosDB } from "@/types/fuentesGastos";

const { fetchPutConceptoGastos } = vi.hoisted(() => ({
  fetchPutConceptoGastos: vi.fn(),
}));

vi.mock("@/lib/fetch/conceptosGastos", () => ({
  fetchPutConceptoGastos,
  fetchPostConceptoGastos: vi.fn(),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({ user: { sub: "auth0|usuario" }, getAccessTokenSilently: () => Promise.resolve("token-de-prueba") }),
}));

vi.mock("sonner", () => ({
  toast: { loading: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

const fuente: FuenteGastosDB = { _id: "f1", sub: "auth0|usuario", nombre: "Alquiler", color: "#ff0000", updatedAt: "2026-01-01T00:00:00.000Z" };

const crearGasto = (valores: Pick<ConceptoGastosDB, "monto" | "porcentaje_total">): ConceptoGastosDB => ({
  _id: "g1",
  id_fuente_gasto: fuente,
  sub: "auth0|usuario",
  periodo: "2026-05",
  pagado: false,
  ...valores,
});

const renderDialogo = (expense: ConceptoGastosDB) => {
  render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>
        <DialogAddEditExpense
          isOpen={{ status: true, expense }}
          setIsOpen={vi.fn()}
          actualExpenses={[expense]}
          fuentesData={[fuente]}
        />
      </QueryClientProvider>
    </MemoryRouter>
  );

  return userEvent.setup();
}

// jsdom no implementa ResizeObserver y el Switch de Radix lo usa para medir el control.
class ResizeObserverStub {
  observe() { /* jsdom no mide layout */ }
  unobserve() { /* jsdom no mide layout */ }
  disconnect() { /* jsdom no mide layout */ }
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  fetchPutConceptoGastos.mockResolvedValue({ statusCode: 200 });
});

describe("DialogAddEditExpense al editar", () => {
  it("al pasar un gasto de monto a porcentaje envía monto: -1", async () => {
    const user = renderDialogo(crearGasto({ monto: 500, porcentaje_total: -1 }));

    await user.click(screen.getByRole("switch", { name: "Estimar como porcentaje de ingresos" }));
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(fetchPutConceptoGastos).toHaveBeenCalledExactlyOnceWith({
      token: "token-de-prueba",
      id: "g1",
      data: { id_fuente_gasto: "f1", periodo: "2026-05", monto: -1, porcentaje_total: 1 },
    }));
  });

  it("al pasar un gasto de porcentaje a monto envía porcentaje_total: -1", async () => {
    const user = renderDialogo(crearGasto({ monto: -1, porcentaje_total: 10 }));

    await user.click(screen.getByRole("switch", { name: "Estimar como porcentaje de ingresos" }));
    await user.type(screen.getByPlaceholderText("0.00"), "750");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(fetchPutConceptoGastos).toHaveBeenCalledExactlyOnceWith({
      token: "token-de-prueba",
      id: "g1",
      data: { id_fuente_gasto: "f1", periodo: "2026-05", monto: 750, porcentaje_total: -1 },
    }));
  });
});
