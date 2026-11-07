// src\components\ui\FuenteBadge.test.tsx

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FuenteBadge } from "./FuenteBadge";

describe("FuenteBadge", () => {
  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove("dark");
  });

  it("renderiza texto simple '-' si nombre es '-' y no hay color", () => {
    const { container } = render(<FuenteBadge nombre="-" />);
    expect(screen.getByText("-")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="fuente-badge"]')).toBeNull();
  });

  it("renderiza badge solid para un color con buen contraste en tema claro", () => {
    document.documentElement.classList.remove("dark");
    const { container } = render(<FuenteBadge nombre="Alquiler" color="#1e3a8a" />); // Azul oscuro

    const badge = container.querySelector('[data-slot="fuente-badge"]');
    expect(badge).toHaveAttribute("data-variant", "solid");
    expect(badge).toHaveStyle({ backgroundColor: "#1e3a8a", color: "#ffffff" });
    expect(screen.getByText("Alquiler")).toBeInTheDocument();
  });

  it("conmuta automáticamente a subtle si el color contrasta mal en tema claro (amarillo)", () => {
    document.documentElement.classList.remove("dark");
    const { container } = render(<FuenteBadge nombre="Luz" color="#facc15" />);

    const badge = container.querySelector('[data-slot="fuente-badge"]');
    expect(badge).toHaveAttribute("data-variant", "subtle");
    const dot = container.querySelector('[data-slot="fuente-badge-dot"]');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveStyle({ backgroundColor: "#facc15" });
  });

  it("en tema oscuro conmuta a solid para amarillo ya que contrasta con el fondo oscuro", () => {
    document.documentElement.classList.add("dark");
    const { container } = render(<FuenteBadge nombre="Luz" color="#facc15" />);

    const badge = container.querySelector('[data-slot="fuente-badge"]');
    expect(badge).toHaveAttribute("data-variant", "solid");
    expect(badge).toHaveStyle({ color: "#09090b" }); // Texto oscuro sobre fondo amarillo
  });

  it("permite forzar la variante 'subtle' manualmente", () => {
    const { container } = render(<FuenteBadge nombre="Alquiler" color="#1e3a8a" variant="subtle" />);
    const badge = container.querySelector('[data-slot="fuente-badge"]');
    expect(badge).toHaveAttribute("data-variant", "subtle");
    expect(container.querySelector('[data-slot="fuente-badge-dot"]')).toBeInTheDocument();
  });

  it("permite forzar la variante 'solid' manualmente", () => {
    const { container } = render(<FuenteBadge nombre="Luz" color="#facc15" variant="solid" />);
    const badge = container.querySelector('[data-slot="fuente-badge"]');
    expect(badge).toHaveAttribute("data-variant", "solid");
  });

  it("renderiza badge subtle sin dot cuando hay nombre pero sin color", () => {
    const { container } = render(<FuenteBadge nombre="General" />);
    const badge = container.querySelector('[data-slot="fuente-badge"]');
    expect(badge).toHaveAttribute("data-variant", "subtle");
    expect(container.querySelector('[data-slot="fuente-badge-dot"]')).toBeNull();
  });
});
