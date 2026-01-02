'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, RefreshCw, AlertTriangle, CheckCircle, Clock, Truck } from 'lucide-react';
import { Issue, Status, Severity } from '@prisma/client';
import { toast } from 'sonner';
import { LoadingPage } from '@/components/ui/loading';
import Link from 'next/link';

export default function IssuesPage() {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchIssues = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/issues');
      if (response.ok) {
        const data = await response.json();
        const issuesArray = Array.isArray(data) ? data : (data.issues ?? []);
        setIssues(issuesArray);
        setFilteredIssues(issuesArray);
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (isAuthenticated) {
      fetchIssues();
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    let filtered = [...issues];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(issue =>
        issue.fleetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.severity === severityFilter);
    }

    setFilteredIssues(filtered);
  }, [issues, searchQuery, statusFilter, severityFilter]);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'SCHEDULED': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'LOW': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'MEDIUM': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'CRITICAL': return 'text-red-700 bg-red-100 border-red-300 font-bold';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const exportToCSV = () => {
    const headers = ['Ticket', 'Status', 'Severity', 'Category', 'Fleet', 'Driver', 'Location', 'Date'];
    const rows = filteredIssues.map(issue => [
      issue.ticket,
      issue.status,
      issue.severity,
      issue.category,
      issue.fleetNumber,
      issue.driverName,
      issue.location || '',
      new Date(issue.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `issues-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Issues exported successfully');
  };

  if (loading || isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Issue Management</h1>
            <p className="text-blue-200">View and manage all reported issues across the fleet</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchIssues} className="border-slate-600 text-white hover:bg-slate-800">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card className="mb-6 bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredIssues.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center">
                <Truck className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No issues found</p>
              </CardContent>
            </Card>
          ) : (
            filteredIssues.map(issue => (
              <Card key={issue.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-mono text-blue-400">#{issue.ticket}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status.replace(/_/g, ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">{issue.category}</h3>
                      <p className="text-slate-300 mb-2 line-clamp-2">{issue.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          {issue.fleetNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {issue.location || 'No location'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link href={`/issues/${issue.id}`}>
                      <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-4 text-sm text-slate-400 text-center">
          Showing {filteredIssues.length} of {issues.length} issues
        </div>
      </div>
    </div>
  );
}