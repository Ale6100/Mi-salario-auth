# Mi salario

Aplicación web para organizar y visualizar las finanzas personales. Nació para uso personal, pero tiene login para que cualquiera pueda usarla con sus propios datos. [Acá](https://mi-salario-auth.netlify.app) se puede ver el sitio.

## Secciones

- **Dashboard**: panorama general de la situación financiera actual.
- **Ingresos** y **Gastos**: carga de los conceptos de cada período, clasificados por fuente. Los conceptos de un mes se pueden copiar del mes anterior, para no volver a cargar los que se repiten.
- **Fondo de emergencia**: ahorro reservado para cubrir los gastos en caso de quedarse sin ningún ingreso. Opcionalmente suma los ahorros en dólares, convertidos a pesos con el dólar MEP (precio de compra: lo que se obtiene al vender los dólares por la vía legal).
- **Reportes**: resumen y balance de los gastos e ingresos declarados, y un gráfico de su evolución ajustada por inflación (en pesos del último mes con inflación publicada), para comparar meses distintos en términos reales. Los reportes se descargan en Markdown, un formato que también se presta para analizarlos con herramientas de IA.
- **Configuración**: administración de las fuentes de ingreso y de gasto.

## Stack

React 19 + TypeScript + Vite, con Tailwind y componentes de shadcn/ui. El login se hace con Auth0 y los datos se obtienen con TanStack Query del [backend del proyecto](https://github.com/Ale6100/Mi-salario-auth-backend); las tablas usan TanStack Table.

El deploy se hace en Netlify y su configuración vive allá, no en este repositorio.

Además del backend, la app consulta dos APIs públicas, gratuitas y sin clave, directamente desde el navegador:

- [DolarApi](https://dolarapi.com): se usa para obtener la cotización del dólar MEP.
- [ArgentinaDatos](https://argentinadatos.com): se usa para obtener la inflación mensual.

## Instalación y ejecución

Requiere Node 24 (la versión que usa el CI).

```bash
npm install
npm run dev
```

### Variables de entorno

Se definen en un archivo `.env` en la raíz:

```bash
VITE_AUTH_DOMAIN = X # domain de auth0
VITE_AUTH_CLIENT_ID = X # client id de auth0
VITE_AUTH_AUDIENCE = X # audience de auth0

VITE_BACKEND_URL = X # url del backend
```

### Scripts

| Script | Uso |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Chequeo de tipos y build de producción |
| `npm run lint:all` | ESLint + chequeo de tipos |
| `npm test` / `npm run test:watch` | Tests (una corrida / modo watch) |
| `npm run agents:update` | Reemplaza `AGENTS.md` por la última versión de la plantilla del repositorio [Templates-IA](https://github.com/Ale6100/Templates-IA) |

## Estructura

- `src/components/Page/`: una carpeta por sección de la app (Dashboard, Income, Expenses, EmergencyFund, Reports, Configuration).
- `src/components/ui/`: componentes de shadcn/ui.
- `src/components/utils/` y `src/components/table/`: componentes reutilizables, como `DataTable` y sus filtros.
- `src/hooks/`: hooks propios, entre ellos los que consultan cada recurso del backend con TanStack Query.
- `src/lib/fetch/`: llamadas al backend y a las APIs públicas.
- `src/test/`: setup y helpers compartidos de los tests.
- `src/types/`: tipos de los datos que devuelve el backend.

## Tests

Vitest con Testing Library sobre jsdom, configurado en el bloque `test` de `vite.config.ts`. Cada test va junto al archivo que prueba (`*.test.ts(x)`).

Los tests no usan backend, base de datos ni servicios reales: `fetch`, Auth0 y los toasts se reemplazan por mocks. Tampoco necesitan el `.env`: en modo test, `vite.config.ts` usa valores de entorno ficticios en lugar de los del archivo.

## CI

En cada push, GitHub Actions corre `npm run lint:all` y `npm test`. Si alguno falla, avisa por WhatsApp mediante CallMeBot, usando los secrets `WHATSAPP_PHONE` y `WHATSAPP_API_KEY` del repositorio.

## Analítica

`index.html` incluye el script de Umami, que se usa para registrar las visitas al sitio.
