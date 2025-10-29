import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStats {
  totalIssues: number;
  activeIssues: number;
  completedToday: number;
  averageRepairTime: string;
  workshopCapacity: number;
  urgentIssues: number;
}

interface RecentActivity {
  id: string;
  type: 'issue_reported' | 'issue_completed' | 'workorder_created';
  title: string;
  description: string;
  timestamp: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface DashboardProps {
  stats?: DashboardStats;
  activities?: RecentActivity[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  status = 'neutral',
  trend,
  className,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  status?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  trend?: { value: number; label: string };
  className?: string;
}) => {
  const animatedNumber = useAnimatedCounter(typeof value === 'number' ? value : 0);
  const displayValue = typeof value === 'number' ? animatedNumber : value;

  return (
    <Card
      className={cn(
        'transform-gpu transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-blue-800/20',
        className,
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl bg-opacity-10',
                status === 'success' && 'bg-emerald-500',
                status === 'warning' && 'bg-amber-500',
                status === 'danger' && 'bg-rose-500',
                status === 'info' && 'bg-blue-500',
                status === 'neutral' && 'bg-slate-500',
              )}
            >
              <Icon
                className={cn(
                  'h-6 w-6',
                  status === 'success' && 'text-emerald-500',
                  status === 'warning' && 'text-amber-500',
                  status === 'danger' && 'text-rose-500',
                  status === 'info' && 'text-blue-500',
                  status === 'neutral' && 'text-slate-500',
                )}
              />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</CardTitle>
              {description && <CardDescription className="text-sm">{description}</CardDescription>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 stat-counter">
          {displayValue}
        </div>
        {trend && (
          <div
            className={cn(
              'mt-2 flex items-center gap-1 text-sm font-medium',
              trend.value > 0 ? 'text-emerald-600' : 'text-rose-600',
            )}
          >
            <TrendingUp className={cn('h-4 w-4', trend.value < 0 && 'rotate-180')} />
            {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
  const priorityColors = {
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300',
    high: 'bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300',
    critical: 'bg-rose-100 text-rose-700 dark:bg-rose-800 dark:text-rose-300',
  };

  const typeIcons = {
    issue_reported: AlertTriangle,
    issue_completed: CheckCircle,
    workorder_created: Wrench,
  };

  const Icon = typeIcons[activity.type];

  return (
    <div className="flex items-start gap-4 rounded-lg border border-slate-200/80 p-4 transition-colors hover:bg-slate-50/50 dark:border-slate-700/80 dark:hover:bg-slate-800/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{activity.title}</p>
          {activity.priority && (
            <Badge variant="outline" className={cn('text-xs font-medium', priorityColors[activity.priority])}>
              {activity.priority}
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{activity.description}</p>
        <p className="text-xs text-slate-500 dark:text-slate-500">{activity.timestamp}</p>
      </div>
    </div>
  );
};

export function Dashboard({
  stats,
  activities = [],
  isLoading = false,
  onRefresh,
}: DashboardProps) {
  const defaultStats: DashboardStats = {
    totalIssues: 24,
    activeIssues: 8,
    completedToday: 12,
    averageRepairTime: '2.5h',
    workshopCapacity: 85,
    urgentIssues: 3,
  };

  const currentStats = stats || defaultStats;

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-6 w-16 bg-muted rounded" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Live Dashboard</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Real-time fleet repair operations overview
          </p>
        </div>
        {onRefresh && (
          <Button variant="outline" size="lg" onClick={onRefresh} className="gap-2">
            <RefreshCw className="h-5 w-5" />
            Refresh
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Issues"
          value={currentStats.totalIssues}
          description="All time"
          icon={Activity}
          status="neutral"
          trend={{ value: 12, label: 'vs last week' }}
          className="xl:col-span-2"
        />

        <StatCard
          title="Active"
          value={currentStats.activeIssues}
          description="In progress"
          icon={Clock}
          status="info"
          trend={{ value: -8, label: 'vs yesterday' }}
          className="xl:col-span-2"
        />

        <StatCard
          title="Completed"
          value={currentStats.completedToday}
          description="Today"
          icon={CheckCircle}
          status="success"
          trend={{ value: 23, label: 'vs yesterday' }}
          className="xl:col-span-2"
        />

        <StatCard
          title="Avg Repair"
          value={currentStats.averageRepairTime}
          description="Time"
          icon={Wrench}
          status="neutral"
          className="xl:col-span-3"
        />

        <StatCard
          title="Capacity"
          value={`${currentStats.workshopCapacity}%`}
          description="Utilization"
          icon={Users}
          status={currentStats.workshopCapacity > 90 ? 'warning' : 'success'}
          className="xl:col-span-3"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-2 border-slate-200/80 dark:border-slate-700/80 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <Activity className="h-6 w-6" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest fleet repair updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.length > 0 ? (
              activities.slice(0, 5).map(activity => <ActivityItem key={activity.id} activity={activity} />)
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Truck className="mx-auto h-14 w-14 mb-6 opacity-50" />
                <p className="font-semibold text-lg">No recent activity</p>
                <p className="text-sm">Activity will appear here as issues are reported</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200/80 dark:border-slate-700/80 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <TrendingUp className="h-6 w-6" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start gap-3 p-6 text-lg" variant="outline">
              <Truck className="h-5 w-5" />
              Report New Issue
            </Button>
            <Button className="w-full justify-start gap-3 p-6 text-lg" variant="outline">
              <Wrench className="h-5 w-5" />
              View Workshop
            </Button>
            <Button className="w-full justify-start gap-3 p-6 text-lg" variant="outline">
              <Activity className="h-5 w-5" />
              Check Status
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}