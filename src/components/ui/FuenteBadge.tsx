// src\components\ui\FuenteBadge.tsx

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  resolveFuenteBadgeVariant,
  type FuenteBadgeStyle,
} from "@/lib/colorContrast";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";

export interface FuenteBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  nombre: string;
  color?: string;
  /**
   * 'auto': decide automáticamente según el contraste WCAG con el fondo de la pantalla.
   * 'solid': fuerza el badge sólido con fondo de color.
   * 'subtle': fuerza el badge neutro con punto indicador de color.
   */
  variant?: "auto" | FuenteBadgeStyle;
  /**
   * Tamaño del badge.
   * 'sm' es más compacto (ideal para tablas y selectores).
   */
  size?: "sm" | "md";
}

export const FuenteBadge = React.forwardRef<HTMLSpanElement, FuenteBadgeProps>(
  (
    {
      nombre,
      color,
      variant = "auto",
      size = "sm",
      className,
      title,
      ...props
    },
    ref
  ) => {
    const isDarkMode = useIsDarkMode();
    const resolved = resolveFuenteBadgeVariant(color, isDarkMode);

    const activeStyle: FuenteBadgeStyle =
      variant === "auto" ? resolved.style : variant;

    if ((!nombre || nombre === "-") && !color) {
      return (
        <span ref={ref} className={cn("text-muted-foreground", className)} {...props}>
          -
        </span>
      );
    }

    const defaultTitle = color ? `${nombre} (${color})` : nombre;

    const sizeClasses =
      size === "sm"
        ? "text-xs px-2 py-0.5 gap-1.5"
        : "text-sm px-2.5 py-1 gap-2";

    if (activeStyle === "solid" && color) {
      return (
        <span
          ref={ref}
          data-slot="fuente-badge"
          data-variant="solid"
          className={cn(
            "inline-flex items-center rounded-full font-medium border shadow-2xs transition-colors shrink-0 max-w-full",
            sizeClasses,
            className
          )}
          style={{
            backgroundColor: color,
            color: resolved.textColor ?? "#ffffff",
            borderColor: resolved.borderColor ?? "rgba(0,0,0,0.1)",
          }}
          title={title ?? defaultTitle}
          {...props}
        >
          <span className="truncate">{nombre}</span>
        </span>
      );
    }

    return (
      <span
        ref={ref}
        data-slot="fuente-badge"
        data-variant="subtle"
        className={cn(
          "inline-flex items-center rounded-full font-medium bg-muted/80 text-foreground border border-border/80 shadow-2xs transition-colors shrink-0 max-w-full",
          sizeClasses,
          className
        )}
        title={title ?? defaultTitle}
        {...props}
      >
        {color && (
          <span
            data-slot="fuente-badge-dot"
            className="size-2 rounded-full shrink-0 ring-1 ring-black/15 dark:ring-white/25"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
        )}
        <span className="truncate">{nombre}</span>
      </span>
    );
  }
);

FuenteBadge.displayName = "FuenteBadge";
