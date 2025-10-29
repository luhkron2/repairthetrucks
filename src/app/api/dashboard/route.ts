import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    // For demo purposes, return live dashboard data
    const demoStats = {
      totalIssues: 24,
      activeIssues: 8,
      completedToday: 12,
      averageRepairTime: '2.5h',
      workshopCapacity: 75,
      urgentIssues: 2
    }

    const demoActivities = [
      {
        id: '1',
        type: 'issue_reported' as const,
        title: 'Engine overheating reported',
        description: 'Engine - Truck #107',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString(),
        priority: 'high' as const
      },
      {
        id: '2',
        type: 'issue_completed' as const,
        title: 'Brake system maintenance completed',
        description: 'Brakes - Trailer #42A',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString(),
        priority: 'medium' as const
      },
      {
        id: '3',
        type: 'workorder_created' as const,
        title: 'Oil change scheduled',
        description: 'Maintenance - Truck #58',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toLocaleTimeString(),
        priority: 'low' as const
      },
      {
        id: '4',
        type: 'issue_reported' as const,
        title: 'Transmission slipping',
        description: 'Transmission - Truck #91',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toLocaleTimeString(),
        priority: 'critical' as const
      }
    ]

    return NextResponse.json({
      stats: demoStats,
      activities: demoActivities.slice(0, 6)
    })

  } catch (error) {
    logger.error('Dashboard API Error:', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
