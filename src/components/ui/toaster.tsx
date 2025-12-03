"use client"

import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts, removeToast } = useToast()

  return (
    <>
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map(({ id, title, description }) => (
          <div
            key={id}
            className="bg-white border rounded-lg shadow-md p-4 w-80 animate-in fade-in slide-in-from-right duration-300"
          >
            {title && (
              <div className="font-semibold text-black mb-1">
                {title}
              </div>
            )}

            {description && (
              <div className="text-sm text-gray-700">
                {description}
              </div>
            )}

            <button
              onClick={() => removeToast(id)}
              className="mt-3 text-sm text-red-500"
            >
              Close
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
