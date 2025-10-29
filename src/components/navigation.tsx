'use client';

import { useTranslation } from '@/components/translation-provider';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ComponentType, SVGProps, useEffect, useState } from 'react';

import { LanguageToggle } from '@/components/language-toggle';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import {
  Activity,
  FileText,
  Home,
  Menu,
  Moon,
  Phone,
  Settings,
  Sun,
  Wrench,
  X,
} from 'lucide-react';

type NavItem = {
  key: 'home' | 'report' | 'workshop' | 'operations' | 'troubleshoot';
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { key: 'home', href: '/', icon: Home },
  { key: 'report', href: '/report', icon: FileText },
  { key: 'workshop', href: '/workshop', icon: Wrench },
  { key: 'operations', href: '/operations', icon: Settings },
  { key: 'troubleshoot', href: '/troubleshoot', icon: Activity },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t, translate } = useTranslation();

  const driverRoutes = ['/', '/report', '/troubleshoot'];
  const isDriverRoute = driverRoutes.includes(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleTheme = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-md shadow-slate-900/5 dark:bg-slate-950/80 dark:shadow-slate-900/10">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3 rounded-xl p-2 transition-all duration-300">
          <Logo size="sm" variant="icon" className="md:hidden" />
          <Logo size="md" className="hidden md:inline-flex" />
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-4 md:flex">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'group flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300',
                  isActive
                    ? 'bg-blue-600/10 text-blue-700 shadow-inner ring-1 ring-blue-600/20 dark:bg-blue-500/20 dark:text-blue-200 dark:ring-blue-500/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white',
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-300',
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'group-hover:scale-110',
                  )}
                />
                {translate(t.nav[item.key])}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm dark:bg-slate-800/70 dark:text-slate-200">
            <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            {t.nav.hotlinePhone}
          </span>
          {isDriverRoute && <LanguageToggle />}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleTheme}
            className="h-11 w-11 rounded-full border border-slate-200/80 bg-white/80 p-0 text-slate-600 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Toggle theme"
          >
            <div suppressHydrationWarning>
              {!mounted ? (
                <Moon className="h-5 w-5" />
              ) : resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </div>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {isDriverRoute && <LanguageToggle />}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleTheme}
            className="h-10 w-10 rounded-full p-0"
            aria-label="Toggle theme"
          >
            <div suppressHydrationWarning>
              {!mounted ? (
                <Moon className="h-5 w-5" />
              ) : resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </div>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-10 w-10 rounded-full p-0"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200/80 bg-white/95 px-4 py-6 shadow-lg dark:border-slate-800/80 dark:bg-slate-950/95 md:hidden">
          <div className="space-y-2">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-4 rounded-lg px-4 py-3 text-lg font-semibold transition',
                    isActive
                      ? 'bg-blue-600/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/70 dark:hover:text-white',
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-6 w-6" />
                  {translate(t.nav[item.key])}
                </Link>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/report" onClick={() => setMobileMenuOpen(false)}>
              <Button className="h-12 w-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-base font-bold text-white">
                {t.nav.reportCta}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}