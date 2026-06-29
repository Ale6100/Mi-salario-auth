// src\components\forms\MsgError.tsx

import { FieldError } from "../ui/field";
import type { ControllerFieldState } from "react-hook-form";

type MsgErrorProps = {
  readonly fieldState: ControllerFieldState;
}

export const MsgError = ({ fieldState }: MsgErrorProps) => {
  if (!fieldState.invalid) return null;

  return <FieldError errors={[fieldState.error]} />
}
