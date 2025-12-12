'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, MessageSquare, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { LoadingPage } from '@/components/ui/loading';
import type { Severity, Status } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { CreateWorkOrderDialog } from '@/components/create-work-order-dialog';
import { formatMelbourneShort } from '@/lib/time';

type IssueMedia = {
  id: string;
  url: string;
  type: string;
};

type IssueComment = {
  id: string;
  body: string;
  createdAt: string;
  author?: {
    name?: string | null;
  } | null;
};

type IssueWorkOrder = {
  id: string;
  status: Status;
  startAt: string;
  endAt: string;
  workType?: string | null;
  workshopSite?: string | null;
  assignedTo?: {
    name?: string | null;
  } | null;
  notes?: string | null;
};

type IssueDetails = {
  id: string;
  ticket: number | string;
  status: Status;
  severity: Severity;
  fleetNumber: string;
  driverName: string;
  driverPhone?: string | null;
  category: string;
  primeRego?: string | null;
  trailerA?: string | null;
  trailerB?: string | null;
  location?: string | null;
  safeToContinue?: string | null;
  description: string;
  createdAt: string;
  media?: IssueMedia[];
  workOrders?: IssueWorkOrder[];
  comments?: IssueComment[];
};

export default function IssueDetailPage() {
  const params = useParams<{ id: string }>();
  const issueId = params?.id;
  const [issue, setIssue] = useState<IssueDetails | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchIssue = useCallback(async () => {
    if (!issueId) return;
    try {
      const response = await fetch(`/api/issues/${issueId}`);
      if (response.ok) {
        const data: IssueDetails = await response.json();
        setIssue(data);
      }
    } catch (error) {
      console.error('Failed to fetch issue:', error);
    }
  }, [issueId]);

  useEffect(() => {
    if (issueId) {
      void fetchIssue();
    }
  }, [issueId, fetchIssue]);

  const handleAddComment = async () => {
    if (!comment.trim() || !issueId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/issues/${issueId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: comment }),
      });

      if (response.ok) {
        toast.success('Comment added');
        setComment('');
        await fetchIssue();
      }
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  if (!issue) {
    return <LoadingPage text="Loading issue details..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/workshop">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Workshop
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          {/* Issue Header */}
          <Card className="rounded-2xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">Issue #{issue.ticket}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {issue.fleetNumber} - {issue.category}
                  </p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={issue.status} />
                  <SeverityBadge severity={issue.severity} showIcon />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Driver</p>
                    <p className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4" />
                      {issue.driverName}
                    </p>
                    {issue.driverPhone && <p className="text-sm text-muted-foreground">{issue.driverPhone}</p>}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fleet Information</p>
                    <p className="mt-1">Fleet: {issue.fleetNumber}</p>
                    {issue.primeRego && <p className="text-sm">Registration: {issue.primeRego}</p>}
                    {(issue.trailerA || issue.trailerB) && (
                      <p className="text-sm">
                        Trailers: {[issue.trailerA, issue.trailerB].filter(Boolean).join(' / ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {issue.location && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Location</p>
                      <p className="mt-1">{issue.location}</p>
                    </div>
                  )}

                  {issue.safeToContinue && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Safe to Continue?</p>
                      <p className="mt-1">{issue.safeToContinue}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reported</p>
                    <p className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {formatMelbourneShort(issue.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{issue.description}</p>
              </div>

              {issue.media && issue.media.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Media</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {issue.media.map((media) => (
                      <div key={media.id} className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                        {media.type.startsWith('image/') ? (
                          <Image
                            src={media.url}
                            alt="Issue media"
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                          />
                        ) : (
                          // eslint-disable-next-line jsx-a11y/media-has-caption
                          <video src={media.url} controls className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <CreateWorkOrderDialog
                  issueId={issue.id}
                  issueTitle={`#${issue.ticket} - ${issue.fleetNumber}`}
                  onSuccess={fetchIssue}
                  trigger={<Button>Schedule Work Order</Button>}
                />
              </div>
            </CardContent>
          </Card>

          {/* Work Orders */}
          {issue.workOrders && issue.workOrders.length > 0 && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Work Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {issue.workOrders.map((wo) => (
                  <div key={wo.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{wo.workType || 'Work Order'}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatMelbourneShort(wo.startAt)} - {formatMelbourneShort(wo.endAt)}
                        </p>
                        {wo.workshopSite && <p className="text-sm">Location: {wo.workshopSite}</p>}
                        {wo.assignedTo && <p className="text-sm">Assigned to: {wo.assignedTo.name}</p>}
                      </div>
                      <StatusBadge status={wo.status} />
                    </div>
                    {wo.notes && <p className="text-sm text-muted-foreground mt-2">{wo.notes}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {issue.comments && issue.comments.length > 0 ? (
                <div className="space-y-4">
                  {issue.comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-primary/20 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{comment.author?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMelbourneShort(comment.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm">{comment.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              )}

              <div className="space-y-2 pt-4 border-t">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddComment} disabled={loading || !comment.trim()}>
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
