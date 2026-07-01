// src\components\Page\Expenses\table\columns.tsx

import { DataTableColumnHeader } from "@/components/utils/DataTableColumnHeader";
import { cn, formatPrice } from "@/lib/utils";
import type { ConceptoGastosDB } from "@/types/conceptosGastos";
import type { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";

type CreateColumnsProps = {
  readonly handleEdit: (fuente: ConceptoGastosDB) => void;
  readonly handleDelete: (fuente: ConceptoGastosDB) => void;
  readonly handleEditMontoReal: (fuente: ConceptoGastosDB) => void;
  readonly isFetching: boolean;
};

export const createColumns = ({ handleEdit, handleDelete, handleEditMontoReal, isFetching }: CreateColumnsProps): ColumnDef<ConceptoGastosDB>[] => [
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
    accessorKey: 'columnaMonto',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Monto estimado" />,
    accessorFn: (row) => formatPrice(row.columnaMonto),
  },
  {
    accessorKey: 'monto_real',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Monto real" />,
    accessorFn: (row) => formatPrice(row.monto_real),
    cell: ({ row }) => {
      const aclaracion = row.original.aclaracion;
      return <span title={`${aclaracion ?? ''}`} className={cn(aclaracion ? 'cursor-help' : '')}>{formatPrice(row.original.monto_real)}</span>;
    }
  },
  {
    accessorKey: 'diferencia',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Diferencia" />,
    cell: ({ row }) => {
      const montoReal = row.original.monto_real;
      const montoEstimado = row.original.columnaMonto;
      if (montoReal == null || montoEstimado == null) return <span>-</span>;
      const diferencia = montoEstimado - montoReal;
      return (
        <span className={cn(diferencia >= 0 ? 'text-primary' : 'text-destructive')}>
          {formatPrice(diferencia)}
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
      const labelEditarMonto = row.original.monto_real == null ? 'Registrar gasto real': 'Editar gasto real';

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
                title='Registrar gasto real'
                className='cursor-pointer'
                onClick={() => handleEditMontoReal(row.original)}
                disabled={isFetching}
              >
                {labelEditarMonto}
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
