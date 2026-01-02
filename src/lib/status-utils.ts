import { cva } from 'class-variance-authority';

// Status color variants for consistency across components
export const statusVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      status: {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        in_progress: 'bg-blue-100 text-blue-800 border-blue-200', 
        scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
        completed: 'bg-green-100 text-green-800 border-green-200',
      },
      severity: {
        low: 'bg-gray-100 text-gray-800 border-gray-200',
        medium: 'bg-orange-100 text-orange-800 border-orange-200',
        high: 'bg-red-100 text-red-800 border-red-200',
        critical: 'bg-red-600 text-white border-red-700',
      }
    },
    defaultVariants: {
      status: 'pending',
    }
  }
);

// Utility function to get consistent status colors
export function getStatusColor(status: string, type: 'status' | 'severity' = 'status') {
  const colors = {
    status: {
      pending: 'text-yellow-600',
      in_progress: 'text-blue-600',
      scheduled: 'text-purple-600',
      completed: 'text-green-600',
    },
    severity: {
      low: 'text-gray-600',
      medium: 'text-orange-600',
      high: 'text-red-600',
      critical: 'text-red-700',
    }
  };
  
  return colors[type][status as keyof typeof colors[typeof type]] || colors.status.pending;
}

// Utility function to format status text
export function formatStatusText(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Utility function to get priority level number for sorting
export function getPriorityLevel(severity: string): number {
  const levels = {
    low: 1,
    medium: 2, 
    high: 3,
    critical: 4,
  };
  return levels[severity as keyof typeof levels] || 0;
}