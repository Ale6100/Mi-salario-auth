import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// A partir de acá empiezan mis funciones custom

export const formatPrice = (value: number | undefined): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
};

export const formatCompactPrice = (value: number | undefined): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value ?? 0);
};

export const redondearCentavos = (valor: number) => Math.round(valor * 100) / 100;

const contar = (texto: string, caracter: string) => texto.split(caracter).length - 1;

const getIndiceSeparadorDecimal = (texto: string): number | null => {
  const ultimaComa = texto.lastIndexOf(",");
  const ultimoPunto = texto.lastIndexOf(".");

  if (ultimaComa !== -1 && ultimoPunto !== -1) return Math.max(ultimaComa, ultimoPunto);
  if (ultimaComa !== -1) return contar(texto, ",") === 1 ? ultimaComa : null;
  if (ultimoPunto !== -1) {
    const digitosDespuesDelPunto = texto.length - ultimoPunto - 1;
    const parteEnteraEsCero = /^0*$/.test(texto.slice(0, ultimoPunto));
    return contar(texto, ".") === 1 && (digitosDespuesDelPunto !== 3 || parteEnteraEsCero) ? ultimoPunto : null;
  }
  return null;
};

export const parseMontoIngresado = (texto: string): number | null => {
  const limpio = texto.replaceAll(/[^0-9.,]/g, "");
  if (!/\d/.test(limpio)) return null;

  const indiceDecimal = getIndiceSeparadorDecimal(limpio);
  const soloDigitos = (parte: string) => parte.replaceAll(/[.,]/g, "");
  const normalizado = indiceDecimal === null
    ? soloDigitos(limpio)
    : `${soloDigitos(limpio.slice(0, indiceDecimal))}.${soloDigitos(limpio.slice(indiceDecimal + 1))}`;

  const valor = Number(normalizado);
  return Number.isFinite(valor) ? redondearCentavos(valor) : null;
};
