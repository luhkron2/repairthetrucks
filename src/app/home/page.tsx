import type { Metadata } from 'next';
import { BarChart3, Calendar, ClipboardCheck, Clock, PhoneCall, Truck, Wrench, Zap } from 'lucide-react';
import type { ComponentType } from 'react';

import { DashboardClient } from '@/components/dashboard-client';
import { FloatingActionWrapper } from '@/components/floating-action-wrapper';
import { Navigation } from '@/components/navigation';
import Link from 'next/link';

const actions: Array<{
  href: string;
  label: string;
  sublabel?: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    href: '/report',
    label: 'Report downtime',
    sublabel: 'Log an issue with photos',
    icon: Truck,
  },
  {
    href: '/my-issues',
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

const quickStats = [
  {
    icon: Zap,
    label: 'Avg. Response Time',
    value: '18 min',
    change: '+2%',
    positive: true,
  },
  {
    icon: BarChart3,
    label: 'Efficiency Rate',
    value: '94%',
    change: '+5%',
    positive: true,
  },
  {
    icon: Wrench,
    label: 'Repairs Today',
    value: '24',
    change: '-3%',
    positive: false,
  },
  {
    icon: Clock,
    label: 'Avg. Repair Time',
    value: '2.3h',
    change: '-8%',
    positive: true,
  },
];

export const metadata: Metadata = {
  title: 'SE National — Repair Control',
  description: 'Central console for intake, live operations and workshop coordination across the network.',
};

export default function DashboardHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <Navigation />
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 pb-24">
        {/* Hero Section */}
        <header className="mb-16 text-center animate-slide-in-up">
          <div className="inline-flex items-center gap-3 rounded-full border-2 border-blue-200/80 bg-blue-100/50 px-5 py-2.5 text-sm font-bold tracking-wide text-blue-700 shadow-lg backdrop-blur-sm dark:border-blue-800/60 dark:bg-blue-900/40 dark:text-blue-300">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            SE National Live Operations
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-slate-900 mt-6 mb-6 dark:text-slate-100">
            Fleet Repair <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Control Center</span>
          </h1>
          <p className="text-lg md:text-xl max-w-4xl mx-auto text-slate-600 dark:text-slate-300">
            Professional fleet management system for logging downtime, tracking repair tickets, managing workshop schedules, and coordinating operations across the network.
          </p>
        </header>

        {/* Quick Stats */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index}
                  className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl border-2 border-slate-200/80 p-6 shadow-lg hover:shadow-xl transition-all duration-300 dark:border-slate-700/70 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-blue-100/70 dark:bg-blue-900/50">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${
                      stat.positive 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="mt-5">
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                    <p className="text-base text-slate-600 dark:text-slate-400 mt-1.5">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Action Cards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-100">Quick Actions</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {actions.map((a, index) => (
              <Link
                key={a.href}
                href={a.href}
                prefetch
                className="dashboard-card group bg-white/80 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl border-2 border-slate-200/80 p-6 shadow-lg hover:shadow-xl transition-all duration-300 dark:border-slate-700/70 hover:border-blue-400 dark:hover:border-blue-600/60 transform hover:-translate-y-1.5 animate-fade-in-scale"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex items-start gap-5">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg transition-transform group-hover:scale-110 dark:from-blue-400 dark:to-indigo-500">
                    <a.icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-slate-900 dark:text-slate-100">{a.label}</p>
                    {a.sublabel ? (
                      <p className="truncate text-sm text-slate-600 dark:text-slate-400 mt-1.5">{a.sublabel}</p>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Dashboard Section */}
        <section className="mb-12">
          <div className="rounded-2xl bg-white/80 dark:bg-slate-800/70 backdrop-blur-md border-2 border-slate-200/80 p-6 shadow-lg dark:border-slate-700/70">
            <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-100">Live Dashboard</h2>
            <DashboardClient />
          </div>
        </section>
      </main>
      <FloatingActionWrapper />
    </div>
  );
}
