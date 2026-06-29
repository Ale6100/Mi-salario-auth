import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isValidElement, useEffect, type JSX } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type Table } from '@tanstack/react-table';

/**
 * Representa una opción de filtrado con un valor, un ícono (que puede ser un componente o una URL de imagen)
 * y una opción para selección por defecto.
 */
export type Option = {
  value: string;
  icon: string | JSX.Element;
  defaultSelected?: boolean;
};

type MultiFilterButtonProps<TData> = {
  table: Table<TData>;
  columnId: string;
  options: Option[];
  label: string;
  className?: string | null;
};

/**
 * Componente que proporciona un botón desplegable para aplicar filtros múltiples a una columna de una tabla.
 * Permite seleccionar múltiples opciones para filtrar los datos.
 *
 * - Se pueden definir opciones con la propiedad `defaultSelected` para que aparezcan seleccionadas al inicio.
 * - Cuando no hay nada seleccionado, se establece el filtro como un arreglo vacío, lo que hará que la tabla no muestre nada.
 *
 * @component
 * @param {MultiFilterButtonProps} props - Propiedades del componente.
 * @returns {JSX.Element | null} Un botón con un menú desplegable para filtrar la columna, o null si la columna no existe.
 */
const MultiFilterButton = <TData,>({ table, columnId, options, label, className = null }: MultiFilterButtonProps<TData>): JSX.Element | null => {
  const column = table.getColumn(columnId);
  const currentFilterValue = column?.getFilterValue() as string[] | undefined;
  const selectedValues = currentFilterValue || [];

  useEffect(() => {
    if (!column) return;
    if (currentFilterValue) return;

    if (options.some(option => option.defaultSelected)) {
      const defaultOptions = options
        .filter(option => option.defaultSelected)
        .map(option => option.value);
      column.setFilterValue(defaultOptions);
    } else {
      column.setFilterValue([]);
    }
  }, [column, currentFilterValue, options]);

  if (!column) return null;

  const allSelected = selectedValues.length === options.length;

  const handleToggleOption = (value: string) => {
    let newSelection: string[];
    if (selectedValues.includes(value)) {
      newSelection = selectedValues.filter(v => v !== value);
    } else {
      newSelection = [...selectedValues, value];
    }

    column.setFilterValue(newSelection);
  };

  const handleToggleAll = () => {
    if (allSelected) {
      column.setFilterValue([]);
    } else {
      column.setFilterValue(options.map(option => option.value));
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1 cursor-pointer">
          <span className="hidden md:block">{label}</span>
          <ChevronDown size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("max-h-[50dvh] overflow-y-auto", className)}>
        <div className="flex flex-col space-y-2">
          {options.map(option => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <div
                key={option.value}
                onClick={() => handleToggleOption(option.value)}
                className="flex items-center justify-between gap-6 cursor-pointer rounded hover:bg-accent transition-colors duration-200 p-1"
              >
                <div className="flex items-center gap-2">
                  {typeof option.icon === 'string' ? (
                    <img src={option.icon} alt={option.value} className="w-4 h-4" />
                  ) : isValidElement(option.icon) ? (
                    option.icon
                  ) : null}
                  <span className='text-nowrap'>{option.value}</span>
                </div>
                <div className="w-4 h-4 flex items-center justify-center">
                  {isSelected && <Check size={16} className="text-primary" />}
                </div>
              </div>
            );
          })}
          <div className="border-t pt-2">
            <Button variant="ghost" onClick={handleToggleAll} className="w-full cursor-pointer">
              {allSelected ? 'Ninguno' : 'Todos'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MultiFilterButton;
