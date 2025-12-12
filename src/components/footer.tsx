'use client';

import { useTranslation } from '@/components/translation-provider';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { Facebook, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

export function Footer({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { footer } = t;

  return (
    <footer
      className={cn(
        'border-t border-slate-200/80 bg-white py-16 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300',
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-3">
                <Logo size="md" />
                <span className="text-lg font-bold tracking-wide text-slate-800 dark:text-slate-100">
                  SE Repairs
                </span>
              </Link>
              <p className="text-base text-slate-500 dark:text-slate-400">{footer.description}</p>
              <div className="flex items-center gap-4 pt-2">
                <Link href="/" aria-label="Twitter" className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <Twitter className="h-6 w-6" />
                </Link>
                <Link href="/" aria-label="Facebook" className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <Facebook className="h-6 w-6" />
                </Link>
                <Link href="/" aria-label="LinkedIn" className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <Linkedin className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
          <div className="md:col-span-8">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {footer.columns.map(column => (
                <div key={column.title} className="space-y-4">
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {column.title}
                  </p>
                  <ul className="space-y-3 text-base">
                    {column.links.map(link => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="transition hover:text-blue-600 dark:hover:text-blue-400"
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
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-slate-200/80 pt-8 text-base text-slate-500 dark:border-slate-800/80 dark:text-slate-400 md:flex-row">
          <p>&copy; {new Date().getFullYear()} SE Repairs. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/features#security" className="transition hover:text-blue-600 dark:hover:text-blue-400">
              {footer.legal.security}
            </Link>
            <Link href="/report#support" className="transition hover:text-blue-600 dark:hover:text-blue-400">
              {footer.legal.support}
            </Link>
            <Link href="/report" className="transition hover:text-blue-600 dark:hover:text-blue-400">
              {footer.legal.incident}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}