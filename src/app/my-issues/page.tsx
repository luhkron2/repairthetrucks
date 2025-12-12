'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Clock, Wrench, CheckCircle2, FileText, Calendar, AlertCircle, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/status-badge';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { Navigation } from '@/components/navigation';
import { formatMelbourneShort } from '@/lib/time';
import type { Status, Severity } from '@prisma/client';

interface Issue {
  id: string;
  ticket: number;
  status: Status;
  severity: Severity;
  category: string;
  description: string;
  fleetNumber: string;
  driverName: string;
  createdAt: string;
  updatedAt: string;
  workOrders?: Array<{
    id: string;
    status: Status;
    startAt: string;
    endAt: string;
  }>;
}

export default function MyIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [driverName, setDriverName] = useState('');

  const fetchIssues = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Get driver name from localStorage (set when they submit a report)
      const lastDriverName = localStorage.getItem('last-driver-name');
      if (lastDriverName) {
        setDriverName(lastDriverName);
      }

      const response = await fetch('/api/issues?driverName=' + encodeURIComponent(lastDriverName || ''));
      if (response.ok) {
        const data = await response.json();
        setIssues(data.issues || []);
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const activeIssues = issues.filter(
    (issue) => !['COMPLETED'].includes(issue.status)
  );

  const scheduledIssues = issues.filter(
    (issue) => issue.status === 'SCHEDULED' || (issue.workOrders && issue.workOrders.length > 0)
  );

  const completedIssues = issues.filter(
    (issue) => issue.status === 'COMPLETED'
  ).slice(0, 10); // Last 10

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Wrench className="h-4 w-4" />;
      case 'SCHEDULED':
        return <Calendar className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: Status) => {
    switch (status) {
      case 'PENDING':
        return 'Reported';
      case 'IN_PROGRESS':
        return 'Being Fixed';
      case 'SCHEDULED':
        return 'Appointment Booked';
      case 'COMPLETED':
        return 'Fixed';
      default:
        return status;
    }
  };

  const getStatusDescription = (status: Status) => {
    switch (status) {
      case 'PENDING':
        return 'Workshop team reviewing';
      case 'IN_PROGRESS':
        return 'Mechanic working on it';
      case 'SCHEDULED':
        return 'Repair scheduled';
      case 'COMPLETED':
        return 'Ready for pickup';
      default:
        return '';
    }
  };

  const IssueCard = ({ issue }: { issue: Issue }) => {
    const nextWorkOrder = issue.workOrders?.[0];

    return (
      <Link href={`/issues/${issue.id}`}>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/50">
                    {getStatusIcon(issue.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Issue #{issue.ticket}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {issue.fleetNumber} • {issue.category}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                  {issue.description}
                </p>

                <div className="flex items-center gap-2">
                  <StatusBadge status={issue.status} />
                  <SeverityBadge severity={issue.severity} />
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatMelbourneShort(issue.createdAt)}</span>
                  </div>
                  {nextWorkOrder && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Scheduled {formatMelbourneShort(nextWorkOrder.startAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge variant="outline" className="text-xs">
                  {getStatusLabel(issue.status)}
                </Badge>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
                  {getStatusDescription(issue.status)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Navigation />
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navigation />

      <main className="container mx-auto max-w-6xl px-4 py-8 sm:py-16">
        <header className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                My Issues
              </h1>
              {driverName && (
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  Reports submitted by {driverName}
                </p>
              )}
            </div>

            <Button
              onClick={() => fetchIssues(true)}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </header>

        {issues.length === 0 ? (
          <Card className="rounded-3xl border border-blue-100/70 bg-white/95 shadow-lg dark:border-blue-900/40 dark:bg-slate-900/80">
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-4 rounded-full bg-slate-100 p-4 w-fit dark:bg-slate-800">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No issues found
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                You haven&apos;t submitted any reports yet, or we couldn&apos;t find issues matching your profile.
              </p>
              <Link href="/report">
                <Button>Report an Issue</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="active" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Active</span>
                <Badge variant="secondary" className="ml-1">
                  {activeIssues.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Scheduled</span>
                <Badge variant="secondary" className="ml-1">
                  {scheduledIssues.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Completed</span>
                <Badge variant="secondary" className="ml-1">
                  {completedIssues.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeIssues.length === 0 ? (
                <Card className="rounded-2xl">
                  <CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    No active issues
                  </CardContent>
                </Card>
              ) : (
                activeIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
              )}
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-4">
              {scheduledIssues.length === 0 ? (
                <Card className="rounded-2xl">
                  <CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    No scheduled repairs
                  </CardContent>
                </Card>
              ) : (
                scheduledIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedIssues.length === 0 ? (
                <Card className="rounded-2xl">
                  <CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    No completed issues
                  </CardContent>
                </Card>
              ) : (
                completedIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
