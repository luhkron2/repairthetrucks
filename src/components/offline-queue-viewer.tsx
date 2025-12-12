'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Clock, RefreshCw, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getQueuedIssues, removeQueuedIssue, retryQueue, getLastSyncTime, setLastSyncTime } from '@/lib/offline';
import { formatMelbourneShort } from '@/lib/time';
import { toast } from 'sonner';

interface QueuedIssue {
  id: string;
  data: {
    fleetNumber: string;
    category: string;
    description: string;
  };
  timestamp: number;
  retries: number;
}

export function OfflineQueueViewer() {
  const [queuedIssues, setQueuedIssues] = useState<QueuedIssue[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const loadQueue = async () => {
    try {
      const issues = await getQueuedIssues();
      const normalized = issues.map((item) => ({
        id: item.id,
        data: {
          fleetNumber: String(item.data.fleetNumber ?? ''),
          category: String(item.data.category ?? ''),
          description: String(item.data.description ?? ''),
        },
        timestamp: item.timestamp,
        retries: item.retries,
      }));
      setQueuedIssues(normalized);
      const syncTime = await getLastSyncTime();
      setLastSync(syncTime);
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  };

  useEffect(() => {
    loadQueue();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetryAll = async () => {
    setSyncing(true);
    try {
      const result = await retryQueue();
      await setLastSyncTime(Date.now());
      
      if (result.success > 0) {
        toast.success(`${result.success} report${result.success > 1 ? 's' : ''} synced successfully!`);
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} report${result.failed > 1 ? 's' : ''} failed to sync`);
      }
      
      await loadQueue();
    } catch {
      toast.error('Failed to sync offline reports');
    } finally {
      setSyncing(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeQueuedIssue(id);
      toast.info('Queued report removed');
      await loadQueue();
    } catch {
      toast.error('Failed to remove report');
    }
  };

  if (queuedIssues.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-amber-500/20 bg-amber-50/50 dark:bg-amber-900/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-amber-900 dark:text-amber-100">
              Offline Queue ({queuedIssues.length})
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {lastSync && (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Last sync: {formatMelbourneShort(new Date(lastSync).toISOString())}
              </p>
            )}
            <Button
              onClick={handleRetryAll}
              disabled={syncing || !isOnline}
              size="sm"
              variant="outline"
              className="gap-2 border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-900/20"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Retry All'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isOnline && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            <AlertCircle className="h-4 w-4" />
            <span>You&apos;re offline. Reports will sync when connection is restored.</span>
          </div>
        )}

        {queuedIssues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-amber-200/70 bg-white p-4 dark:border-amber-800/30 dark:bg-slate-900/50"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {issue.data.fleetNumber} - {issue.data.category}
                </p>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {issue.data.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>Queued: {formatMelbourneShort(new Date(issue.timestamp).toISOString())}</span>
                {issue.retries > 0 && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {issue.retries} {issue.retries === 1 ? 'retry' : 'retries'}
                  </Badge>
                )}
              </div>
            </div>

            <Button
              onClick={() => handleRemove(issue.id)}
              size="sm"
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            These reports are safely stored on your device and will automatically sync when you&apos;re back online.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
