"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Plus, X } from "lucide-react"

const fabVariants = cva(
  "fixed z-50 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success: "bg-emerald-500 text-white hover:bg-emerald-600",
      },
      size: {
        default: "h-14 w-14",
        sm: "h-12 w-12",
        lg: "h-16 w-16",
      },
      position: {
        "bottom-right": "bottom-6 right-6",
        "bottom-left": "bottom-6 left-6",
        "top-right": "top-6 right-6",
        "top-left": "top-6 left-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      position: "bottom-right",
    },
  }
)

interface FloatingActionButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof fabVariants> {
  icon?: React.ReactNode
  expandable?: boolean
  actions?: Array<{
    icon: React.ReactNode
    label: string
    onClick: () => void
    variant?: "default" | "secondary" | "destructive" | "success"
  }>
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, variant, size, position, icon, expandable = false, actions = [], children, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = React.useState(false)

    const toggleExpanded = () => {
      if (expandable && actions.length > 0) {
        setIsExpanded(!isExpanded)
      }
    }

    const handleMainClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (expandable && actions.length > 0) {
        e.preventDefault()
        toggleExpanded()
      } else {
        props.onClick?.(e)
      }
    }

    return (
      <>
        {/* Backdrop for expanded state */}
        {isExpanded && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm w-full h-full border-0 cursor-default"
            onClick={() => setIsExpanded(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsExpanded(false);
            }}
            aria-label="Close menu"
          />
        )}

        {/* Action buttons */}
        {isExpanded && actions.length > 0 && (
          <div className="fixed z-50" style={{ 
            bottom: position?.includes('bottom') ? '6rem' : 'auto',
            top: position?.includes('top') ? '6rem' : 'auto',
            right: position?.includes('right') ? '1.5rem' : 'auto',
            left: position?.includes('left') ? '1.5rem' : 'auto',
          }}>
            <div className="flex flex-col gap-3">
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {position?.includes('right') && (
                    <span className="rounded-lg bg-background/90 backdrop-blur-sm px-3 py-2 text-sm font-medium text-foreground shadow-lg border">
                      {action.label}
                    </span>
                  )}
                  <Button
                    size="icon"
                    variant={action.variant || "default"}
                    className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl"
                    onClick={() => {
                      action.onClick()
                      setIsExpanded(false)
                    }}
                  >
                    {action.icon}
                  </Button>
                  {position?.includes('left') && (
                    <span className="rounded-lg bg-background/90 backdrop-blur-sm px-3 py-2 text-sm font-medium text-foreground shadow-lg border">
                      {action.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main FAB */}
        <button
          ref={ref}
          className={cn(fabVariants({ variant, size, position }), className)}
          onClick={handleMainClick}
          aria-label={expandable ? (isExpanded ? "Close menu" : "Open menu") : "Action button"}
          aria-expanded={expandable ? isExpanded : undefined}
          {...props}
        >
          {expandable && actions.length > 0 ? (
            <div className={cn("transition-transform duration-200", isExpanded && "rotate-45")}>
              {isExpanded ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </div>
          ) : (
            icon || children
          )}
        </button>
      </>
    )
  }
)

FloatingActionButton.displayName = "FloatingActionButton"

export { FloatingActionButton, fabVariants }
export type { FloatingActionButtonProps }