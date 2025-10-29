import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "relative overflow-hidden rounded-2xl border bg-card/95 text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        glass:
          "border-white/40 bg-white/40 backdrop-blur-2xl shadow-[0_20px_45px_-20px_rgba(15,23,42,0.35)] dark:border-slate-800/40 dark:bg-slate-950/35",
        elevated:
          "shadow-[0_20px_65px_-28px_rgba(37,99,235,0.45)] bg-gradient-to-br from-white/95 via-white to-blue-50/80 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950",
        outline:
          "border-dashed border-slate-300/70 bg-card/80 shadow-none dark:border-slate-700/70"
      },
      status: {
        neutral: "border-slate-200/70 dark:border-slate-800/70",
        info: "border-blue-200/70 dark:border-blue-800/70",
        success: "border-emerald-200/70 dark:border-emerald-800/70",
        warning: "border-amber-200/70 dark:border-amber-800/70",
        danger: "border-rose-200/70 dark:border-rose-800/70"
      },
      interactive: {
        true: "hover:-translate-y-1 hover:shadow-xl focus-visible:-translate-y-1 focus-visible:shadow-xl",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      status: "neutral",
      interactive: true
    }
  }
)

type CardStatus = "neutral" | "info" | "success" | "warning" | "danger"

const statusAccent: Record<CardStatus, string> = {
  neutral: "bg-slate-300 dark:bg-slate-600",
  info: "bg-blue-500 dark:bg-blue-400",
  success: "bg-emerald-500 dark:bg-emerald-400",
  warning: "bg-amber-500 dark:bg-amber-400",
  danger: "bg-rose-500 dark:bg-rose-400"
}

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  glow?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      status,
      interactive,
      glow = false,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, status, interactive }),
        glow &&
          "before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/10 before:via-transparent before:to-purple-500/20",
        "after:pointer-events-none after:absolute after:inset-[-1px] after:rounded-[inherit] after:border after:border-white/20 dark:after:border-white/5",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  status?: CardStatus
  supportingText?: string
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, status, supportingText, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-2 p-6 pb-4",
        status && "pr-10",
        className
      )}
      {...props}
    >
      {status ? (
        <span
          className={cn(
            "absolute right-6 top-6 inline-flex h-3 w-3 animate-pulse rounded-full",
            statusAccent[status]
          )}
          aria-hidden
        />
      ) : null}
      {children}
      {supportingText ? (
        <p className="text-sm text-muted-foreground/80">{supportingText}</p>
      ) : null}
    </div>
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-lg font-semibold tracking-tight text-foreground sm:text-xl",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm leading-relaxed text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0 text-sm leading-6 text-muted-foreground", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-3 border-t border-border/60 p-6 pt-4",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export type { CardProps, CardStatus, CardHeaderProps }

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
