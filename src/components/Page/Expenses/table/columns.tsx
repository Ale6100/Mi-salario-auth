// src\components\Page\Expenses\table\columns.tsx

import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/utils/DataTableColumnHeader";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ConceptoGastosDB } from "@/types/conceptosGastos";

type CreateColumnsProps = {
  readonly handleEdit: (fuente: ConceptoGastosDB) => void;
  readonly handleDelete: (fuente: ConceptoGastosDB) => void;
  readonly handleEditPagado: (fuente: ConceptoGastosDB) => void;
  readonly isFetching: boolean;
};

export const createColumns = ({ handleEdit, handleDelete, handleEditPagado, isFetching }: CreateColumnsProps): ColumnDef<ConceptoGastosDB>[] => [
  {
    accessorKey: 'id_fuente_gasto',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fuente de gasto" />,
    accessorFn: (row) => row.id_fuente_gasto?.nombre || '-',
    cell: ({ row }) => {
      const nombre = row.original.id_fuente_gasto?.nombre || '-';
      const color = row.original.id_fuente_gasto?.color;
      return (
        <p style={color ? { color } : undefined}>{nombre}</p>
      )
    }
  },
  {
    accessorKey: 'monto',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Monto" />,
    accessorFn: (row) => formatPrice(row.monto),
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.monto ?? 0;
      const b = rowB.original.monto ?? 0;
      return a < b ? -1 : a > b ? 1 : 0;
    },
    cell: ({ row }) => {
      const monto = row.original.monto ?? 0;
      const aclaracion = row.original.aclaracion;
      const pagado = row.original.pagado;
      return (
        <span
          title={aclaracion ? aclaracion : undefined}
          className={cn(
            pagado ? 'font-medium' : 'text-muted-foreground',
            aclaracion ? 'cursor-help' : '',
          )}
        >
          {formatPrice(monto)}
          {!pagado && <span className="ml-1.5 text-xs text-muted-foreground/60">(estimado)</span>}
        </span>
      );
    }
  },
  {
    accessorKey: 'pagado',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const pagado = row.original.pagado;
      const aclaracion = row.original.aclaracion;
      if (pagado) {
        return (
          <span
            title={aclaracion ? aclaracion : undefined}
            className={cn(
              'inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
              aclaracion ? 'cursor-help' : '',
            )}
          >
            Pagado
          </span>
        );
      }
      return (
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          Pendiente
        </span>
      );
    },
  },
  {
    accessorKey: 'periodo',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Periodo" />,
    accessorFn: (row) => row.periodo || '-',
  },
  {
    accessorKey: "acciones",
    header: "Acciones",
    enableGlobalFilter: false,
    cell: ({ row }) => {
      const pagado = row.original.pagado;
      const labelPago = pagado ? 'Editar pago' : 'Marcar como pagado';

      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              title='Menú de acciones'
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <span className="sr-only">Abrir menú de acciones</span>
              <Settings2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-fit">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="flex flex-col">
              <DropdownMenuItem
                title='Editar gasto'
                className='cursor-pointer'
                onClick={() => handleEdit(row.original)}
                disabled={isFetching}
              >
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                title={labelPago}
                className='cursor-pointer'
                onClick={() => handleEditPagado(row.original)}
                disabled={isFetching}
              >
                {labelPago}
              </DropdownMenuItem>
              <DropdownMenuItem
                title='Eliminar gasto'
                className='cursor-pointer'
                onClick={() => handleDelete(row.original)}
                disabled={isFetching}
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  },
];
