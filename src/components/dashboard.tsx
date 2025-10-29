import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Users,
  Truck,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'

interface DashboardStats {
  totalIssues: number
  activeIssues: number
  completedToday: number
  averageRepairTime: string
  workshopCapacity: number
  urgentIssues: number
}

interface RecentActivity {
  id: string
  type: 'issue_reported' | 'issue_completed' | 'workorder_created'
  title: string
  description: string
  timestamp: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

interface DashboardProps {
  stats?: DashboardStats
  activities?: RecentActivity[]
  isLoading?: boolean
  onRefresh?: () => void
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  status = 'neutral',
  trend,
  className
}: {
  title: string
  value: string | number
  description?: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  status?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'
  trend?: { value: number; label: string }
  className?: string
}) => {
  // Animate numeric values
  const animatedNumber = useAnimatedCounter(typeof value === 'number' ? value : 0)
  const displayValue = typeof value === 'number' ? animatedNumber : value

  return (
    <Card variant="elevated" status={status} glow={status !== 'neutral'} className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              status === 'success' && "bg-emerald-100 dark:bg-emerald-900",
              status === 'warning' && "bg-amber-100 dark:bg-amber-900",
              status === 'danger' && "bg-rose-100 dark:bg-rose-900",
              status === 'info' && "bg-blue-100 dark:bg-blue-900",
              "bg-slate-100 dark:bg-slate-800"
            )}>
              <Icon className={cn(
                "h-5 w-5",
                status === 'success' && "text-emerald-600 dark:text-emerald-400",
                status === 'warning' && "text-amber-600 dark:text-amber-400",
                status === 'danger' && "text-rose-600 dark:text-rose-400",
                status === 'info' && "text-blue-600 dark:text-blue-400",
                "text-slate-600 dark:text-slate-400"
              )} />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && (
                <CardDescription className="text-xs">{description}</CardDescription>
              )}
            </div>
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              trend.value > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" :
              trend.value < 0 ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" :
              "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            )}>
              <TrendingUp className={cn("h-3 w-3", trend.value < 0 && "rotate-180")} />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight stat-counter">
          {displayValue}
        </div>
      </CardContent>
    </Card>
  )
}

const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
  const priorityColors = {
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300',
    high: 'bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300',
    critical: 'bg-rose-100 text-rose-700 dark:bg-rose-800 dark:text-rose-300'
  }

  const typeIcons = {
    issue_reported: AlertTriangle,
    issue_completed: CheckCircle,
    workorder_created: Wrench
  }

  const Icon = typeIcons[activity.type]

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{activity.title}</p>
          {activity.priority && (
            <Badge variant="outline" className={cn("text-xs", priorityColors[activity.priority])}>
              {activity.priority}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{activity.description}</p>
        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
      </div>
    </div>
  )
}

export function Dashboard({
  stats,
  activities = [],
  isLoading = false,
  onRefresh
}: DashboardProps) {
  // Default stats for demo
  const defaultStats: DashboardStats = {
    totalIssues: 24,
    activeIssues: 8,
    completedToday: 12,
    averageRepairTime: '2.5h',
    workshopCapacity: 85,
    urgentIssues: 3
  }

  const currentStats = stats || defaultStats

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
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time fleet repair operations overview
          </p>
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Issues"
          value={currentStats.totalIssues}
          description="All time"
          icon={Activity}
          status="neutral"
          trend={{ value: 12, label: 'vs last week' }}
        />

        <StatCard
          title="Active"
          value={currentStats.activeIssues}
          description="In progress"
          icon={Clock}
          status="info"
          trend={{ value: -8, label: 'vs yesterday' }}
        />

        <StatCard
          title="Completed"
          value={currentStats.completedToday}
          description="Today"
          icon={CheckCircle}
          status="success"
          trend={{ value: 23, label: 'vs yesterday' }}
        />

        <StatCard
          title="Avg Repair"
          value={currentStats.averageRepairTime}
          description="Time"
          icon={Wrench}
          status="neutral"
        />

        <StatCard
          title="Capacity"
          value={`${currentStats.workshopCapacity}%`}
          description="Utilization"
          icon={Users}
          status={currentStats.workshopCapacity > 90 ? 'warning' : 'success'}
        />

        <StatCard
          title="Urgent"
          value={currentStats.urgentIssues}
          description="Critical issues"
          icon={AlertTriangle}
          status={currentStats.urgentIssues > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest fleet repair updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.length > 0 ? (
              activities.slice(0, 5).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-xs">Activity will appear here as issues are reported</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="elevated" status="info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline">
              <Truck className="h-4 w-4" />
              Report New Issue
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Wrench className="h-4 w-4" />
              View Workshop
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Activity className="h-4 w-4" />
              Check Status
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
