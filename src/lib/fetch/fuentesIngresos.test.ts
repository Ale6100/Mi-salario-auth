// src\lib\fetch\fuentesIngresos.test.ts

import { describeLlamadasBackend, mockFetch, TOKEN } from "@/test/backend";
import { fetchDeleteFuenteIngresos, fetchFuentesIngresos, fetchPostFuenteIngresos, fetchPutFuenteIngresos } from "@/lib/fetch/fuentesIngresos";

const fetchMock = mockFetch();

const fuente = { nombre: "Sueldo", color: "#00ff00", activo: true, aguinaldo: false };

describeLlamadasBackend(fetchMock, [
  { nombre: "fetchFuentesIngresos", llamar: () => fetchFuentesIngresos({ token: TOKEN }), metodo: "GET", ruta: "/fuentes-ingresos" },
  { nombre: "fetchPostFuenteIngresos", llamar: () => fetchPostFuenteIngresos({ token: TOKEN, data: fuente }), metodo: "POST", ruta: "/fuentes-ingresos", body: fuente },
  { nombre: "fetchPutFuenteIngresos", llamar: () => fetchPutFuenteIngresos({ token: TOKEN, id: "f1", data: fuente }), metodo: "PUT", ruta: "/fuentes-ingresos/f1", body: fuente },
  { nombre: "fetchDeleteFuenteIngresos", llamar: () => fetchDeleteFuenteIngresos({ token: TOKEN, id: "f1" }), metodo: "DELETE", ruta: "/fuentes-ingresos/f1" },
]);
