import Link from 'next/link';
import type { Metadata } from 'next';
import type { ComponentType } from 'react';
import { Truck, ClipboardCheck, Calendar, PhoneCall } from 'lucide-react';

import { DashboardClient } from '@/components/dashboard-client';
import { FloatingActionWrapper } from '@/components/floating-action-wrapper';
import { Navigation } from '@/components/navigation';

const actions: Array<{ href: string; label: string; sublabel?: string; icon: ComponentType<{ className?: string }> }> = [
  {
    href: '/report',
    label: 'Report downtime',
    sublabel: 'Log an issue with photos',
    icon: Truck,
  },
  {
    href: '/issues',
    label: 'My repair tickets',
    sublabel: 'Track what you have lodged',
    icon: ClipboardCheck,
  },
  {
    href: '/schedule',
    label: 'Workshop schedule',
    sublabel: 'See booked repair windows',
    icon: Calendar,
  },
  {
    href: '/report#support',
    label: 'Contact operations',
    sublabel: 'Call for immediate support',
    icon: PhoneCall,
  },
];

export const metadata: Metadata = {
  title: 'SE National — Repair Control',
  description: 'Central console for intake, live operations and workshop coordination across the network.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navigation />
      <main className="container mx-auto max-w-6xl px-6 py-12 pb-20">
        <header className="mb-12 space-y-4 animate-slide-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            SE National
          </div>
          <h1 className="text-display-2 font-bold tracking-tight text-slate-900 dark:text-slate-100">Repair Control</h1>
          <p className="text-subheadline max-w-2xl">
            Professional fleet management system for logging downtime, tracking repair tickets, managing workshop schedules, and coordinating operations across the network.
          </p>
        </header>

        <section className="mb-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {actions.map((a, index) => (
              <Link
                key={a.href}
                href={a.href}
                prefetch
                className="dashboard-card group p-6 animate-fade-in-scale"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg transition-transform group-hover:scale-110 dark:from-blue-400 dark:to-indigo-500">
                    <a.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{a.label}</p>
                    {a.sublabel ? (
                      <p className="truncate text-xs text-slate-600 dark:text-slate-400 mt-1">{a.sublabel}</p>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Dashboard Section */}
        <section className="mb-10">
          <DashboardClient />
        </section>
      </main>
      <FloatingActionWrapper />
    </div>
  );
}
