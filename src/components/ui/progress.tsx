"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      variant: {
        default: "bg-secondary",
        success: "bg-emerald-100 dark:bg-emerald-900/20",
        warning: "bg-amber-100 dark:bg-amber-900/20",
        danger: "bg-rose-100 dark:bg-rose-900/20",
        info: "bg-blue-100 dark:bg-blue-900/20",
      },
      size: {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const progressBarVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-out",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        danger: "bg-rose-500",
        info: "bg-blue-500",
      },
      animated: {
        true: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      animated: false,
    },
  }
)

interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number
  max?: number
  animated?: boolean
  showValue?: boolean
  label?: string
  indeterminate?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    variant, 
    size, 
    value = 0, 
    max = 100, 
    animated = false, 
    showValue = false, 
    label,
    indeterminate = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const [displayValue, setDisplayValue] = React.useState(0)

    // Animate the value change
    React.useEffect(() => {
      if (indeterminate) return
      
      const timer = setTimeout(() => {
        setDisplayValue(percentage)
      }, 100)

      return () => clearTimeout(timer)
    }, [percentage, indeterminate])

    if (indeterminate) {
      return (
        <div className="space-y-2">
          {label && (
            <div className="flex justify-between text-sm">
              <span className="font-medium">{label}</span>
            </div>
          )}
          <div
            ref={ref}
            className={cn(progressVariants({ variant, size }), className)}
            {...props}
          >
            <div className={cn(
              "h-full animate-pulse bg-gradient-to-r",
              variant === "success" && "from-emerald-500 to-emerald-600",
              variant === "warning" && "from-amber-500 to-amber-600",
              variant === "danger" && "from-rose-500 to-rose-600",
              variant === "info" && "from-blue-500 to-blue-600",
              variant === "default" && "from-primary to-primary/80"
            )} />
            <div className={cn(
              "absolute inset-0 animate-[progress-indeterminate_1.5s_ease-in-out_infinite] bg-gradient-to-r",
              variant === "success" && "from-transparent via-emerald-400 to-transparent",
              variant === "warning" && "from-transparent via-amber-400 to-transparent",
              variant === "danger" && "from-transparent via-rose-400 to-transparent",
              variant === "info" && "from-transparent via-blue-400 to-transparent",
              variant === "default" && "from-transparent via-primary to-transparent"
            )} />
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {(label || showValue) && (
          <div className="flex justify-between text-sm">
            {label && <span className="font-medium">{label}</span>}
            {showValue && (
              <span className="text-muted-foreground">
                {Math.round(displayValue)}%
              </span>
            )}
          </div>
        )}
        <div
          ref={ref}
          className={cn(progressVariants({ variant, size }), className)}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemax={max}
          aria-label={label}
          {...props}
        >
          <div
            className={cn(progressBarVariants({ variant, animated }))}
            style={{ 
              transform: `translateX(-${100 - displayValue}%)`,
              transition: 'transform 0.5s ease-out'
            }}
          />
        </div>
      </div>
    )
  }
)

Progress.displayName = "Progress"

// Add the keyframe animation to global CSS
const progressStyles = `
@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
`

export { Progress, progressVariants, progressStyles }
export type { ProgressProps }