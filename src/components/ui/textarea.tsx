import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
  {
    variants: {
      variant: {
        default: "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30",
        success: "border-emerald-500 placeholder:text-emerald-600/70 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20",
        error: "border-destructive placeholder:text-destructive/70 focus-visible:border-destructive focus-visible:ring-destructive/20 bg-destructive/5 dark:bg-destructive/10",
        warning: "border-amber-500 placeholder:text-amber-600/70 focus-visible:border-amber-500 focus-visible:ring-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20",
      },
      size: {
        default: "min-h-16 text-sm",
        sm: "min-h-12 text-xs px-2 py-1.5",
        lg: "min-h-24 text-base px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: string
  success?: string
  warning?: string
  showCharCount?: boolean
  maxLength?: number
  label?: string
  description?: string
  autoResize?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant,
    size,
    error,
    success,
    warning,
    showCharCount,
    maxLength,
    label,
    description,
    autoResize = false,
    value,
    onChange,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || "")
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    
    // Use forwarded ref or internal ref
    const resolvedRef = ref || textareaRef

    // Auto-resize functionality
    React.useEffect(() => {
      if (autoResize && resolvedRef && 'current' in resolvedRef && resolvedRef.current) {
        const textarea = resolvedRef.current
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [internalValue, autoResize, resolvedRef])

    // Determine variant based on validation states
    const currentVariant = error ? "error" : success ? "success" : warning ? "warning" : variant

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      onChange?.(e)
    }

    const currentValue = value !== undefined ? value : internalValue
    const charCount = String(currentValue).length
    const isOverLimit = maxLength ? charCount > maxLength : false

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}

        <div className="relative">
          <textarea
            ref={resolvedRef}
            className={cn(
              textareaVariants({ variant: currentVariant, size }),
              autoResize && "resize-none overflow-hidden",
              "focus-visible:ring-[3px]",
              className
            )}
            value={currentValue}
            onChange={handleChange}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${props.id}-error` : 
              success ? `${props.id}-success` : 
              warning ? `${props.id}-warning` : 
              description ? `${props.id}-description` : undefined
            }
            {...props}
          />

          {/* Character count */}
          {(showCharCount || maxLength) && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              <span className={cn(
                "transition-colors",
                isOverLimit && "text-destructive font-medium"
              )}>
                {charCount}
                {maxLength && `/${maxLength}`}
              </span>
            </div>
          )}
        </div>

        {/* Validation messages */}
        {error && (
          <p 
            id={`${props.id}-error`}
            className="text-sm text-destructive animate-in slide-in-from-top-1 duration-200"
          >
            {error}
          </p>
        )}
        
        {success && !error && (
          <p 
            id={`${props.id}-success`}
            className="text-sm text-emerald-600 dark:text-emerald-400 animate-in slide-in-from-top-1 duration-200"
          >
            {success}
          </p>
        )}
        
        {warning && !error && !success && (
          <p 
            id={`${props.id}-warning`}
            className="text-sm text-amber-600 dark:text-amber-400 animate-in slide-in-from-top-1 duration-200"
          >
            {warning}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
