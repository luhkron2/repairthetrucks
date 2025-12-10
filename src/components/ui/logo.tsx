import { cn } from '@/lib/utils';
import { Wrench } from 'lucide-react';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
type LogoVariant = 'full' | 'icon' | 'text';

interface LogoProps {
  className?: string;
  size?: LogoSize;
  variant?: LogoVariant;
}

const iconSizing: Record<LogoSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-12 w-12',
};

const textSizing: Record<LogoSize, string> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

const containerSizing: Record<LogoSize, string> = {
  sm: 'gap-2',
  md: 'gap-2.5',
  lg: 'gap-3',
  xl: 'gap-4',
};

function IconMark({ size, className }: { size: LogoSize; className?: string }) {
  return (
    <div className={cn(
      'flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg',
      iconSizing[size],
      className
    )}>
      <Wrench className={cn('text-white', iconSizing[size])} />
    </div>
  );
}

export function Logo({ className, size = 'md', variant = 'full' }: LogoProps) {
  if (variant === 'icon') {
    return <IconMark size={size} className={className} />;
  }

  if (variant === 'text') {
    return (
      <span
        className={cn(
          'font-bold tracking-tight text-slate-900 dark:text-white',
          textSizing[size],
          className,
        )}
      >
        SE Repairs
      </span>
    );
  }

  return (
    <div className={cn('flex items-center', containerSizing[size], className)}>
      <IconMark size={size} />
      <span
        className={cn(
          'font-bold tracking-tight text-slate-900 dark:text-white',
          textSizing[size],
        )}
      >
        SE Repairs
      </span>
    </div>
  );
}

