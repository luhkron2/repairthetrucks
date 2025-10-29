import { cn } from '@/lib/utils';
import Image from 'next/image';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
type LogoVariant = 'full' | 'icon' | 'text';

interface LogoProps {
  className?: string;
  size?: LogoSize;
  variant?: LogoVariant;
}

const logoSizing: Record<LogoSize, { width: number; height: number; className: string }> = {
  sm: { width: 120, height: 36, className: 'h-9' },
  md: { width: 160, height: 48, className: 'h-12' },
  lg: { width: 200, height: 60, className: 'h-15' },
  xl: { width: 240, height: 72, className: 'h-18' },
};

const iconSizing: Record<LogoSize, { size: number; className: string }> = {
  sm: { size: 32, className: 'h-8 w-8' },
  md: { size: 40, className: 'h-10 w-10' },
  lg: { size: 48, className: 'h-12 w-12' },
  xl: { size: 56, className: 'h-14 w-14' },
};

const textSizing: Record<LogoSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

function IconMark({ size, className }: { size: LogoSize; className?: string }) {
  const iconSize = iconSizing[size];
  
  return (
    <div className={cn('relative', iconSize.className, className)}>
      <Image
        src="/favicon.svg"
        alt="SE Repairs Icon"
        width={iconSize.size}
        height={iconSize.size}
        className="w-full h-full object-contain"
        priority
      />
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
          'font-semibold tracking-tight text-slate-900 dark:text-slate-100',
          textSizing[size],
          className,
        )}
      >
        SE Repairs
      </span>
    );
  }

  const logoSize = logoSizing[size];

  return (
    <div className={cn('relative', logoSize.className, className)}>
      <Image
        src="/logo.svg"
        alt="SE Repairs - Fleet Management & Repair Solutions"
        width={logoSize.width}
        height={logoSize.height}
        className="w-auto h-full object-contain"
        priority
      />
    </div>
  );
}

