// src\components\ContentAuthenticated.tsx

import { DashboardPage } from "./Page/Dashboard/Page";
import { IncomeSourcesPage } from "./Page/Configuration/IncomeSources/Page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Routes, Route } from "react-router"
import { RUTAS } from "@/lib/const"
import ReportError from "./utils/ReportError"

const queryClient = new QueryClient();

export const ContentAuthenticated = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path={RUTAS.dashboard} element={ <DashboardPage /> }  />

        <Route path={RUTAS.configuration.incomeSources} element={ <IncomeSourcesPage /> }  />

        <Route path="*" element={<ReportError redirect={RUTAS.dashboard} />} />
      </Routes>
    </QueryClientProvider>
  )
}
