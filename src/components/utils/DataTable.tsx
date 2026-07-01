import { ArrowLeftCircle, ArrowRightCircle, LoaderCircle, MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button"
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, getFilteredRowModel, type ColumnDef, type Row, type SortingState, type SortingFn, type VisibilityState } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "../table/TableSkeleton";
import { useEffect, useRef, useState, type ComponentType, type JSX, type ReactNode } from "react"
import { useMediaQuery } from "react-responsive"
import MultiFilterButton, { type Option } from "../table/MultiFilterButton";

interface DataTableProps<TData , TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  Card?: ComponentType<{ row: Row<TData> }>;
  txtPlaceholderFilter?: string;
  columnsHidden?: Extract<keyof TData, string>[];
  dataLoading?: boolean;
  pageSize?: number;
  cantPaginasAlrededor?: `${number}`;
  registrosRemarcados?: number[];
  sorting?: SortingState;
  sortingFns?: Record<string, SortingFn<TData>>;
  minWidthTable?: number;
  multiFilterButton?: { columnId: string, options: Option[], label: string };
  toolbarActions?: ReactNode[];
}

/**
 * Componente de tabla de datos configurable para visualizar y manipular grandes volúmenes de datos.
 * Permite ordenación, filtrado, visibilidad de columnas y adaptabilidad a diferentes tamaños de pantalla.
 *
 * @template TData - Tipo de los datos de cada fila.
 * @template TValue - Tipo del valor de cada celda.
 *
 * @param {DataTableProps<TData, TValue>} props - Propiedades del componente.
 * @param {ColumnDef<TData, TValue>[]} props.columns - Configuración de las columnas de la tabla.
 * @param {TData[]} props.data - Datos a mostrar en la tabla.
 * @param {string} [props.className] - Clase CSS opcional para personalizar estilos.
 * @param {React.ComponentType<{ row: Row<TData> }>} [props.Card] - Componente de tarjeta opcional que, si se proporciona, reemplaza la visualización de formato de tabla por una lista de componentes `Card` en dispositivos móviles.
 * @param {string} [props.txtPlaceholderFilter="Filtrar..."] - Texto del placeholder para el input de filtro global.
 * @param {Array<Extract<keyof TData, string>>} [props.columnsHidden=[]] - Columnas inicialmente ocultas.
 * @param {boolean} [props.dataLoading=false] - Indica si los datos se están cargando.
 * @param {number} [props.pageSize=20] - Número de filas por página.
 * @param {string} [props.cantPaginasAlrededor='2'] - Cantidad de páginas alrededor de la página actual a mostrar en la paginación.
 * @param {number[]} [props.registrosRemarcados=[]] - Lista de IDs de registros que se destacarán en la tabla. Para que esta funcionalidad sea efectiva los datos deben incluir una propiedad id.
 * @param {SortingState} [props.sorting=[]] - Estado inicial de la ordenación de las columnas.
 * @param {Record<string, SortingFn<TData>>} [props.sortingFns={}] - Funciones de ordenación personalizadas para columnas específicas.
 * @param {number} [props.minWidthTable=1024] - Ancho mínimo de la tabla para mostrar la tabla en lugar de las Cards.
 * @param {{ columnId: string, options: Option[], label: string }} [props.multiFilterButton=null] - Objeto que contiene la configuración del botón de filtro múltiple. Si no se proporciona, no se mostrará el botón.
 * @param {ReactNode[]} [props.toolbarActions=[]] - Botones o nodos opcionales para renderizar en el encabezado de la tabla.
 *
 * @returns {JSX.Element} - Componente de tabla interactivo.
 */
