// src\components\select\FormatFuenteOptionLabel.tsx

type FuenteOption = { value: string; label: string; color?: string };

export const FormatFuenteOptionLabel = (option: FuenteOption) => (
  <span className="flex items-center gap-2">
    {option.color && <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: option.color }} />}
    {option.label}
  </span>
);
