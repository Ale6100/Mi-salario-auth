// src\components\search\search.ts

import type { ComponentType } from "react";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  List,
  LogOut,
  Moon,
  PiggyBank,
  PlusCircle,
  Shield,
  Sliders,
  Wallet,
} from "lucide-react";
import { RUTAS } from "@/lib/const";

export type SearchEntryKind = "screen" | "action" | "function";

export const KIND_ORDER: SearchEntryKind[] = ["screen", "action", "function"];

export const KIND_LABELS: Record<SearchEntryKind, string> = {
  screen: "Pantalla",
  action: "Acción",
  function: "Función",
};

export type SearchEntryTarget =
  | { to: string; href?: never; run?: never }
  | { href: string; to?: never; run?: never }
  | { run: () => void | Promise<void>; to?: never; href?: never };

export type SearchEntry = SearchEntryTarget & {
  id: string;
  kind: SearchEntryKind;
  label: string;
  icon: ComponentType<{ className?: string }>;
  section: string;
  keywords: string[];
};

export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Limpia el texto dictado por voz quitando signos de puntuación iniciales o finales
 * (como el punto que muchos motores de voz agregan automáticamente) y espacios.
 */
export function cleanDictatedText(text: string): string {
  return text.replace(/^[\s\p{P}]+|[\s\p{P}]+$/gu, "").trim();
}

function containsAllWords(text: string, words: string[]): boolean {
  const normalizedText = normalizeText(text);
  return words.every((word) => normalizedText.includes(word));
}

export function findSearchEntries(query: string, entries: SearchEntry[]): SearchEntry[] {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }

  const matchesLabel = (entry: SearchEntry): boolean => containsAllWords(entry.label, words);

  return entries
    .filter((entry) =>
      containsAllWords([entry.label, entry.section, ...entry.keywords].join(" "), words)
    )
    .sort((first, second) => Number(matchesLabel(second)) - Number(matchesLabel(first)));
}

export interface BuildEntriesOptions {
  toggleTheme?: () => void;
  logout?: () => void;
  expenseSources?: Array<{ _id: string; nombre: string }>;
  incomeSources?: Array<{ _id: string; nombre: string }>;
}

