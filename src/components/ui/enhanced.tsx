// Advanced UI utilities and animations
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';

// Smooth loading states with skeleton screens
export function LoadingSkeleton({
  lines = 3,
  className = '',
  animate = true,
}: {
  lines?: number;
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"
          animate={animate ? { x: ['0%', '100%', '0%'] } : undefined}
          transition={{
            x: {
              repeat: Infinity,
              duration: 2,
              ease: 'linear',
            },
          }}
          style={{
            backgroundSize: '200% 100%',
          }}
        />
      ))}
    </div>
  );
}

// Enhanced button with loading states and ripple effects
export function EnhancedButton({
  children,
  loading = false,
  variant = 'primary',
  size = 'md',
  disabled = false,
  ripple = true,
  className = '',
  onClick,
  ...otherProps
}: {
  children: React.ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  ripple?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const createRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ripple || loading) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  }, [ripple, loading]);

  const baseClasses = [
    'relative overflow-hidden font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  ];

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const classes = [
    ...baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    (disabled || loading) && 'cursor-not-allowed opacity-75',
    className,
  ].join(' ');

  return (
    <button
      ref={buttonRef}
      className={classes}
      onClick={(e) => {
        createRipple(e);
        onClick?.(e);
      }}
      disabled={disabled || loading}
      {...otherProps}
    >
      <AnimatePresence>
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!loading && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white opacity-30 rounded-full pointer-events-none"
            initial={{
              width: 0,
              height: 0,
              x: ripple.x,
              y: ripple.y,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              width: 100,
              height: 100,
              x: ripple.x - 50,
              y: ripple.y - 50,
              scale: 1,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}

// Smooth notifications with auto-dismiss
export function Notification({
  message,
  type = 'info',
  duration = 5000,
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`
        fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border
        shadow-lg max-w-sm cursor-pointer
        ${typeStyles[type]}
      `}
      onClick={onClose}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-xl font-bold">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-xl leading-none opacity-60 hover:opacity-100"
      >
        ×
      </button>
    </motion.div>
  );
}

// Advanced card with hover effects
export function AdvancedCard({
  children,
  hover = true,
  glass = false,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  hover?: boolean;
  glass?: boolean;
  className?: string;
} & MotionProps) {
  const baseClasses = [
    'rounded-xl border shadow-lg overflow-hidden',
  ];

  const hoverClasses = hover ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1' : '';
  const glassClasses = glass ? 'backdrop-blur-md bg-white/80 border-white/20' : 'bg-white';

  const classes = [
    ...baseClasses,
    hoverClasses,
    glassClasses,
    className,
  ].join(' ');

  return (
    <motion.div
      className={classes}
      whileHover={hover ? { y: -4 } : undefined}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

// Smooth transitions for route changes
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

// Responsive grid with smooth reflows
export function ResponsiveGrid({
  children,
  cols = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = 4,
  className = '',
}: {
  children: React.ReactNode;
  cols?: { default?: number; sm?: number; lg?: number; xl?: number };
  gap?: number;
  className?: string;
}) {
  const gridClasses = [
    'grid',
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    `gap-${gap}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={gridClasses}
      layout
      layoutScroll
    >
      {children}
    </motion.div>
  );
}

// Smooth progress bar
export function SmoothProgressBar({
  value,
  max = 100,
  color = 'blue',
  animated = true,
  showLabel = true,
  size = 'md',
}: {
  value: number;
  max?: number;
  color?: 'blue' | 'green' | 'red' | 'yellow';
  animated?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <motion.div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 0.5 : 0, 
            ease: 'easeOut' 
          }}
        />
      </div>
    </div>
  );
}