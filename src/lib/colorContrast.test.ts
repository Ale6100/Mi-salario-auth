// src\lib\colorContrast.test.ts

import { describe, expect, it } from "vitest";
import {
  blendWithBackground,
  getBestContrastingTextColor,
  getContrastRatio,
  getRelativeLuminance,
  MIN_SURFACE_CONTRAST_RATIO,
  parseHexColor,
  resolveFuenteBadgeVariant,
} from "./colorContrast";

describe("colorContrast utils", () => {
  describe("parseHexColor", () => {
    it("parsea formatos de 3, 4, 6 y 8 caracteres", () => {
      expect(parseHexColor("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
      expect(parseHexColor("#f008")).toEqual({ r: 255, g: 0, b: 0, a: 8 / 15 });
      expect(parseHexColor("#3b82f6")).toEqual({ r: 59, g: 130, b: 246, a: 1 });
      expect(parseHexColor("3b82f6")).toEqual({ r: 59, g: 130, b: 246, a: 1 });
      expect(parseHexColor("#3b82f680")).toEqual({
        r: 59,
        g: 130,
        b: 246,
        a: 128 / 255,
      });
    });

    it("retorna null si el formato es inválido", () => {
      expect(parseHexColor("")).toBeNull();
      expect(parseHexColor("invalid")).toBeNull();
      expect(parseHexColor("#12")).toBeNull();
      expect(parseHexColor("#12345")).toBeNull();
    });
  });

  describe("blendWithBackground", () => {
    it("mantiene el color si el canal alfa es 1", () => {
      const fg = { r: 255, g: 0, b: 0, a: 1 };
      const bg = { r: 255, g: 255, b: 255 };
      expect(blendWithBackground(fg, bg)).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("mezcla correctamente con opacidad del 50%", () => {
      const fg = { r: 0, g: 0, b: 0, a: 0.5 };
      const bg = { r: 255, g: 255, b: 255 };
      const blended = blendWithBackground(fg, bg);
      expect(blended.r).toBe(128);
      expect(blended.g).toBe(128);
      expect(blended.b).toBe(128);
    });
  });

  describe("getRelativeLuminance & getContrastRatio", () => {
    it("calcula luminancia correcta para blanco y negro puros", () => {
      expect(getRelativeLuminance(255, 255, 255)).toBeCloseTo(1.0, 4);
      expect(getRelativeLuminance(0, 0, 0)).toBe(0);
    });

    it("ratio blanco vs negro es 21:1", () => {
      const lumWhite = getRelativeLuminance(255, 255, 255);
      const lumBlack = getRelativeLuminance(0, 0, 0);
      expect(getContrastRatio(lumWhite, lumBlack)).toBe(21);
    });
  });

  describe("getBestContrastingTextColor", () => {
    it("elige texto negro para fondos claros y texto blanco para fondos oscuros", () => {
      expect(getBestContrastingTextColor("#ffffff")).toBe("#09090b");
      expect(getBestContrastingTextColor("#facc15")).toBe("#09090b"); // amarillo
      expect(getBestContrastingTextColor("#000000")).toBe("#ffffff");
      expect(getBestContrastingTextColor("#1e3a8a")).toBe("#ffffff"); // azul oscuro
    });
  });

  describe("resolveFuenteBadgeVariant", () => {
    it("retorna subtle si no hay color o si es inválido", () => {
      expect(resolveFuenteBadgeVariant(undefined, false)).toMatchObject({ style: "subtle" });
      expect(resolveFuenteBadgeVariant("", true)).toMatchObject({ style: "subtle" });
      expect(resolveFuenteBadgeVariant("not-a-color", false)).toMatchObject({ style: "subtle" });
    });

    it("en tema claro, amarillo (#facc15) contrasta mal con fondo blanco y usa badge subtle", () => {
      const result = resolveFuenteBadgeVariant("#facc15", false);
      expect(result.style).toBe("subtle");
      expect(result.surfaceContrastRatio).toBeLessThan(MIN_SURFACE_CONTRAST_RATIO);
    });

    it("en tema oscuro, amarillo (#facc15) contrasta excelente y usa badge solid con texto oscuro", () => {
      const result = resolveFuenteBadgeVariant("#facc15", true);
      expect(result.style).toBe("solid");
      expect(result.surfaceContrastRatio).toBeGreaterThanOrEqual(MIN_SURFACE_CONTRAST_RATIO);
      expect(result.textColor).toBe("#09090b");
    });

    it("en tema oscuro, negro (#000000) o azul marino (#0f172a) se confunde con el fondo y usa subtle", () => {
      const resultBlack = resolveFuenteBadgeVariant("#000000", true);
      expect(resultBlack.style).toBe("subtle");

      const resultNavy = resolveFuenteBadgeVariant("#0f172a", true);
      expect(resultNavy.style).toBe("subtle");
    });

    it("en tema claro, negro (#000000) o azul oscuro (#1e3a8a) usa badge solid con texto blanco", () => {
      const result = resolveFuenteBadgeVariant("#000000", false);
      expect(result.style).toBe("solid");
      expect(result.textColor).toBe("#ffffff");
    });

    it("colores con opacidad muy baja (< 20%) conmutan automáticamente a subtle para evitar fundirse", () => {
      // Azul con 10% de opacidad sobre fondo blanco (#3b82f61a)
      const result = resolveFuenteBadgeVariant("#3b82f61a", false);
      expect(result.style).toBe("subtle");
    });
  });
});
