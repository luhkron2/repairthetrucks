import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 md:text-sm",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:ring-ring",
        success: "border-emerald-500 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600",
        error: "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive",
        warning: "border-amber-500 focus-visible:ring-amber-500/20 focus-visible:border-amber-600",
      },
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-8 px-2.5 py-1.5 text-sm",
        lg: "h-12 px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  error?: string
  success?: string
  loading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, startIcon, endIcon, error, success, loading, ...props }, ref) => {
    // Determine variant based on validation state
    const currentVariant = error ? "error" : success ? "success" : variant

    const inputElement = (
      <input
        type={type}
        className={cn(
          inputVariants({ variant: currentVariant, size }),
          startIcon && "pl-10",
          endIcon && "pr-10",
          loading && "pr-10",
          "peer",
          className
        )}
        ref={ref}
        {...props}
      />
    )

    if (startIcon || endIcon || loading) {
      return (
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground peer-focus:text-foreground transition-colors">
              {startIcon}
            </div>
          )}
          {inputElement}
          {(endIcon || loading) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              ) : (
                endIcon
              )}
            </div>
          )}
          {error && (
            <p className="mt-1 text-sm text-destructive animate-in slide-in-from-top-1 duration-200">
              {error}
            </p>
          )}
          {success && !error && (
            <p className="mt-1 text-sm text-emerald-600 animate-in slide-in-from-top-1 duration-200">
              {success}
            </p>
          )}
        </div>
      )
    }

    return (
      <div>
        {inputElement}
        {error && (
          <p className="mt-1 text-sm text-destructive animate-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
        {success && !error && (
          <p className="mt-1 text-sm text-emerald-600 animate-in slide-in-from-top-1 duration-200">
            {success}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
