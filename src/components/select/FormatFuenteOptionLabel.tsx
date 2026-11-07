// src\components\select\FormatFuenteOptionLabel.tsx

import { FuenteBadge } from "@/components/ui/FuenteBadge";

type FuenteOption = { value: string; label: string; color?: string };

export const FormatFuenteOptionLabel = (option: FuenteOption) => (
  <span className="inline-flex items-center py-0.5">
    <FuenteBadge nombre={option.label || option.value} color={option.color} />
  </span>
);
