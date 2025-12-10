'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { formatMelbourneShort } from "@/lib/time";
import { Issue } from "@prisma/client";
import { Truck, ArrowRight, ShieldCheck, ClipboardCheck } from "lucide-react";
import { useTranslation } from "@/components/translation-provider";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

type IssueWithComments = Issue & {
  comments: Array<{
    body: string;
    createdAt: Date;
    author?: {
      name: string | null;
    } | null;
  }>;
};

interface HomePageClientProps {
  issues: IssueWithComments[];
}

export function HomePageClient({ issues }: HomePageClientProps) {
  const { t, translate } = useTranslation();

  const opsOverview = [
    { label: translate('Pending'), count: issues.filter(i => i.status === 'PENDING').length, color: 'bg-amber-500' },
    { label: translate('In Progress'), count: issues.filter(i => i.status === 'IN_PROGRESS').length, color: 'bg-blue-500' },
    { label: translate('Scheduled'), count: issues.filter(i => i.status === 'SCHEDULED').length, color: 'bg-purple-500' },
    { label: translate('Completed'), count: issues.filter(i => i.status === 'COMPLETED').length, color: 'bg-green-500' },
  ];

  const severityCounts: Record<Issue['severity'], number> = {
    LOW: issues.filter(i => i.severity === 'LOW').length,
    MEDIUM: issues.filter(i => i.severity === 'MEDIUM').length,
    HIGH: issues.filter(i => i.severity === 'HIGH').length,
    CRITICAL: issues.filter(i => i.severity === 'CRITICAL').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" suppressHydrationWarning>
      <Navigation />

      <main className="container mx-auto max-w-6xl px-4 py-16">
        <div className="mb-16 text-center">
          <div className="mb-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
              {t.home.badge}
            </p>
          </div>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            {t.home.headline}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            {t.home.subheadline}
          </p>
        </div>

        <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/report" className="flex-1 sm:flex-none">
            <Button size="lg" className="w-full gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-8 py-6 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-xl dark:from-blue-500 dark:via-blue-500 dark:to-indigo-400">
              <Truck className="h-5 w-5" />
              {t.home.ctaPrimary}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/operations" className="flex-1 sm:flex-none">
            <Button
              size="lg"
              variant="outline"
              className="group w-full gap-2 rounded-2xl border-2 border-slate-200/80 px-8 py-6 text-base font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-white hover:text-blue-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-slate-900/70 dark:hover:text-blue-200"
            >
              <ClipboardCheck className="h-5 w-5 transition group-hover:text-blue-600 dark:group-hover:text-blue-300" />
              {t.home.ctaSecondary}
            </Button>
          </Link>
        </div>

        <Card className="rounded-[2.25rem] border border-slate-200/80 bg-slate-50/80 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900/70">
          <CardContent className="space-y-6 p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600 dark:text-blue-300">
                  {t.home.signalsTitle}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{t.home.signalsSubtitle}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t.home.signalsDescription}
                </p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">
                <ShieldCheck className="h-6 w-6" />
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              {opsOverview.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60"
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <Card className="rounded-[2.25rem] border border-slate-200/80 bg-white/95 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="space-y-3 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                  {t.home.latestUpdatesHeading}
                </CardTitle>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300">
                  <ClipboardCheck className="h-4 w-4" />
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.home.latestUpdatesSubheading}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {issues.length > 0 ? (
                <>
                  {issues.slice(0, 3).map((issue) => (
                    <div key={issue.id} className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={issue.status} />
                          <SeverityBadge severity={issue.severity} />
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">#{issue.ticket}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{issue.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span>{issue.driverName}</span>
                          <span>{formatMelbourneShort(issue.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Link href="/operations">
                      <Button variant="outline" size="sm" className="w-full">
                        {t.home.viewDetailedRunSheet}
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t.home.noActiveRepairs}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2.25rem] border border-slate-200/80 bg-white/95 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="space-y-3 pb-4">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                {translate('Severity Breakdown')}
              </CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {translate('Current issue distribution by priority level')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.entries(severityCounts) as Array<[Issue['severity'], number]>).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={severity} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {translate(severity)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{count}</span>
                </div>
              ))}
              {issues.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t.home.table.empty}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer className="mt-16" />
    </div>
  );
}
