// src\lib\colorContrast.ts

export interface RgbColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export const SURFACE_LIGHT = "#ffffff";
export const SURFACE_DARK = "#09090b";

export const MIN_SURFACE_CONTRAST_RATIO = 2.2;

export function parseHexColor(hex: string): RgbColor | null {
  if (!hex || typeof hex !== "string") return null;
  const clean = hex.trim().replace(/^#/, "");

  if (clean.length === 3) {
    const r = Number.parseInt(clean[0] + clean[0], 16);
    const g = Number.parseInt(clean[1] + clean[1], 16);
    const b = Number.parseInt(clean[2] + clean[2], 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b, a: 1 };
  }

  if (clean.length === 4) {
    const r = Number.parseInt(clean[0] + clean[0], 16);
    const g = Number.parseInt(clean[1] + clean[1], 16);
    const b = Number.parseInt(clean[2] + clean[2], 16);
    const a = Number.parseInt(clean[3] + clean[3], 16) / 255;
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(a)) return null;
    return { r, g, b, a };
  }

  if (clean.length === 6) {
    const r = Number.parseInt(clean.slice(0, 2), 16);
    const g = Number.parseInt(clean.slice(2, 4), 16);
    const b = Number.parseInt(clean.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b, a: 1 };
  }

  if (clean.length === 8) {
    const r = Number.parseInt(clean.slice(0, 2), 16);
    const g = Number.parseInt(clean.slice(2, 4), 16);
    const b = Number.parseInt(clean.slice(4, 6), 16);
    const a = Number.parseInt(clean.slice(6, 8), 16) / 255;
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(a)) return null;
    return { r, g, b, a };
  }

  return null;
}

export function blendWithBackground(
  fg: RgbColor,
  bg: { r: number; g: number; b: number }
): { r: number; g: number; b: number } {
  const alpha = Math.min(Math.max(fg.a, 0), 1);
  return {
    r: Math.round(alpha * fg.r + (1 - alpha) * bg.r),
    g: Math.round(alpha * fg.g + (1 - alpha) * bg.g),
    b: Math.round(alpha * fg.b + (1 - alpha) * bg.b),
  };
}

export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(lum1: number, lum2: number): number {
  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);
  return (l1 + 0.05) / (l2 + 0.05);
}

export function getBestContrastingTextColor(
  bgColor: { r: number; g: number; b: number } | string
): "#ffffff" | "#09090b" {
  const rgb = typeof bgColor === "string" ? parseHexColor(bgColor) : bgColor;
  if (!rgb) return "#ffffff";

  const lumBg = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
  const contrastWithWhite = getContrastRatio(1.0, lumBg);
  const contrastWithDark = getContrastRatio(lumBg, 0.007);

  return contrastWithWhite >= contrastWithDark ? "#ffffff" : "#09090b";
}

export type FuenteBadgeStyle = "solid" | "subtle";

export interface FuenteBadgeVariantInfo {
  style: FuenteBadgeStyle;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  surfaceContrastRatio: number;
}

export function resolveFuenteBadgeVariant(
  hexColor: string | undefined,
  isDarkMode: boolean
): FuenteBadgeVariantInfo {
  if (!hexColor) {
    return {
      style: "subtle",
      surfaceContrastRatio: 1,
    };
  }

  const parsed = parseHexColor(hexColor);
  if (!parsed) {
    return {
      style: "subtle",
      surfaceContrastRatio: 1,
    };
  }

  const surfaceRgb = isDarkMode ? { r: 9, g: 9, b: 11 } : { r: 255, g: 255, b: 255 };
  const effectiveRgb = blendWithBackground(parsed, surfaceRgb);

  const surfaceLum = getRelativeLuminance(surfaceRgb.r, surfaceRgb.g, surfaceRgb.b);
  const colorLum = getRelativeLuminance(effectiveRgb.r, effectiveRgb.g, effectiveRgb.b);
  const surfaceContrastRatio = getContrastRatio(surfaceLum, colorLum);

  if (surfaceContrastRatio >= MIN_SURFACE_CONTRAST_RATIO) {
    const textColor = getBestContrastingTextColor(effectiveRgb);
    const borderColor = isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.12)";
    return {
      style: "solid",
      backgroundColor: hexColor,
      textColor,
      borderColor,
      surfaceContrastRatio,
    };
  }

  return {
    style: "subtle",
    surfaceContrastRatio,
  };
}
