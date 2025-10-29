'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/language-toggle';
import { useTranslation } from '@/components/translation-provider';
import { Home, FileText, Wrench, Settings, Menu, X, Moon, Sun, Phone, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { useTheme } from 'next-themes';

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

  // Define driver-facing routes where translation should be available
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
    <header className="sticky top-0 z-50 shadow-lg shadow-slate-900/5" suppressHydrationWarning>
      <div className="hidden border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-blue-50/50 py-2 text-xs font-semibold text-slate-600 backdrop-blur md:block dark:border-slate-800/80 dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-800/50 dark:text-slate-300" suppressHydrationWarning>
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-6 px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm dark:bg-slate-800/60 dark:text-slate-200" suppressHydrationWarning>
            <Phone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            {t.nav.hotlinePhone}
          </span>
          <span className="hidden rounded-full bg-blue-600/10 px-3 py-1 text-xs font-bold text-blue-700 lg:inline dark:bg-blue-500/20 dark:text-blue-300" suppressHydrationWarning>{t.nav.hotlineBadge}</span>
        </div>
      </div>
      <nav className="nav-professional border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90" suppressHydrationWarning>
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3 rounded-xl p-2 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <Logo size="sm" variant="icon" className="md:hidden" />
            <Logo size="md" className="hidden md:inline-flex" />
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-2 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-700 shadow-inner ring-1 ring-blue-600/20 dark:from-blue-500/20 dark:to-indigo-500/20 dark:text-blue-200 dark:ring-blue-500/30'
                      : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 hover:text-slate-900 hover:shadow-sm dark:text-slate-300 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 dark:hover:text-white'
                  )}
                  suppressHydrationWarning
                >
                  <Icon className={cn(
                    'h-4 w-4 transition-transform duration-300',
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'group-hover:scale-110'
                  )} />
                  {translate(t.nav[item.key])}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link href="/report">
              <Button className="group h-11 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-6 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 dark:from-blue-500 dark:via-blue-500 dark:to-indigo-400" suppressHydrationWarning>
                <FileText className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                {t.nav.reportCta}
              </Button>
            </Link>
            {isDriverRoute && <LanguageToggle />}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleTheme}
              className="h-11 w-11 rounded-xl border border-slate-200/60 bg-white/60 p-0 text-slate-600 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Toggle theme"
              suppressHydrationWarning
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
              className="h-9 w-9 rounded-full p-0"
              aria-label="Toggle theme"
              suppressHydrationWarning
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
              className="h-9 w-9 rounded-full p-0"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200/70 bg-white/95 px-4 py-4 shadow-lg shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950/90 md:hidden">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-base font-medium transition',
                      isActive
                        ? 'bg-blue-600/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/70 dark:hover:text-white'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                    suppressHydrationWarning
                  >
                    <item.icon className="h-5 w-5" />
                    {translate(t.nav[item.key])}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/report" onClick={() => setMobileMenuOpen(false)}>
                <Button className="h-11 w-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-sm font-semibold text-white" suppressHydrationWarning>
                  {t.nav.reportCta}
                </Button>
              </Link>
              <Button
                variant="outline"
                className="h-11 w-full rounded-full border-slate-200 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200"
                onClick={() => {
                  handleToggleTheme();
                  setMobileMenuOpen(false);
                }}
              >
                {mounted && resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
