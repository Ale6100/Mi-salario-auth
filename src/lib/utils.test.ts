// src\lib\utils.test.ts

import { describe, expect, it } from "vitest";
import { parseMontoIngresado } from "@/lib/utils";

describe("parseMontoIngresado", () => {
  it("interpreta números sin separadores", () => {
    expect(parseMontoIngresado("50000")).toBe(50000);
  });

  it("usa la coma como separador decimal", () => {
    expect(parseMontoIngresado("1234,56")).toBe(1234.56);
    expect(parseMontoIngresado("1.234,56")).toBe(1234.56);
  });

  it("usa el punto como separador decimal cuando no le siguen exactamente 3 dígitos o la parte entera es 0", () => {
    expect(parseMontoIngresado("1234.56")).toBe(1234.56);
    expect(parseMontoIngresado("1234.5")).toBe(1234.5);
    expect(parseMontoIngresado("1,234.56")).toBe(1234.56);
    expect(parseMontoIngresado("0.500")).toBe(0.5);
  });

  it("toma como separador de miles un punto seguido de 3 dígitos o separadores repetidos", () => {
    expect(parseMontoIngresado("50.000")).toBe(50000);
    expect(parseMontoIngresado("1.234.567")).toBe(1234567);
    expect(parseMontoIngresado("1,234,567")).toBe(1234567);
  });

  it("ignora símbolos y espacios", () => {
    expect(parseMontoIngresado("$ 1.234,56")).toBe(1234.56);
  });

  it("redondea a 2 decimales", () => {
    expect(parseMontoIngresado("10,559")).toBe(10.56);
  });

  it("devuelve null si no hay dígitos", () => {
    expect(parseMontoIngresado("")).toBeNull();
    expect(parseMontoIngresado("abc")).toBeNull();
    expect(parseMontoIngresado(".,")).toBeNull();
  });
});
