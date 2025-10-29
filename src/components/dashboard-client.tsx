'use client'

import React, { useEffect, useState } from 'react'
import { Dashboard } from '@/components/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle } from 'lucide-react'

interface DashboardData {
  stats: {
    totalIssues: number
    activeIssues: number
    completedToday: number
    averageRepairTime: string
    workshopCapacity: number
    urgentIssues: number
  }
  activities: Array<{
    id: string
    type: 'issue_reported' | 'issue_completed' | 'workorder_created'
    title: string
    description: string
    timestamp: string
    priority?: 'low' | 'medium' | 'high' | 'critical'
  }>
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
      console.error('Dashboard fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isClient) {
      fetchDashboardData()

      // Set up auto-refresh every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000)

      return () => clearInterval(interval)
    }
  }, [isClient])

  if (!isClient) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Live Dashboard</h2>
            <p className="text-muted-foreground">
              Real-time fleet repair operations overview
            </p>
          </div>
        </div>
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
      </div>
    )
  }

  const handleRefresh = () => {
    fetchDashboardData()
  }

  if (error) {
    return (
      <Card variant="elevated" status="danger" className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Dashboard Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {error}
          </p>
          <Button onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Live indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 pulse-live" />
          Live Dashboard
        </div>
        <div className="flex items-center gap-2">
          {isClient && lastRefresh && (
            <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Dashboard
        stats={data?.stats}
        activities={data?.activities}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
