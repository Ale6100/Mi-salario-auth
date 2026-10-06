// src\components\table\CopyPreviousMonthButton.test.tsx

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyPreviousMonthButton } from "./CopyPreviousMonthButton";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import type { ResponseBackend } from "@/types/global";

const { getAccessTokenSilently, toast } = vi.hoisted(() => ({
  getAccessTokenSilently: vi.fn(),
  toast: { loading: vi.fn(), error: vi.fn(), info: vi.fn(), success: vi.fn() },
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({ getAccessTokenSilently }),
}));

vi.mock("sonner", () => ({ toast }));

const TOKEN = "token-de-prueba";
const QUERY_KEY = "conceptos-gastos";

const renderBoton = (respuesta: ResponseBackend<unknown[]>) => {
  const copiar = vi.fn<ComponentProps<typeof CopyPreviousMonthButton>["copiar"]>().mockResolvedValue(respuesta);
  const queryClient = new QueryClient();
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

  render(
    <QueryClientProvider client={queryClient}>
      <CopyPreviousMonthButton concepto="gastos" queryKey={QUERY_KEY} copiar={copiar} />
    </QueryClientProvider>
  );

  return { copiar, invalidateQueries, user: userEvent.setup() };
}

const abrirDialogo = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Copiar mes anterior" }));
  return screen.findByRole("alertdialog");
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 0, 15));
  getAccessTokenSilently.mockResolvedValue(TOKEN);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("CopyPreviousMonthButton", () => {
  it("abre el diálogo con el mes actual como destino y el anterior como origen", async () => {
    const { user } = renderBoton({ statusCode: 201, data: [] });

    const dialogo = await abrirDialogo(user);

    expect(screen.getByLabelText("Mes destino")).toHaveValue("2026-01");
    expect(dialogo).toHaveTextContent("Se copiarán los gastos de Diciembre 2025 a Enero 2026.");
    expect(dialogo).toHaveTextContent("Los gastos copiados quedan como no pagados.");
  });

  it("actualiza el texto al cambiar el mes destino", async () => {
    const { user } = renderBoton({ statusCode: 201, data: [] });

    const dialogo = await abrirDialogo(user);
    fireEvent.change(screen.getByLabelText("Mes destino"), { target: { value: "2026-03" } });

    expect(dialogo).toHaveTextContent("Se copiarán los gastos de Febrero 2026 a Marzo 2026.");
  });

  it("al confirmar copia al mes destino, invalida la query y avisa cuántos conceptos se copiaron", async () => {
    const { user, copiar, invalidateQueries } = renderBoton({ statusCode: 201, data: [{}, {}] });

    await abrirDialogo(user);
    await user.click(screen.getByRole("button", { name: "Copiar" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Se copiaron 2 conceptos a Enero 2026", expect.anything()));
    expect(copiar).toHaveBeenCalledExactlyOnceWith({ token: TOKEN, periodoDestino: "2026-01" });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERY_KEY] });
  });

  it("avisa con toast.info cuando no había conceptos nuevos para copiar", async () => {
    const { user, invalidateQueries } = renderBoton({ statusCode: 201, data: [] });

    await abrirDialogo(user);
    await user.click(screen.getByRole("button", { name: "Copiar" }));

    await waitFor(() => expect(toast.info).toHaveBeenCalledWith("No había gastos nuevos para copiar desde Diciembre 2025", expect.anything()));
    expect(toast.success).not.toHaveBeenCalled();
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERY_KEY] });
  });

  it("muestra un error y no invalida la query si el backend falla", async () => {
    const { user, invalidateQueries } = renderBoton({ statusCode: 500, message: "Error" });

    await abrirDialogo(user);
    await user.click(screen.getByRole("button", { name: "Copiar" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Error al copiar los gastos", expect.anything()));
    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it("con un mes destino inválido oculta el texto, deja cancelar y no copia", async () => {
    const { user, copiar } = renderBoton({ statusCode: 201, data: [] });

    const dialogo = await abrirDialogo(user);
    fireEvent.change(screen.getByLabelText("Mes destino"), { target: { value: "" } });

    expect(dialogo).not.toHaveTextContent("Se copiarán");
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Copiar" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Elegí un mes destino válido", expect.anything()));
    expect(copiar).not.toHaveBeenCalled();
  });

  it("si la llamada falla por red muestra un error en vez de quedar cargando", async () => {
    const { user, copiar, invalidateQueries } = renderBoton({ statusCode: 201, data: [] });
    copiar.mockRejectedValue(new TypeError("Failed to fetch"));

    await abrirDialogo(user);
    await user.click(screen.getByRole("button", { name: "Copiar" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Error al copiar los gastos", expect.anything()));
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
