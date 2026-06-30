// src\components\Page\Income\table\columns.tsx

import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/utils/DataTableColumnHeader";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/lib/utils";
import { Settings2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ConceptoIngresosDB } from "@/types/conceptosIngresos";

type CreateColumnsProps = {
  readonly handleEdit: (fuente: ConceptoIngresosDB) => void;
  readonly handleDelete: (fuente: ConceptoIngresosDB) => void;
  readonly isFetching: boolean;
};

export const createColumns = ({ handleEdit, handleDelete, isFetching }: CreateColumnsProps): ColumnDef<ConceptoIngresosDB>[] => [
  {
    accessorKey: 'valor',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valor" />,
    accessorFn: (row) => formatPrice(row.valor) || '-',
  },
  {
    accessorKey: 'id_fuente_ingreso',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fuente de ingreso" />,
    accessorFn: (row) => row.id_fuente_ingreso?.nombre || '-',
    cell: ({ row }) => {
      const nombre = row.original.id_fuente_ingreso?.nombre || '-';
      const color = row.original.id_fuente_ingreso?.color;
      return (
        <p style={color ? { color } : undefined}>{nombre}</p>
      )
    }
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

          <DropdownMenuContent>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="flex flex-col">
              <DropdownMenuItem
                title='Editar ingreso'
                className='cursor-pointer'
                onClick={() => handleEdit(row.original)}
                disabled={isFetching}
              >
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                title='Eliminar ingreso'
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
