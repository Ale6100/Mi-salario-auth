// src\components\ContentAuthenticated.tsx

import { RUTAS } from "@/lib/const"
import { BrowserRouter, Routes, Route } from "react-router"
import ReportError from "./utils/ReportError"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { DashboardPage } from "./Dashboard/Page";

const queryClient = new QueryClient();

export const ContentAuthenticated = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path={RUTAS.dashboard} element={ <DashboardPage /> }  />

          <Route path="*" element={<ReportError redirect={RUTAS.dashboard} />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
