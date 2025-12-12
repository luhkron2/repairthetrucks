'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { formatMelbourneShort } from '@/lib/time';
import { cn } from '@/lib/utils';
import { Download, Search, LogOut, Activity, AlertTriangle, ClipboardList, CalendarCheck, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/notification-bell';
import { QuickActionsMenu } from '@/components/quick-actions-menu';
import { toast } from 'sonner';
import { Issue } from '@prisma/client';
import { TruckBooking } from '@/components/truck-booking';
import { Footer } from '@/components/footer';

export default function OperationsPage() {
  const { isAuthenticated, accessLevel, loading, logout } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'critical'>('all');

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || accessLevel !== 'operations') {
        router.push('/access');
        return;
      }
      fetchIssues();
    }
  }, [loading, isAuthenticated, accessLevel, router]);

  useEffect(() => {
    const search = searchQuery.trim().toLowerCase();
    const safeIssues = Array.isArray(issues) ? issues : [];
    const filtered = safeIssues.filter((issue) => {
      const matchesSearch =
        search.length === 0 ||
        issue.fleetNumber.toLowerCase().includes(search) ||
        issue.driverName.toLowerCase().includes(search) ||
        issue.description.toLowerCase().includes(search) ||
        issue.ticket.toString().includes(search);

      const matchesFilter =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? !['CLOSED', 'COMPLETED', 'RESOLVED'].includes(issue.status)
            : issue.severity === 'CRITICAL';

      return matchesSearch && matchesFilter;
    });
    setFilteredIssues(filtered);
  }, [issues, searchQuery, statusFilter]);

  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/issues');
      if (response.ok) {
        const data = await response.json();
        setIssues(Array.isArray(data) ? data : (data.issues ?? []));
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      toast.error('Failed to load issues. Please refresh the page.');
    }
  };

  const activeIssues = issues.filter(
    (issue) => !['CLOSED', 'COMPLETED', 'RESOLVED'].includes(issue.status)
  ).length;
  const criticalIssues = issues.filter((issue) => issue.severity === 'CRITICAL').length;
  const scheduledIssues = issues.filter((issue) => issue.status === 'SCHEDULED');
  const scheduledCount = scheduledIssues.length;
  const recentIssues = issues.filter((issue) => {
    const createdAt = new Date(issue.createdAt).getTime();
    return Date.now() - createdAt <= 1000 * 60 * 60 * 24;
  }).length;

  const stats = [
    {
      label: 'Active tickets',
      value: activeIssues,
      icon: Activity,
      helper: 'Needing coordination',
      tone: 'text-blue-600 dark:text-blue-300',
    },
    {
      label: 'Critical severity',
      value: criticalIssues,
      icon: AlertTriangle,
      helper: 'Require immediate action',
      tone: 'text-amber-600 dark:text-amber-300',
    },
    {
      label: 'Scheduled today',
      value: scheduledCount,
      icon: CalendarCheck,
      helper: 'Planned workshop jobs',
      tone: 'text-emerald-600 dark:text-emerald-300',
    },
    {
      label: 'Logged in 24h',
      value: recentIssues,
      icon: ClipboardList,
      helper: 'New tickets since yesterday',
      tone: 'text-slate-600 dark:text-slate-300',
    },
  ];

  const statusFilters = [
    { value: 'all', label: 'All tickets' },
    { value: 'active', label: 'In progress' },
    { value: 'critical', label: 'Critical' },
  ] as const;

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/export/${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `issues-export.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/operations" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div className="leading-tight">
                <span className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
                  Operations
                </span>
                <span className="block text-lg font-bold text-slate-900 dark:text-white">
                  Control Room
                </span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: '/operations', label: 'Dashboard', current: true },
                { href: '/workshop', label: 'Workshop', current: false },
                { href: '/admin/mappings', label: 'Admin', current: false }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    item.current
                      ? 'bg-purple-50 text-purple-700 shadow-sm dark:bg-purple-900/30 dark:text-purple-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/70 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <div className="hidden md:flex items-center gap-2 rounded-full border-2 border-purple-200/60 bg-purple-50/80 px-4 py-2 dark:border-purple-900/40 dark:bg-purple-900/20">
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">{issues.length} tickets</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="gap-2 font-semibold">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-10 space-y-8">
        {/* Hero Section */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-purple-200/70 bg-gradient-to-r from-purple-50 to-purple-100 px-5 py-2 text-sm font-semibold tracking-wide text-purple-700 shadow-sm dark:border-purple-900/40 dark:from-purple-900/20 dark:to-purple-900/30 dark:text-purple-300">
            <Settings className="h-4 w-4" />
            Operations Control Room
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white">
                Fleet Maintenance Command Center
              </h1>
              <p className="max-w-3xl text-lg text-slate-600 dark:text-slate-300">
                Monitor submissions, schedule workshop capacity, and export compliance-ready reports from one unified dashboard.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 rounded-2xl border-2 border-slate-200/70 bg-gradient-to-br from-slate-50 to-slate-100 px-5 py-4 text-sm shadow-sm dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-900/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Signed in as</span>
              <span className="text-base font-bold text-purple-600 dark:text-purple-400">Operations Manager</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Data refreshes automatically</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className="group relative overflow-hidden rounded-3xl border-2 border-slate-200/70 bg-white/95 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800/80 dark:bg-slate-900/80"
                >
                  <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-2xl transition-opacity group-hover:opacity-100 opacity-50" />
                  <CardContent className="relative space-y-5 p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{stat.label}</p>
                        <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
                      </div>
                      <div className={`rounded-xl p-3 shadow-sm transition-transform group-hover:scale-110 ${
                        stat.tone.includes('blue') ? 'bg-blue-100 dark:bg-blue-900/30' :
                        stat.tone.includes('amber') ? 'bg-amber-100 dark:bg-amber-900/30' :
                        stat.tone.includes('emerald') ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                        'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        <Icon className={`h-6 w-6 ${stat.tone}`} />
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${stat.tone}`}>{stat.helper}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Card className="border border-slate-200/70 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search by ticket, fleet, driver, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2" onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => handleExport('pdf')}>
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.value}
                  type="button"
                  variant="outline"
                  onClick={() => setStatusFilter(filter.value)}
                  className={cn(
                    'h-9 rounded-full border-slate-200/70 bg-white/80 px-4 text-sm font-medium text-slate-600 hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-200',
                    statusFilter === filter.value &&
                      'border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
                  )}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border border-slate-200/70 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle>Book truck service</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Coordinate preventative maintenance or ad-hoc workshop slots with a guided booking flow.
              </p>
            </CardHeader>
            <CardContent>
              <TruckBooking />
            </CardContent>
          </Card>

          <Card className="border border-slate-200/70 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle>Today&apos;s schedule</CardTitle>
                <Badge variant="outline" className="border-blue-200/70 text-blue-700 dark:border-blue-900/40 dark:text-blue-200">
                  {scheduledCount} jobs
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Assets booked into the workshop for the current day.</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">#{issue.ticket}  {issue.fleetNumber}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{issue.description}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Driver: {issue.driverName}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <SeverityBadge severity={issue.severity} />
                      <span className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Scheduled</span>
                    </div>
                  </div>
                ))}
                {scheduledCount === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    No scheduled repairs for today.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-slate-200/70 bg-white/95 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Ticket register</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300">Filtered view: {filteredIssues.length} of {issues.length} tickets.</p>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200/70 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40">
                  <TableHead>Ticket</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Fleet</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map((issue) => (
                  <TableRow
                    key={issue.id}
                    className="border-slate-100/70 hover:bg-blue-50/40 dark:border-slate-800 dark:hover:bg-slate-900/60"
                  >
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="rounded-full border-blue-200/70 bg-blue-50 px-3 py-1 text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/30 dark:text-blue-200">
                        #{issue.ticket}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={issue.status} />
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={issue.severity} />
                    </TableCell>
                    <TableCell className="text-sm text-slate-700 dark:text-slate-300">{issue.fleetNumber}</TableCell>
                    <TableCell className="text-sm text-slate-700 dark:text-slate-300">{issue.driverName}</TableCell>
                    <TableCell className="text-sm text-slate-700 dark:text-slate-300">{issue.category}</TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      {formatMelbourneShort(issue.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/issues/${issue.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredIssues.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No tickets match the current filters.
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <QuickActionsMenu />
      <Footer className="mt-16" />
    </div>
  );
}
