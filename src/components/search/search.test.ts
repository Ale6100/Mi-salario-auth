// src\components\search\search.test.ts

import { buildSearchEntries, cleanDictatedText, findSearchEntries, normalizeText, type SearchEntry } from "./search";
import { describe, expect, it } from "vitest";
import { LayoutDashboard, Wallet, CreditCard } from "lucide-react";

const testEntries: SearchEntry[] = [
  {
    id: "1",
    kind: "screen",
    label: "Gastos",
    icon: CreditCard,
    section: "Principal",
    to: "/expenses",
    keywords: ["salidas", "pagos", "tarjetas"],
  },
  {
    id: "2",
    kind: "screen",
    label: "Ingresos",
    icon: Wallet,
    section: "Principal",
    to: "/income",
    keywords: ["sueldo", "plata"],
  },
  {
    id: "3",
    kind: "screen",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "Principal",
    to: "/",
    keywords: ["inicio", "resumen"],
  },
];

function labels(found: SearchEntry[]): string[] {
  return found.map((entry) => entry.label);
}

describe("cleanDictatedText", () => {
  it("elimina el punto final agregado automáticamente", () => {
    expect(cleanDictatedText("gastos.")).toBe("gastos");
    expect(cleanDictatedText("nuevo gasto.")).toBe("nuevo gasto");
  });

  it("elimina signos de puntuación iniciales y finales y espacios", () => {
    expect(cleanDictatedText("  ¿fondo de emergencia?  ")).toBe("fondo de emergencia");
    expect(cleanDictatedText(".reportes...")).toBe("reportes");
    expect(cleanDictatedText("ingresos")).toBe("ingresos");
  });
});

describe("normalizeText", () => {
  it("quita tildes y diacríticos y pasa a minúsculas", () => {
    expect(normalizeText("Configuración")).toBe("configuracion");
    expect(normalizeText("  ÁÉÍÓÚñ  ")).toBe("aeioun");
  });
});

describe("findSearchEntries", () => {
  it("devuelve array vacío para query vacía", () => {
    expect(findSearchEntries("", testEntries)).toEqual([]);
    expect(findSearchEntries("   ", testEntries)).toEqual([]);
  });

  it("coincide con parte del label", () => {
    expect(labels(findSearchEntries("gas", testEntries))).toEqual(["Gastos"]);
  });

  it("ignora mayúsculas y acentos", () => {
    expect(labels(findSearchEntries("INGRESOS", testEntries))).toEqual(["Ingresos"]);
    expect(labels(findSearchEntries("ingrésos", testEntries))).toEqual(["Ingresos"]);
  });

  it("coincide por sinónimos o keywords", () => {
    expect(labels(findSearchEntries("tarjeta", testEntries))).toEqual(["Gastos"]);
    expect(labels(findSearchEntries("sueldo", testEntries))).toEqual(["Ingresos"]);
  });

  it("requiere todas las palabras en cualquier orden", () => {
    expect(labels(findSearchEntries("pagos salidas", testEntries))).toEqual(["Gastos"]);
    expect(findSearchEntries("ingresos gastos", testEntries)).toEqual([]);
  });

  it("prioriza coincidencias en la etiqueta sobre la sección o sinónimos", () => {
    const entriesWithSameSection: SearchEntry[] = [
      {
        id: "a",
        kind: "screen",
        label: "Resumen mensual",
        icon: LayoutDashboard,
        section: "Reportes",
        to: "/reports",
        keywords: ["gastos", "graficos"],
      },
      {
        id: "b",
        kind: "screen",
        label: "Gastos",
        icon: CreditCard,
        section: "Principal",
        to: "/expenses",
        keywords: ["pagos"],
      },
    ];

    expect(labels(findSearchEntries("gastos", entriesWithSameSection))).toEqual([
      "Gastos",
      "Resumen mensual",
    ]);
  });
});

describe("buildSearchEntries", () => {
  it("incluye pantallas, acciones y funciones en orden de kind", () => {
    const entries = buildSearchEntries({
      toggleTheme: () => {},
      logout: () => {},
    });

    const kinds = entries.map((entry) => entry.kind);
    const firstAction = kinds.indexOf("action");
    const firstFunction = kinds.indexOf("function");

    expect(firstAction).toBeGreaterThan(0);
    expect(firstFunction).toBeGreaterThan(firstAction);

    expect(kinds.slice(0, firstAction).every((kind) => kind === "screen")).toBe(true);
    expect(kinds.slice(firstAction, firstFunction).every((kind) => kind === "action")).toBe(true);
    expect(kinds.slice(firstFunction).every((kind) => kind === "function")).toBe(true);
  });

  it("incluye fuentes dinámicas cuando se le pasan", () => {
    const entries = buildSearchEntries({
      expenseSources: [{ _id: "exp1", nombre: "Supermercado" }],
      incomeSources: [{ _id: "inc1", nombre: "Freelance" }],
    });

    expect(labels(entries)).toContain("Evolución: Supermercado");
    expect(labels(entries)).toContain("Evolución: Freelance");
  });
});
