// src\components\Page\Configuration\IncomeSources\columns.tsx

import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/utils/DataTableColumnHeader";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { FuenteIngresosDB } from "@/types/fuentesIngresos";

type CreateColumnsProps = {
  readonly handleEdit: (fuente: FuenteIngresosDB) => void;
  readonly handleDelete: (fuente: FuenteIngresosDB) => void;
};

export const createColumns = ({ handleEdit, handleDelete }: CreateColumnsProps): ColumnDef<FuenteIngresosDB>[] => [
  {
    accessorKey: 'nombre',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    accessorFn: (row) => row.nombre || '-',
  },
  {
    accessorKey: 'color',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Color" />,
    cell: ({ row }) => {
      const color = row.original.color;
      if (!color) return <span>-</span>;
      return (
        <div className="flex items-center gap-2">
          <div
            className="size-5 rounded border border-border shrink-0"
            style={{ backgroundColor: color }}
            title={color}
          />
          <span className="font-mono text-sm">{color}</span>
        </div>
      );
    },
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
                title='Editar fuente de ingreso'
                className='cursor-pointer'
                onClick={() => handleEdit(row.original)}
              >
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                title='Eliminar fuente de ingreso'
                className='cursor-pointer'
                onClick={() => handleDelete(row.original)}
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  },
  {
    accessorKey: "activo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Activo" />,
  }
]
