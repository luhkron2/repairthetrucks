import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { LoadingSpinner } from "./loading-spinner"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-95 hover:shadow-lg transform will-change-transform btn-professional relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl border-0",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-400/40 shadow-lg hover:shadow-xl border-0",
        outline:
          "border-2 border-gray-300 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md dark:bg-gray-800/80 dark:border-gray-600 dark:hover:bg-gray-700/80 dark:hover:border-gray-500",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 shadow-sm hover:shadow-md dark:from-gray-700 dark:to-gray-800 dark:text-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-700",
        ghost:
          "hover:bg-gray-100/80 hover:text-gray-900 backdrop-blur-sm dark:hover:bg-gray-800/80 dark:hover:text-gray-100",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
        success: "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl border-0",
        warning: "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl border-0",
        premium: "bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 shadow-lg hover:shadow-xl border-0 animate-gradient-x",
      },
      size: {
        xs: "h-7 px-2.5 py-1 text-xs gap-1 has-[>svg]:px-2 rounded-md",
        sm: "h-8 px-3 py-1.5 text-xs gap-1.5 has-[>svg]:px-2.5 rounded-md",
        default: "h-10 px-4 py-2.5 text-sm gap-2 has-[>svg]:px-3.5 rounded-lg",
        lg: "h-12 px-6 py-3 text-base gap-2.5 has-[>svg]:px-5 rounded-lg font-semibold",
        xl: "h-14 px-8 py-4 text-lg gap-3 has-[>svg]:px-6 rounded-xl font-semibold",
        icon: "size-10 rounded-lg",
        "icon-xs": "size-7 rounded-md",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-12 rounded-lg",
        "icon-xl": "size-14 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  loadingText,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  const isDisabled = disabled || loading;

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        loading && "cursor-not-allowed"
      )}
      disabled={isDisabled}
      aria-busy={loading}
      aria-describedby={loading ? "button-loading" : undefined}
      {...props}
    >
      {loading && (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          <span id="button-loading" className="sr-only">Loading</span>
        </>
      )}
      {loading && loadingText ? loadingText : children}
    </Comp>
  )
}

export { Button, buttonVariants }
