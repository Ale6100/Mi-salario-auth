// src\components\search\SearchContext.tsx

import * as React from "react";
import { AppSearch, useGlobalSearchShortcut } from "./AppSearch";

interface SearchContextValue {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  setIsOpen: (open: boolean) => void;
}

const SearchContext = React.createContext<SearchContextValue | null>(null);

const fallbackValue: SearchContextValue = {
  isOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
  setIsOpen: () => {},
};

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const openSearch = React.useCallback(() => setIsOpen(true), []);
  const closeSearch = React.useCallback(() => setIsOpen(false), []);

  useGlobalSearchShortcut(openSearch);

  return (
    <SearchContext.Provider value={{ isOpen, openSearch, closeSearch, setIsOpen }}>
      {children}
      <AppSearch open={isOpen} onOpenChange={setIsOpen} />
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = React.useContext(SearchContext);
  return context ?? fallbackValue;
}
