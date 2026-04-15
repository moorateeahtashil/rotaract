"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"

type ToastVariant = "default" | "destructive" | "success" | "warning"

const VARIANT_ICON: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-[#009739] flex-shrink-0" />,
  destructive: <XCircle className="h-5 w-5 text-[#e02927] flex-shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-[#f7a81b] flex-shrink-0" />,
  default: <Info className="h-5 w-5 text-[#17458f] flex-shrink-0" />,
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={5000}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const v = (variant ?? "default") as ToastVariant
        const icon = VARIANT_ICON[v] ?? VARIANT_ICON.default

        return (
          <Toast key={id} variant={variant} {...props}>
            {/* Colored icon */}
            <div className="flex-shrink-0 mt-0.5">{icon}</div>

            {/* Text content */}
            <div className="grid gap-0.5 flex-1 min-w-0">
              {title && (
                <ToastTitle className="text-sm font-semibold leading-snug">
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className="text-xs opacity-80 leading-snug">
                  {description}
                </ToastDescription>
              )}
            </div>

            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
