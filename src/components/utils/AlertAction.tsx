// src\components\utils\AlertAction.tsx

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useState, type JSX, type ReactNode } from "react"

export type BtnAlertActionConfig = {
  readonly text?: string
  readonly className?: string
  readonly onClick?: () => Promise<void>
}

interface AlertActionProps {
  readonly isOpen: boolean
  readonly onOpenChange: (isOpen: boolean) => void
  readonly title: string
  readonly component?: ReactNode
  readonly configBtnAccept?: BtnAlertActionConfig
  readonly configBtnCancel?: BtnAlertActionConfig
  readonly btnsDisabled?: boolean
}

const configBtnAcceptDefault: BtnAlertActionConfig = {
  text: "Continuar",
  className: undefined,
}

const configBtnCancelDefault: BtnAlertActionConfig = {
  text: "Cancelar",
  className: undefined,
}

/**
 * Un componente Alert
 * Ofrece opciones personalizables para aceptar y continuar o cancelar.
 * Acepta un componente personalizado como contenido.
 *
 * @component
 *
 * @param {AlertActionProps} props - Las propiedades del componente.
 * @param {boolean} props.isOpen - Estado que controla si la alerta está abierta o cerrada.
 * @param {(isOpen: boolean) => void} props.onOpenChange - Callback que se invoca cuando el usuario cierra la alerta.
 * @param {string} props.title - El título de la alerta.
 * @param {ReactNode} props.component - El componente que se renderizará como contenido de la alerta.
 * @param {BtnAlertActionConfig} [props.configBtnAccept] - Configuración del botón de aceptar.
 * @param {BtnAlertActionConfig} [props.configBtnCancel] - Configuración del botón de cancelar.
 * @param {boolean} [props.btnsDisabled=false] - Estado que deshabilitará los botones cuando sea true.
 *
 * @returns {JSX.Element} El componente de alerta renderizado.
 */
export default function AlertAction({
  isOpen,
  onOpenChange,
  title,
  component = <></>,
  configBtnAccept = {},
  configBtnCancel = {},
  btnsDisabled = false,
}: AlertActionProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<"btnCancel" | "btnAccept" | null>(null)

  const mergedConfigBtnAccept = {
    text: configBtnAccept.text ?? configBtnAcceptDefault.text,
    className: configBtnAccept.className ?? configBtnAcceptDefault.className,
    onClick: configBtnAccept.onClick ?? configBtnAcceptDefault.onClick,
  }

  const mergedConfigBtnCancel = {
    text: configBtnCancel.text ?? configBtnCancelDefault.text,
    className: configBtnCancel.className ?? configBtnCancelDefault.className,
    onClick: configBtnCancel.onClick ?? configBtnCancelDefault.onClick,
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-lg bg-card text-card-foreground border-border shadow-lg">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-xl font-semibold text-card-foreground">{title}</AlertDialogTitle>
          <div className="text-base text-muted-foreground leading-relaxed">{component}</div>
          <AlertDialogDescription className="hidden"></AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex w-full justify-between gap-2 sm:gap-4">
            <Button
              variant="destructive"
              disabled={btnsDisabled || Boolean(isLoading)}
              className={cn(
                "cursor-pointer font-medium transition-all duration-200 flex items-center justify-center shadow-sm",
                isLoading === "btnCancel" ? "opacity-80" : "",
                mergedConfigBtnCancel.className,
              )}
              onClick={async (e) => {
                e.preventDefault()
                setIsLoading("btnCancel")
                try {
                  await mergedConfigBtnCancel.onClick?.()
                } catch {
                  /**/
                }
                setIsLoading(null)
                onOpenChange(false)
              }}
            >
              {isLoading === "btnCancel" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mergedConfigBtnCancel.text}
            </Button>
            <Button
              variant="default"
              disabled={btnsDisabled || Boolean(isLoading)}
              className={cn(
                "cursor-pointer font-medium transition-all duration-200 flex items-center justify-center mt-2 sm:mt-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
                isLoading === "btnAccept" ? "opacity-80" : "",
                mergedConfigBtnAccept.className,
              )}
              onClick={async (e) => {
                e.preventDefault()
                setIsLoading("btnAccept")
                try {
                  await mergedConfigBtnAccept.onClick?.()
                } catch {
                  /**/
                }
                setIsLoading(null)
                onOpenChange(false)
              }}
            >
              {isLoading === "btnAccept" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mergedConfigBtnAccept.text}
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
