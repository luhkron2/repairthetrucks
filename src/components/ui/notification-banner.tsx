"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react"

const bannerVariants = cva(
  "relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 border-l-4",
  {
    variants: {
      variant: {
        default: "bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100",
        success: "bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100",
        warning: "bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100",
        destructive: "bg-rose-50 border-rose-500 text-rose-900 dark:bg-rose-950/50 dark:text-rose-100",
      },
      position: {
        top: "fixed top-0 left-0 right-0 z-50 rounded-none border-l-0 border-b-4",
        bottom: "fixed bottom-0 left-0 right-0 z-50 rounded-none border-l-0 border-t-4",
        inline: "rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "inline",
    },
  }
)

const iconMap = {
  default: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  destructive: AlertCircle,
}

interface NotificationBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  onDismiss?: () => void
  icon?: React.ReactNode
  autoHide?: boolean
  autoHideDelay?: number
}

const NotificationBanner = React.forwardRef<HTMLDivElement, NotificationBannerProps>(
  ({
    className,
    variant = "default",
    position = "inline",
    title,
    description,
    action,
    dismissible = true,
    onDismiss,
    icon,
    autoHide = false,
    autoHideDelay = 5000,
    children,
    ...props
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)
    const [isAnimating, setIsAnimating] = React.useState(false)

    const handleDismiss = React.useCallback(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, 200)
    }, [onDismiss])

    const IconComponent = iconMap[variant || "default"]

    React.useEffect(() => {
      if (autoHide && autoHideDelay > 0) {
        const timer = setTimeout(() => {
          handleDismiss()
        }, autoHideDelay)

        return () => clearTimeout(timer)
      }
    }, [autoHide, autoHideDelay, handleDismiss])

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(
          bannerVariants({ variant, position }),
          isAnimating && "animate-out slide-out-to-top-full duration-200",
          "animate-in slide-in-from-top-full duration-300",
          className
        )}
        role="alert"
        aria-live="polite"
        {...props}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          {icon || <IconComponent className="h-5 w-5" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-semibold">
              {title}
            </div>
          )}
          {description && (
            <div className={cn("text-sm opacity-90", title && "mt-1")}>
              {description}
            </div>
          )}
          {children && !title && !description && (
            <div>{children}</div>
          )}
        </div>

        {/* Action Button */}
        {action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            className={cn(
              "ml-3 h-8 px-3 text-xs font-medium",
              variant === "default" && "text-blue-900 hover:bg-blue-100 dark:text-blue-100 dark:hover:bg-blue-900",
              variant === "success" && "text-emerald-900 hover:bg-emerald-100 dark:text-emerald-100 dark:hover:bg-emerald-900",
              variant === "warning" && "text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900",
              variant === "destructive" && "text-rose-900 hover:bg-rose-100 dark:text-rose-100 dark:hover:bg-rose-900"
            )}
          >
            {action.label}
          </Button>
        )}

        {/* Dismiss Button */}
        {dismissible && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className={cn(
              "ml-2 h-6 w-6 p-0 opacity-70 hover:opacity-100",
              variant === "default" && "text-blue-900 hover:bg-blue-100 dark:text-blue-100 dark:hover:bg-blue-900",
              variant === "success" && "text-emerald-900 hover:bg-emerald-100 dark:text-emerald-100 dark:hover:bg-emerald-900",
              variant === "warning" && "text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900",
              variant === "destructive" && "text-rose-900 hover:bg-rose-100 dark:text-rose-100 dark:hover:bg-rose-900"
            )}
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Auto-hide progress bar */}
        {autoHide && autoHideDelay > 0 && (
          <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 animate-[progress_5s_linear]" 
               style={{ 
                 animationDuration: `${autoHideDelay}ms`,
                 width: '100%'
               }} />
        )}
      </div>
    )
  }
)

NotificationBanner.displayName = "NotificationBanner"

export { NotificationBanner, bannerVariants }
export type { NotificationBannerProps }
