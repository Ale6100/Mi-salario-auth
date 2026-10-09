// src\components\Page\EmergencyFund\Page.test.tsx

import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmergencyFundPage } from "./Page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FondoEmergenciaDB } from "@/types/fondoEmergencia";

const { fetchPatchFondoEmergencia, useFondoEmergencia } = vi.hoisted(() => ({
  fetchPatchFondoEmergencia: vi.fn(),
  useFondoEmergencia: vi.fn(),
}));

vi.mock("@/lib/fetch/fondoEmergencia", () => ({ fetchPatchFondoEmergencia }));
vi.mock("@/hooks/useFondoEmergencia", () => ({ useFondoEmergencia }));
vi.mock("@/hooks/useConceptosIngresos", () => ({
  useConceptosIngresos: () => ({ data: [], isPending: false, isLoadingError: false }),
}));
vi.mock("@/hooks/useConceptosGastos", () => ({
  useConceptosGastos: () => ({ data: [], isPending: false, isLoadingError: false }),
}));
vi.mock("@/hooks/useCotizacionDolarMep", () => ({
  useCotizacionDolarMep: () => ({ data: undefined, isError: false }),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({ user: { sub: "auth0|usuario" }, getAccessTokenSilently: () => Promise.resolve("token-de-prueba") }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const fondo: FondoEmergenciaDB = {
  _id: "fe1",
  sub: "auth0|usuario",
  monto_pesos: 500000,
  monto_dolares: 1000,
  incluir_dolares: true,
  porcentaje_total: 50,
  saldo_real: null,
  gastos_adicionales: 0,
};

const mockFondo = (estado: { data: FondoEmergenciaDB | null; isSuccess: boolean; isLoadingError: boolean }) => {
  useFondoEmergencia.mockReturnValue({ ...estado, isPending: false, isFetching: false });
}

const renderPagina = () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <EmergencyFundPage />
    </QueryClientProvider>
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
  fetchPatchFondoEmergencia.mockResolvedValue({ statusCode: 200, data: fondo });
});

describe("EmergencyFundPage", () => {
  it("si falla la carga del fondo, no permite editar ni guardar", () => {
    mockFondo({ data: null, isSuccess: false, isLoadingError: true });
    renderPagina();

    expect(screen.getByText(/No se pudo cargar tu fondo de emergencia/)).toBeInTheDocument();
    expect(screen.getByLabelText("Monto actual del fondo")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
  });

  it("usa 33.33% como porcentaje por defecto si el usuario no tiene fondo", () => {
    mockFondo({ data: null, isSuccess: true, isLoadingError: false });
    renderPagina();

    expect(screen.getByLabelText("Porcentaje destinado al fondo cada mes")).toHaveValue(33.33);
  });

  it("no guarda mientras se escribe, sino al presionar Guardar, enviando todos los campos", async () => {
    mockFondo({ data: fondo, isSuccess: true, isLoadingError: false });
    const user = renderPagina();

    const inputGastosAdicionales = screen.getByLabelText("Gastos adicionales");
    await user.type(inputGastosAdicionales, "1500");

    expect(fetchPatchFondoEmergencia).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(fetchPatchFondoEmergencia).toHaveBeenCalledTimes(1));
    expect(fetchPatchFondoEmergencia).toHaveBeenCalledWith({
      token: "token-de-prueba",
      data: {
        monto_pesos: 500000,
        monto_dolares: 1000,
        incluir_dolares: true,
        porcentaje_total: 50,
        gastos_adicionales: 1500,
      },
    });
  });
});
