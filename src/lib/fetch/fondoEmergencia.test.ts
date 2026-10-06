// src\lib\fetch\fondoEmergencia.test.ts

import { describeLlamadasBackend, mockFetch, TOKEN } from "@/test/backend";
import { fetchFondoEmergencia, fetchPatchFondoEmergencia } from "@/lib/fetch/fondoEmergencia";

const fetchMock = mockFetch();

describeLlamadasBackend(fetchMock, [
  { nombre: "fetchFondoEmergencia", llamar: () => fetchFondoEmergencia({ token: TOKEN }), metodo: "GET", ruta: "/fondo-emergencia" },
  { nombre: "fetchPatchFondoEmergencia", llamar: () => fetchPatchFondoEmergencia({ token: TOKEN, data: { porcentaje_total: 30, saldo_real: null } }), metodo: "PATCH", ruta: "/fondo-emergencia", body: { porcentaje_total: 30, saldo_real: null } },
]);