export function buildSearchEntries(options: BuildEntriesOptions = {}): SearchEntry[] {
  const screens: SearchEntry[] = [
    {
      id: "screen-dashboard",
      kind: "screen",
      label: "Dashboard",
      icon: LayoutDashboard,
      section: "Principal",
      to: RUTAS.dashboard,
      keywords: ["inicio", "resumen", "general", "balance", "saldo", "semaforo", "50/30/20", "home"],
    },
    {
      id: "screen-income",
      kind: "screen",
      label: "Ingresos",
      icon: Wallet,
      section: "Principal",
      to: RUTAS.income,
      keywords: ["sueldo", "salario", "cobro", "plata", "entradas", "dinero", "ganancias"],
    },
    {
      id: "screen-expenses",
      kind: "screen",
      label: "Gastos",
      icon: CreditCard,
      section: "Principal",
      to: RUTAS.expenses,
      keywords: ["salidas", "pagos", "egresos", "cuotas", "tarjeta", "facturas", "deudas"],
    },
    {
      id: "screen-emergency-fund",
      kind: "screen",
      label: "Fondo de emergencia",
      icon: Shield,
      section: "Principal",
      to: RUTAS.emergencyFund,
      keywords: ["ahorro", "reserva", "colchon", "seguridad", "mep", "dolar", "colchón"],
    },
    {
      id: "screen-reports",
      kind: "screen",
      label: "Reportes",
      icon: BarChart3,
      section: "Principal",
      to: RUTAS.reports,
      keywords: ["graficos", "estadisticas", "historico", "analisis", "metricas", "gráficos"],
    },
    {
      id: "screen-income-sources",
      kind: "screen",
      label: "Fuentes de ingreso",
      icon: List,
      section: "Configuración",
      to: RUTAS.configuration.incomeSources,
      keywords: ["trabajo", "categorias", "origen", "clientes", "categorías"],
    },
    {
      id: "screen-expense-sources",
      kind: "screen",
      label: "Fuentes de gastos",
      icon: Sliders,
      section: "Configuración",
      to: RUTAS.configuration.expenseSources,
      keywords: ["rubros", "categorias", "indispensable", "categorías", "clasificacion"],
    },
  ];

  const actions: SearchEntry[] = [
    {
      id: "action-new-expense",
      kind: "action",
      label: "Cargar nuevo gasto",
      icon: PlusCircle,
      section: "Gastos",
      to: `${RUTAS.expenses}?action=new`,
      keywords: ["crear", "agregar", "nuevo", "pagar", "cuota", "compra", "alta"],
    },
    {
      id: "action-new-income",
      kind: "action",
      label: "Cargar nuevo ingreso",
      icon: PlusCircle,
      section: "Ingresos",
      to: `${RUTAS.income}?action=new`,
      keywords: ["crear", "agregar", "nuevo", "sueldo", "sumar", "alta"],
    },
    {
      id: "action-new-expense-source",
      kind: "action",
      label: "Nueva fuente de gasto",
      icon: PlusCircle,
      section: "Configuración / Fuentes de gastos",
      to: `${RUTAS.configuration.expenseSources}?action=new`,
      keywords: ["crear", "categoria", "rubro", "alta"],
    },
    {
      id: "action-new-income-source",
      kind: "action",
      label: "Nueva fuente de ingreso",
      icon: PlusCircle,
      section: "Configuración / Fuentes de ingreso",
      to: `${RUTAS.configuration.incomeSources}?action=new`,
      keywords: ["crear", "categoria", "origen", "alta"],
    },
    {
      id: "action-configure-emergency-fund",
      kind: "action",
      label: "Configurar fondo de emergencia",
      icon: PiggyBank,
      section: "Fondo de emergencia",
      to: RUTAS.emergencyFund,
      keywords: ["ajustar", "porcentaje", "meses", "meta", "reserva"],
    },
  ];

  const functions: SearchEntry[] = [];

  if (options.toggleTheme) {
    functions.push({
      id: "function-toggle-theme",
      kind: "function",
      label: "Cambiar tema (Claro / Oscuro)",
      icon: Moon,
      section: "Apariencia",
      run: options.toggleTheme,
      keywords: ["modo", "dark", "light", "color", "nocturno", "tema"],
    });
  }

  if (options.logout) {
    functions.push({
      id: "function-logout",
      kind: "function",
      label: "Cerrar sesión",
      icon: LogOut,
      section: "Cuenta",
      run: options.logout,
      keywords: ["salir", "logout", "desconectar", "chau"],
    });
  }

  // Fuentes dinamicas del usuario si estan disponibles
  const dynamicSources: SearchEntry[] = [];

  if (options.expenseSources) {
    for (const source of options.expenseSources) {
      dynamicSources.push({
        id: `screen-expense-source-${source._id}`,
        kind: "screen",
        label: `Evolución: ${source.nombre}`,
        icon: Sliders,
        section: "Fuentes de gastos",
        to: `/configuration/expense-sources/${source._id}`,
        keywords: ["gasto", "fuente", "rubro", "historial", source.nombre],
      });
    }
  }

  if (options.incomeSources) {
    for (const source of options.incomeSources) {
      dynamicSources.push({
        id: `screen-income-source-${source._id}`,
        kind: "screen",
        label: `Evolución: ${source.nombre}`,
        icon: List,
        section: "Fuentes de ingreso",
        to: `/configuration/income-sources/${source._id}`,
        keywords: ["ingreso", "fuente", "origen", "historial", source.nombre],
      });
    }
  }

  return [...screens, ...dynamicSources, ...actions, ...functions].sort(
    (first, second) => KIND_ORDER.indexOf(first.kind) - KIND_ORDER.indexOf(second.kind)
  );
}
