import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const hasValidDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  return (
    typeof url === 'string' &&
    (
      url.startsWith('postgres://') ||
      url.startsWith('postgresql://') ||
      url.startsWith('file:') // allow SQLite URLs like file:./dev.db
    )
  );
};

const issueSchema = z.object({
  category: z.string(),
  description: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  safeToContinue: z.string().optional(),
  location: z.string().optional(),
  fleetNumber: z.string(),
  primeRego: z.string().optional(),
  trailerA: z.string().optional(),
  trailerB: z.string().optional(),
  driverName: z.string(),
  driverPhone: z.string().optional(),
  preferredFrom: z.string().optional(),
  preferredTo: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
});

interface IssueFilters {
  status?: 'PENDING' | 'IN_PROGRESS' | 'SCHEDULED' | 'COMPLETED';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  fleetNumber?: { contains: string };
  driverName?: string;
  createdAt?: { gte?: Date; lte?: Date };
}

export async function GET(request: NextRequest) {
  if (!hasValidDatabaseUrl()) {
    return NextResponse.json({ error: 'Database connection is not configured.' }, { status: 503 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const fleet = searchParams.get('fleet');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const driverName = searchParams.get('driverName');
    const limit = searchParams.get('limit');

    const where: IssueFilters = {};

    if (status) {
      const validStatuses: readonly ('PENDING' | 'IN_PROGRESS' | 'SCHEDULED' | 'COMPLETED')[] = ['PENDING', 'IN_PROGRESS', 'SCHEDULED', 'COMPLETED'];
      if (validStatuses.includes(status as 'PENDING' | 'IN_PROGRESS' | 'SCHEDULED' | 'COMPLETED')) {
        where.status = status as 'PENDING' | 'IN_PROGRESS' | 'SCHEDULED' | 'COMPLETED';
      }
    }
    if (severity) {
      const validSeverities: readonly ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      if (validSeverities.includes(severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')) {
        where.severity = severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      }
    }
    if (fleet) {
      where.fleetNumber = { contains: fleet };
    }
    if (driverName) {
      where.driverName = driverName;
    }
    if (dateFrom) {
      where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) };
    }
    if (dateTo) {
      where.createdAt = { ...where.createdAt, lte: new Date(dateTo) };
    }

    const issues = await prisma.issue.findMany({
      where,
      include: {
        media: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        workOrders: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit ? parseInt(limit, 10) : undefined,
    });

    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!hasValidDatabaseUrl()) {
    return NextResponse.json({ error: 'Database connection is not configured.' }, { status: 503 });
  }

  try {
    // Apply rate limiting for public submissions
    const rateLimitCheck = rateLimit(RATE_LIMITS.ISSUE_SUBMISSION)(request);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = issueSchema.parse(body);

    // Generate ticket number (get highest + 1)
    const lastIssue = await prisma.issue.findFirst({
      orderBy: { ticket: 'desc' },
      select: { ticket: true },
    });

    const ticket = lastIssue ? lastIssue.ticket + 1 : 1001;

    // Create issue
    const issue = await prisma.issue.create({
      data: {
        ticket,
        category: validated.category,
        description: validated.description,
        severity: validated.severity,
        safeToContinue: validated.safeToContinue,
        location: validated.location,
        fleetNumber: validated.fleetNumber,
        primeRego: validated.primeRego,
        trailerA: validated.trailerA,
        trailerB: validated.trailerB,
        driverName: validated.driverName,
        driverPhone: validated.driverPhone,
        preferredFrom: validated.preferredFrom
          ? new Date(validated.preferredFrom)
          : undefined,
        preferredTo: validated.preferredTo
          ? new Date(validated.preferredTo)
          : undefined,
        media: validated.mediaUrls
          ? {
              create: validated.mediaUrls.map((url) => ({
                url,
                type: url.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
              })),
            }
          : undefined,
      },
      include: {
        media: true,
      },
    });

    logger.info(`Issue created: #${issue.ticket}`, { 
      fleet: issue.fleetNumber, 
      severity: issue.severity,
      driver: issue.driverName 
    });

    return NextResponse.json({ ticket: issue.ticket, id: issue.id }, { status: 201 });
  } catch (error) {
    logger.error('Error creating issue:', error instanceof Error ? error : undefined);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    );
  }
}
