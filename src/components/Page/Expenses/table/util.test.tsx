// src\components\Page\Expenses\table\util.test.tsx

import { describe, expect, it } from "vitest";
import { formSchema, type FormSchema } from "./util";

const base: FormSchema = {
  fuente_gasto: "fuente-1",
  periodo: "2026-05",
};

const erroresEn = (data: FormSchema) => {
  const result = formSchema.safeParse(data);
  return result.success ? [] : result.error.issues.map(issue => issue.path.join("."));
}

describe("formSchema de gastos", () => {
  it("exige fuente y período", () => {
    expect(erroresEn({ ...base, fuente_gasto: "  ", periodo: "", monto: "10" })).toEqual(["fuente_gasto", "periodo"]);
  });

  describe("en modo monto", () => {
    it("acepta montos mayores o iguales a 0", () => {
      expect(erroresEn({ ...base, monto: "0" })).toEqual([]);
      expect(erroresEn({ ...base, monto: "1500.50" })).toEqual([]);
    });

    it("rechaza montos negativos, vacíos o no numéricos", () => {
      expect(erroresEn({ ...base, monto: "-1" })).toEqual(["monto"]);
      expect(erroresEn({ ...base, monto: "" })).toEqual(["monto"]);
      expect(erroresEn({ ...base })).toEqual(["monto"]);
      expect(erroresEn({ ...base, monto: "abc" })).toEqual(["monto"]);
    });

    it("no valida el porcentaje", () => {
      expect(erroresEn({ ...base, monto: "10", porcentaje: "500" })).toEqual([]);
    });
  });

  describe("en modo porcentaje", () => {
    it("acepta porcentajes entre 0 y 100 inclusive", () => {
      expect(erroresEn({ ...base, modo_porcentaje: true, porcentaje: "0" })).toEqual([]);
      expect(erroresEn({ ...base, modo_porcentaje: true, porcentaje: "100" })).toEqual([]);
      expect(erroresEn({ ...base, modo_porcentaje: true, porcentaje: "12.5" })).toEqual([]);
    });

    it("usa 1% por defecto", () => {
      const result = formSchema.parse({ ...base, modo_porcentaje: true });
      expect(result.porcentaje).toBe("1");
    });

    it("rechaza porcentajes fuera de rango o no numéricos", () => {
      expect(erroresEn({ ...base, modo_porcentaje: true, porcentaje: "-0.1" })).toEqual(["porcentaje"]);
      expect(erroresEn({ ...base, modo_porcentaje: true, porcentaje: "100.1" })).toEqual(["porcentaje"]);
      expect(erroresEn({ ...base, modo_porcentaje: true, porcentaje: "" })).toEqual(["porcentaje"]);
    });

    it("no exige monto", () => {
      expect(erroresEn({ ...base, modo_porcentaje: true, monto: "" })).toEqual([]);
    });
  });
});
