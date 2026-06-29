import { ArrowDownIcon, ArrowUpDown, ArrowUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Column } from "@tanstack/react-table"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: Readonly<DataTableColumnHeaderProps<TData, TValue>>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 cursor-pointer data-[state=open]:bg-accent text-xs text-foreground hover:bg-accent/50 dark:hover:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4 text-foreground/80" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4 text-foreground/80" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-background border-border w-fit">
          <DropdownMenuItem className='cursor-pointer hover:bg-accent/50 dark:hover:bg-accent' title='Orden ascendente' onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground">Ascendente</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='cursor-pointer hover:bg-accent/50 dark:hover:bg-accent' title='Orden descendente' onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground">Descendente</span>
          </DropdownMenuItem>
          {/* <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem className='cursor-pointer hover:bg-accent/50 dark:hover:bg-accent' title='Esconder columna' onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground">Esconder</span>
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
