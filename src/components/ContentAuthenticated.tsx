// src\components\ContentAuthenticated.tsx

import { DashboardPage } from "./Page/Dashboard/Page";
import { EmergencyFundPage } from "./Page/EmergencyFund/Page";
import { ExpenseSourcesPage } from "./Page/Configuration/ExpenseSources/Page";
import { ExpensesPage } from "./Page/Expenses/Page";
import { IncomePage } from "./Page/Income/Page";
import { IncomeSourcesPage } from "./Page/Configuration/IncomeSources/Page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReportsPage } from "./Page/Reports/Page";
import { Routes, Route } from "react-router"
import { RUTAS } from "@/lib/const"
import ReportError from "./utils/ReportError"

const queryClient = new QueryClient();

export const ContentAuthenticated = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path={RUTAS.dashboard} element={<DashboardPage />} />

        <Route path={RUTAS.income} element={<IncomePage />} />
        <Route path={RUTAS.expenses} element={<ExpensesPage />} />
        <Route path={RUTAS.emergencyFund} element={<EmergencyFundPage />} />
        <Route path={RUTAS.reports} element={<ReportsPage />} />

        <Route path={RUTAS.configuration.incomeSources} element={<IncomeSourcesPage />} />
        <Route path={RUTAS.configuration.expenseSources} element={<ExpenseSourcesPage />} />

        <Route path="*" element={<ReportError redirect={RUTAS.dashboard} />} />
      </Routes>
    </QueryClientProvider>
  )
}