export function DataTable<TData extends object, TValue>({ className, columns, data, Card, txtPlaceholderFilter = "Filtrar...", columnsHidden = [], dataLoading = false, pageSize = 20, cantPaginasAlrededor = '2', registrosRemarcados = [], sorting = [], sortingFns = {}, minWidthTable = 1024, multiFilterButton, toolbarActions = [] }: Readonly<DataTableProps<TData, TValue>>): JSX.Element {
  const [ sortingData, setSortingData ] = useState<SortingState>(sorting)
  const [ columnVisibility, setColumnVisibility ] = useState<VisibilityState>(columnsHidden.reduce((acc, column) => ({ ...acc, [column]: false }), {}))
  const [ filtering, setFiltering ] = useState<string>("")
  const isDesktop = useMediaQuery({ minWidth: minWidthTable })

  const [ inputValue, setInputValue ] = useState<string>("")
  const [ inputIsLoading, setInputIsLoading ] = useState(false);
  const filterTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (filterTimeoutRef.current != null) {
        globalThis.clearTimeout(filterTimeoutRef.current);
      }
    };
  }, []);

  const table = useReactTable({ // eslint-disable-line react-hooks/incompatible-library
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSortingData,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnVisibility,
      sorting: sortingData,
      globalFilter: filtering,
    },
    onGlobalFilterChange: setFiltering,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    sortingFns
  });

  const handleInputFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;

    setInputValue(nextValue);
    setInputIsLoading(true);

    if (filterTimeoutRef.current != null) {
      globalThis.clearTimeout(filterTimeoutRef.current);
    }

    filterTimeoutRef.current = globalThis.setTimeout(() => {
      setFiltering(nextValue);
      setInputIsLoading(false);
      filterTimeoutRef.current = null;
    }, 250);
  }

  const indexActualPage = table.getState().pagination.pageIndex;
  const cantidadPaginas = table.getPageCount();
  const pagAlrededor = Number.parseInt(cantPaginasAlrededor);

  return (
    <div className={`flex flex-col gap-4 ${className ?? ""}`}>
      <div className="flex gap-4 max-[360px]:flex-col-reverse">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            {
              inputIsLoading ?
                <LoaderCircle className="animate-spin" size={16} strokeWidth={2} aria-hidden="true" />
                :
                <Search size={12} strokeWidth={2} />
            }
          </div>
          <Input id="input-26" className="peer ps-9 text-xs" placeholder={txtPlaceholderFilter} type="search" value={inputValue} onChange={handleInputFilter} title="Filtrar resultados" />
        </div>

        {
          multiFilterButton && (
            <MultiFilterButton table={table} className={"max-h-96"} columnId={multiFilterButton.columnId} options={multiFilterButton.options} label={multiFilterButton.label} />
          )
        }

        {toolbarActions.map((action, index) => (
          <div key={index} className='flex justify-end'>
            {action}
          </div>
        ))}
      </div>
        {
          Card == null || isDesktop ?
          <Table className="rounded-md border bg-card">
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-xs font-semibold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              { dataLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <TableSkeleton />
                  </TableCell>
                </TableRow>
              ) :
              table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`hover:bg-muted/30 transition-colors ${registrosRemarcados.some(r => "id" in row.original && r === row.original.id) ? 'bg-destructive/10 dark:bg-destructive/20' : ''}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Sin resultados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          :
          <div className="flex flex-col gap-4">
            { dataLoading ? <TableSkeleton /> :
              table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <Card key={row.id} row={row} />
                ))
              ) : (
                <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                  Sin resultados
                </div>
              )
            }
          </div>
        }
        {
          cantidadPaginas > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}> <ArrowLeftCircle className="h-4 w-4" /> </Button>

              <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={indexActualPage === 0} className={indexActualPage === 0 ? 'bg-primary text-primary-foreground' : ''}>1</Button>

              { indexActualPage > pagAlrededor + 1 && <Button variant="outline" size="icon" disabled> <MoreHorizontal className="h-4 w-4" /> </Button> }

              {Array.from({ length: cantidadPaginas }, (_, i) => {
                if (i === 0 || i === cantidadPaginas - 1) return null;
                if (i >= indexActualPage - pagAlrededor && i <= indexActualPage + pagAlrededor) {
                  return <Button key={i} variant="outline" size="sm" onClick={() => table.setPageIndex(i)}  disabled={indexActualPage === i} className={indexActualPage === i ? 'bg-primary text-primary-foreground' : ''}> {i + 1} </Button>;
                }
                return null;
              })}

              { indexActualPage < cantidadPaginas - pagAlrededor - 2 && <Button variant="outline" size="icon" disabled> <MoreHorizontal className="h-4 w-4" /> </Button> }

              { cantidadPaginas > 1 && <Button variant="outline" size="sm" onClick={() => table.setPageIndex(cantidadPaginas - 1)} disabled={indexActualPage === cantidadPaginas - 1} className={indexActualPage === cantidadPaginas - 1 ? 'bg-primary text-primary-foreground' : ''}> {cantidadPaginas} </Button> }

              <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}> <ArrowRightCircle className="h-4 w-4" /> </Button>
            </div>
          )
        }
    </div>
  )
}
