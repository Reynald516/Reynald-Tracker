import * as React from "react"
import { cn } from "@/lib/utils"

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-start gap-2 rounded-md border p-4 shadow-lg",
      props.className
    )}
    {...props}
  />
))
Toast.displayName = "Toast"

export const ToastTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="font-semibold">{children}</p>
)

export const ToastDescription = ({
  children,
}: {
  children: React.ReactNode
}) => <p className="text-sm opacity-90">{children}</p>

export const ToastClose = (props: any) => (
  <button
    className="ml-auto text-sm opacity-50 hover:opacity-100"
    {...props}
  >
    ✕
  </button>
)

export const ToastViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed bottom-4 right-4 flex flex-col gap-2 z-50",
      props.className
    )}
    {...props}
  />
))
ToastViewport.displayName = "ToastViewport"

export { Toast }