import { Badge } from '@/components/ui/badge';
import { Status } from '@prisma/client';
import { cn } from '@/lib/utils';
import { Clock, Wrench, Calendar, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: Status;
  className?: string;
  showIcon?: boolean;
  driverFriendly?: boolean;
}

const statusConfig = {
  PENDING: { 
    label: 'Pending', 
    driverLabel: 'Reported',
    description: 'Workshop team reviewing',
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    icon: Clock,
  },
  IN_PROGRESS: { 
    label: 'In Progress', 
    driverLabel: 'Being Fixed',
    description: 'Mechanic working on it',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    icon: Wrench,
  },
  SCHEDULED: { 
    label: 'Scheduled', 
    driverLabel: 'Appointment Booked',
    description: 'Repair scheduled',
    className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    icon: Calendar,
  },
  COMPLETED: { 
    label: 'Completed', 
    driverLabel: 'Fixed',
    description: 'Ready for pickup',
    className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    icon: CheckCircle2,
  },
};

export function StatusBadge({ status, className, showIcon = false, driverFriendly = false }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const label = driverFriendly ? config.driverLabel : config.label;
  
  return (
    <Badge variant="outline" className={cn(config.className, 'gap-1.5', className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  );
}

export function getStatusDescription(status: Status): string {
  return statusConfig[status]?.description || '';
}

export function getStatusLabel(status: Status, driverFriendly = false): string {
  const config = statusConfig[status];
  return driverFriendly ? config.driverLabel : config.label;
}

