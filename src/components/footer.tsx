'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/translation-provider';

export function Footer({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { footer } = t;

  return (
    <footer
      className={cn(
        'border-t border-slate-200/80 bg-white/90 py-12 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300',
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <Logo size="md" />
              <span className="text-base font-semibold tracking-wide text-slate-700 dark:text-slate-200">
                Strategic Equipment Repairs
              </span>
            </Link>
            <p>{footer.description}</p>
          </div>
          <div className="grid flex-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {footer.columns.map((column) => (
              <div key={column.title} className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
                  {column.title}
                </p>
                <ul className="space-y-2 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="transition hover:text-blue-600 dark:hover:text-blue-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-slate-200/70 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} SE Repairs. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/features#security" className="transition hover:text-blue-600 dark:hover:text-blue-300">
              {footer.legal.security}
            </Link>
            <Link href="/report#support" className="transition hover:text-blue-600 dark:hover:text-blue-300">
              {footer.legal.support}
            </Link>
            <Link href="/report" className="transition hover:text-blue-600 dark:hover:text-blue-300">
              {footer.legal.incident}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
