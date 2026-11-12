// src\components\Page\Configuration\ExpenseSources\columns.tsx

import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/utils/DataTableColumnHeader";
import { FuenteBadge } from "@/components/ui/FuenteBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { FuenteGastosDB } from "@/types/fuentesGastos";

type CreateColumnsProps = {
  readonly handleEdit: (fuente: FuenteGastosDB) => void;
  readonly handleDelete: (fuente: FuenteGastosDB) => void;
  readonly handleEvolution: (fuente: FuenteGastosDB) => void;
  readonly isFetching: boolean;
};

export const createColumns = ({ handleEdit, handleDelete, handleEvolution, isFetching }: CreateColumnsProps): ColumnDef<FuenteGastosDB>[] => [
  {
    accessorKey: 'nombre',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => {
      const nombre = row.original.nombre || '-';
      const esIndispensable = row.original.es_indispensable;
      const seguimientoDiario = row.original.seguimiento_diario;
      return (
        <span className="inline-flex items-center gap-1.5">
          {esIndispensable && (
            <span className="size-2 rounded-full bg-destructive shrink-0" title="Indispensable" />
          )}
          {seguimientoDiario && (
            <span className="size-2 rounded-full bg-blue-500 shrink-0" title="Seguimiento diario" />
          )}
          {nombre}
        </span>
      );
    },
  },
  {
    accessorKey: 'color',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Color" />,
    cell: ({ row }) => {
      const color = row.original.color;
      if (!color) return <span>-</span>;
      return (
        <div className="flex items-center gap-2">
          <FuenteBadge nombre={row.original.nombre || color} color={color} />
          <span className="font-mono text-xs text-muted-foreground">{color}</span>
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
                title='Ver evolución histórica de la fuente'
                className='cursor-pointer'
                onClick={() => handleEvolution(row.original)}
              >
                Ver evolución
              </DropdownMenuItem>
              <DropdownMenuItem
                title='Editar fuente de gastos'
                className='cursor-pointer'
                onClick={() => handleEdit(row.original)}
                disabled={isFetching}
              >
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                title='Eliminar fuente de gastos'
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
