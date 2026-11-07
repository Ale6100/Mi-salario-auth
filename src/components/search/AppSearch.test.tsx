// src\components\search\AppSearch.test.tsx

import { AppSearch } from "./AppSearch";
import { BrowserRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

// Mock de Auth0
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    user: { sub: "auth0|123", name: "Test User" },
    logout: vi.fn(),
    getAccessTokenSilently: vi.fn().mockResolvedValue("fake-token"),
  }),
}));

// Mock de hooks de fuentes
vi.mock("@/hooks/useFuentesGastos", () => ({
  useFuentesGastos: () => ({
    data: [{ _id: "fg1", nombre: "Supermercado" }],
  }),
}));

vi.mock("@/hooks/useFuentesIngresos", () => ({
  useFuentesIngresos: () => ({
    data: [{ _id: "fi1", nombre: "Sueldo principal" }],
  }),
}));

// Mock de utilThemeProvider
vi.mock("@/context/utilThemeProvider", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

describe("AppSearch", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renderiza el diálogo cuando open es true con input enfocado", () => {
    const onOpenChange = vi.fn();

    render(
      <BrowserRouter>
        <AppSearch open={true} onOpenChange={onOpenChange} />
      </BrowserRouter>
    );

    const input = screen.getByRole("combobox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", expect.stringContaining("¿Qué querés hacer?"));

    // Debe listar entradas iniciales
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getAllByText("Gastos")[0]).toBeInTheDocument();
    expect(screen.getByText("Cargar nuevo gasto")).toBeInTheDocument();
  });

  it("filtra opciones dinámicamente al escribir en el input", () => {
    const onOpenChange = vi.fn();

    render(
      <BrowserRouter>
        <AppSearch open={true} onOpenChange={onOpenChange} />
      </BrowserRouter>
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "fondo" } });

    expect(screen.getAllByText("Fondo de emergencia").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("muestra mensaje vacío amigable cuando ninguna opción coincide", () => {
    const onOpenChange = vi.fn();

    render(
      <BrowserRouter>
        <AppSearch open={true} onOpenChange={onOpenChange} />
      </BrowserRouter>
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "termino-inexistente-xyz" } });

    expect(
      screen.getByText(/No hay pantallas ni acciones que coincidan/i)
    ).toBeInTheDocument();
  });

  it("permite navegar con flechas del teclado y seleccionar con Enter", () => {
    const onOpenChange = vi.fn();

    render(
      <BrowserRouter>
        <AppSearch open={true} onOpenChange={onOpenChange} />
      </BrowserRouter>
    );

    const input = screen.getByRole("combobox");

    // Primera opción seleccionada por defecto (Dashboard)
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");

    // Bajar a la segunda opción
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(options[1]).toHaveAttribute("aria-selected", "true");

    // Presionar Enter para seleccionar y cerrar
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("cierra el diálogo al presionar Escape", () => {
    const onOpenChange = vi.fn();

    render(
      <BrowserRouter>
        <AppSearch open={true} onOpenChange={onOpenChange} />
      </BrowserRouter>
    );

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
