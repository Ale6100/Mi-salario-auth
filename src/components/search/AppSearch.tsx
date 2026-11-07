// src\components\search\AppSearch.tsx

import * as React from "react";
import {
  buildSearchEntries,
  cleanDictatedText,
  findSearchEntries,
  KIND_LABELS,
  type SearchEntry,
} from "./search";
import { Button } from "@/components/ui/button";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Mic, MicOff, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { useFuentesGastos } from "@/hooks/useFuentesGastos";
import { useFuentesIngresos } from "@/hooks/useFuentesIngresos";
import { useNavigate } from "react-router";
import { useTheme } from "@/context/utilThemeProvider";

interface AppSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppSearch({ open, onOpenChange }: AppSearchProps) {
  const { user, logout } = useAuth0();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const { data: expenseSources } = useFuentesGastos({ user });
  const { data: incomeSources } = useFuentesIngresos({ user });

  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isListening, setIsListening] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);
  const lastPointerPosition = React.useRef({ x: -1, y: -1 });

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  const handleLogout = React.useCallback(() => {
    logout({
      logoutParams: { returnTo: globalThis.location.origin },
    });
  }, [logout]);

  const allEntries = React.useMemo(() => {
    return buildSearchEntries({
      toggleTheme,
      logout: handleLogout,
      expenseSources,
      incomeSources,
    });
  }, [toggleTheme, handleLogout, expenseSources, incomeSources]);

  const results = React.useMemo(() => {
    if (!query.trim()) {
      return allEntries;
    }
    return findSearchEntries(query, allEntries);
  }, [query, allEntries]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Soporte de dictado por voz (Web Speech API)
  const isSpeechSupported = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    const win = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }, []);

  const stopDictation = React.useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignorar si ya habia finalizado
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startDictation = React.useCallback(() => {
    if (!isSpeechSupported) return;

    try {
      const win = window as unknown as {
        SpeechRecognition?: new () => any;
        webkitSpeechRecognition?: new () => any;
      };
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) return;

      const recognition = new SpeechRecognitionClass();
      recognition.lang = "es-AR";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0]?.transcript || "")
          .join("");
        setQuery(cleanDictatedText(transcript));
      };

      recognition.onerror = (event: any) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          toast.warning("Habilitá el permiso del micrófono en el navegador para dictar.");
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
          toast.warning("No se pudo conectar con el servicio de dictado.");
        }
        stopDictation();
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      toast.warning("No se pudo iniciar el dictado por voz.");
    }
  }, [isSpeechSupported, stopDictation]);

  const toggleDictation = () => {
    if (isListening) {
      stopDictation();
    } else {
      setQuery("");
      startDictation();
    }
  };

  React.useEffect(() => {
    if (!open) {
      stopDictation();
      setQuery("");
      setActiveIndex(0);
    }
  }, [open, stopDictation]);

  // Evitar salto de foco al mover el cursor quieto durante scroll con teclado
  const activateOptionUnderPointer = (event: React.MouseEvent, index: number) => {
    if (
      event.clientX === lastPointerPosition.current.x &&
      event.clientY === lastPointerPosition.current.y
    ) {
      return;
    }
    lastPointerPosition.current = { x: event.clientX, y: event.clientY };
    setActiveIndex(index);
  };

  const optionId = (index: number) => `app-search-option-${index}`;

  const goTo = async (entry: SearchEntry | undefined) => {
    if (!entry) return;

    onOpenChange(false);

    if (entry.run) {
      await entry.run();
    } else if (entry.to !== undefined) {
      navigate(entry.to);
    } else if (entry.href) {
      window.open(entry.href, "_blank", "noopener");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const lastIndex = results.length - 1;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = Math.min(lastIndex, activeIndex + 1);
      setActiveIndex(nextIndex);
      document.getElementById(optionId(nextIndex))?.scrollIntoView?.({ block: "nearest" });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = Math.max(0, activeIndex - 1);
      setActiveIndex(nextIndex);
      document.getElementById(optionId(nextIndex))?.scrollIntoView?.({ block: "nearest" });
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      document.getElementById(optionId(0))?.scrollIntoView?.({ block: "nearest" });
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(lastIndex);
      document.getElementById(optionId(lastIndex))?.scrollIntoView?.({ block: "nearest" });
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (results[activeIndex]) {
        void goTo(results[activeIndex]);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
    }
  };

  const activeOptionId = results.length > 0 ? optionId(activeIndex) : undefined;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-150 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          aria-label="Buscar pantallas y acciones"
          className="fixed top-[12%] left-1/2 z-50 w-full max-w-xl -translate-x-1/2 rounded-xl bg-background border shadow-2xl p-0 overflow-hidden outline-none duration-150 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          {/* Header con campo de busqueda */}
          <div role="search" className="flex items-center gap-2 border-b px-3 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground ml-1" aria-hidden="true" />
            <label htmlFor="app-search" className="sr-only">
              Buscar pantallas y acciones
            </label>
            <input
              id="app-search"
              type="text"
              role="combobox"
              autoComplete="off"
              autoFocus
              aria-autocomplete="list"
              aria-controls="app-search-results"
              aria-expanded={results.length > 0}
              aria-activedescendant={activeOptionId}
              placeholder={
                isListening
                  ? "Escuchando…"
                  : "¿Qué querés hacer? Ej.: dashboard, gastos, cargar nuevo gasto…"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
            {isSpeechSupported && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={toggleDictation}
                title={isListening ? "Detener dictado" : "Dictar la búsqueda"}
                aria-label="Dictar la búsqueda"
                className={isListening ? "text-red-500 animate-pulse" : "text-muted-foreground"}
              >
                {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onOpenChange(false)}
              title="Cerrar (Esc)"
              aria-label="Cerrar búsqueda"
              className="text-muted-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Lista de resultados */}
          {results.length > 0 ? (
            <ul
              id="app-search-results"
              role="listbox"
              aria-label="Resultados"
              className="max-h-80 overflow-y-auto p-1.5 space-y-0.5"
            >
              {results.map((entry, index) => {
                const IconComponent = entry.icon;
                const isSelected = index === activeIndex;

                return (
                  <li
                    key={entry.id}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => void goTo(entry)}
                    onMouseMove={(e) => activateOptionUnderPointer(e, index)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <IconComponent
                      className={`size-4 shrink-0 ${
                        isSelected ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="truncate font-medium">{entry.label}</div>
                      <div
                        className={`truncate text-xs ${
                          isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                        }`}
                      >
                        {entry.section}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {KIND_LABELS[entry.kind]}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No hay pantallas ni acciones que coincidan con tu búsqueda.
            </p>
          )}

          {/* Footer con atajos de teclado */}
          <div className="flex items-center justify-between border-t bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[10px]">
                ↑↓
              </kbd>
              navegar
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[10px]">
                ↵
              </kbd>
              seleccionar
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[10px]">
                esc
              </kbd>
              cerrar
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function useGlobalSearchShortcut(onTrigger: () => void) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === "k" || event.key === "K")) {
        event.preventDefault();
        onTrigger();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onTrigger]);
}
