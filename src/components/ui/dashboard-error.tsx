import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface DashboardErrorProps {
  error: string;
  onRetry: () => void;
}

export function DashboardError({ error, onRetry }: DashboardErrorProps) {
  return (
    <Card className="mx-auto max-w-2xl border-destructive/50 bg-destructive/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          Dashboard Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-destructive/80">
          {error}
        </p>
        <Button onClick={onRetry} variant="destructive" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
