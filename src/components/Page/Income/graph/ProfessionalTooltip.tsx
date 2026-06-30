// src\components\Page\Income\graph\ProfessionalTooltip.tsx

import { formatPrice } from "@/lib/utils";
import type { ChartConfig } from "@/components/ui/chart";

export const formatPeriodo = (periodo: string) => {
  if (typeof periodo !== "string") return String(periodo);
  const [year, month] = periodo.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  const formatted = date.toLocaleDateString("es-AR", {
    month: "short",
    year: "2-digit",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

type TooltipEntry = {
  name?: string;
  dataKey?: string | number;
  value?: number | string;
  color?: string;
};

export const ProfessionalTooltip = ({
  active,
  payload,
  label,
  chartConfig,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  chartConfig: ChartConfig;
}) => {
  if (!active || !payload?.length) return null;

  const visibleEntries = payload.filter((entry) => Number(entry.value ?? 0) > 0);

  if (!visibleEntries.length) return null;

  return (
    <div className="min-w-48 rounded-lg border border-border/40 bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      <p className="mb-2 border-b border-border/30 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {formatPeriodo(String(label))}
      </p>
      <div className="space-y-1.5">
        {visibleEntries.map((entry) => {
          const name = String(entry.name ?? entry.dataKey ?? "");
          const config = chartConfig[name];
          return (
            <div key={name} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs font-medium text-foreground">
                  {config?.label ? String(config.label) : name}
                </span>
              </div>
              <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                {formatPrice(Number(entry.value))}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 border-t border-border/30 pt-1.5">
        <div className="flex items-center justify-between gap-6">
          <span className="text-xs font-semibold text-foreground">Total</span>
          <span className="font-mono text-xs font-bold tabular-nums text-foreground">
            {formatPrice(
              visibleEntries.reduce((acc, entry) => acc + Number(entry.value ?? 0), 0),
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
