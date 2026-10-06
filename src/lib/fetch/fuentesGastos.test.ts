// src\lib\fetch\fuentesGastos.test.ts

import { describeLlamadasBackend, mockFetch, TOKEN } from "@/test/backend";
import { fetchDeleteFuenteGastos, fetchFuentesGastos, fetchPostFuenteGastos, fetchPutFuenteGastos } from "@/lib/fetch/fuentesGastos";

const fetchMock = mockFetch();

const fuente = { nombre: "Alquiler", color: "#ff0000", es_indispensable: true };

describeLlamadasBackend(fetchMock, [
  { nombre: "fetchFuentesGastos", llamar: () => fetchFuentesGastos({ token: TOKEN }), metodo: "GET", ruta: "/fuentes-gastos" },
  { nombre: "fetchPostFuenteGastos", llamar: () => fetchPostFuenteGastos({ token: TOKEN, data: fuente }), metodo: "POST", ruta: "/fuentes-gastos", body: fuente },
  { nombre: "fetchPutFuenteGastos", llamar: () => fetchPutFuenteGastos({ token: TOKEN, id: "f1", data: fuente }), metodo: "PUT", ruta: "/fuentes-gastos/f1", body: fuente },
  { nombre: "fetchDeleteFuenteGastos", llamar: () => fetchDeleteFuenteGastos({ token: TOKEN, id: "f1" }), metodo: "DELETE", ruta: "/fuentes-gastos/f1" },
]);
