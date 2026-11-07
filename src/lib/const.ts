// src\lib\const.ts

export const RUTAS = {
  dashboard: "/",
  income: "/income",
  expenses: "/expenses",
  emergencyFund: "/emergency-fund",
  reports: "/reports",
  configuration: {
    incomeSources: "/configuration/income-sources",
    incomeSourceEvolution: "/configuration/income-sources/:id",
    expenseSources: "/configuration/expense-sources",
    expenseSourceEvolution: "/configuration/expense-sources/:id",
  }
}

export const MENSAJE_ERROR_CARGA = "No se pudieron cargar los datos. Intentá de nuevo más tarde.";
