// src\components\ContentAuthenticated.tsx

import { DashboardPage } from "./Page/Dashboard/Page";
import { EmergencyFundPage } from "./Page/EmergencyFund/Page";
import { ExpenseSourcesPage } from "./Page/Configuration/ExpenseSources/Page";
import { ExpenseSourceEvolutionPage } from "./Page/Configuration/ExpenseSources/Evolution/Page";
import { ExpensesPage } from "./Page/Expenses/Page";
import { IncomePage } from "./Page/Income/Page";
import { IncomeSourcesPage } from "./Page/Configuration/IncomeSources/Page";
import { IncomeSourceEvolutionPage } from "./Page/Configuration/IncomeSources/Evolution/Page";
import { ReportsPage } from "./Page/Reports/Page";
import { Routes, Route } from "react-router";
import { RUTAS } from "@/lib/const";
import ReportError from "./utils/ReportError";

export const ContentAuthenticated = () => {
  return (
    <Routes>
      <Route path={RUTAS.dashboard} element={<DashboardPage />} />

      <Route path={RUTAS.income} element={<IncomePage />} />
      <Route path={RUTAS.expenses} element={<ExpensesPage />} />
      <Route path={RUTAS.emergencyFund} element={<EmergencyFundPage />} />
      <Route path={RUTAS.reports} element={<ReportsPage />} />

      <Route path={RUTAS.configuration.incomeSources} element={<IncomeSourcesPage />} />
      <Route path={RUTAS.configuration.incomeSourceEvolution} element={<IncomeSourceEvolutionPage />} />
      <Route path={RUTAS.configuration.expenseSources} element={<ExpenseSourcesPage />} />
      <Route path={RUTAS.configuration.expenseSourceEvolution} element={<ExpenseSourceEvolutionPage />} />

      <Route path="*" element={<ReportError redirect={RUTAS.dashboard} />} />
    </Routes>
  );
};
