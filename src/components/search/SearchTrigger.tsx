// src\components\search\SearchTrigger.tsx

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onOpen: () => void;
  variant?: "sidebar" | "icon" | "header";
}

export function SearchTrigger({ onOpen, variant = "sidebar", className, ...props }: SearchTriggerProps) {
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);
  const shortcutLabel = isMac ? "⌘K" : "Ctrl K";

  if (variant === "icon" || variant === "header") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onOpen}
        title={`Buscar (${shortcutLabel})`}
        aria-label={`Buscar (${shortcutLabel})`}
        className={className}
        {...props}
      >
        <Search className="size-4" />
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Buscar (${shortcutLabel})`}
      className={`flex w-full items-center justify-between rounded-lg border bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground cursor-pointer ${
        className || ""
      }`}
      {...props}
    >
      <span className="flex items-center gap-2">
        <Search className="size-3.5" />
        <span>Buscar...</span>
      </span>
      <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-2xs">
        {shortcutLabel}
      </kbd>
    </button>
  );
}
