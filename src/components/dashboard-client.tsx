'use client';

import { Dashboard } from '@/components/dashboard';
import { DashboardError } from '@/components/ui/dashboard-error';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { useFetch } from '@/hooks/useFetch';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

interface DashboardData {
  stats: {
    totalIssues: number;
    activeIssues: number;
    completedToday: number;
    averageRepairTime: string;
    workshopCapacity: number;
    urgentIssues: number;
  };
  activities: Array<{
    id: string;
    type: 'issue_reported' | 'issue_completed' | 'workorder_created';
    title: string;
    description: string;
    timestamp: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

export function DashboardClient() {
  const { data, isLoading, error, fetchData } = useFetch<DashboardData>('/api/dashboard');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [isClient, fetchData]);

  useEffect(() => {
    if (data) {
      setLastRefresh(new Date());
    }
  }, [data]);

  if (!isClient) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <DashboardError error={error} onRetry={fetchData} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 pulse-live" />
          Live Dashboard
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Dashboard stats={data?.stats} activities={data?.activities} isLoading={isLoading || !data} onRefresh={fetchData} />
    </div>
  );
}