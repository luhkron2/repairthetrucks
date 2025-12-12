'use client';

import { useState } from 'react';
import { Plus, FileText, Calendar, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Report Issue',
    icon: FileText,
    href: '/report',
    color: 'from-blue-500 to-blue-600'
  },
  {
    label: 'View Schedule',
    icon: Calendar,
    href: '/schedule',
    color: 'from-purple-500 to-purple-600'
  },
  {
    label: 'My Issues',
    icon: Zap,
    href: '/my-issues',
    color: 'from-orange-500 to-orange-600'
  }
];

export function QuickActionsMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Items */}
      {isOpen && (
        <div className="mb-4 space-y-3 animate-fade-in-scale">
          {QUICK_ACTIONS.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group block"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setIsOpen(false)}
              >
                <Card className="overflow-hidden border-2 border-slate-200/80 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900/95">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br shadow-md transition-transform group-hover:scale-110',
                      action.color
                    )}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {action.label}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Toggle Button */}
      <Button
        size="lg"
        className={cn(
          'h-14 w-14 rounded-full shadow-2xl transition-all duration-300',
          isOpen
            ? 'rotate-45 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200'
            : 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white dark:text-slate-900" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  );
}
