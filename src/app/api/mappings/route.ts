import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import { getFallbackMappings } from '@/lib/mapping-fallback';
import { parseMappingValue, type MappingsCache } from '@/lib/mappings';
import { auth } from '@/../auth';

const mappingSchema = z.object({
  kind: z.enum(['driver', 'fleet', 'trailer']),
  key: z.string(),
  value: z.string(),
});

const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedMappings: { data: MappingsCache; expiresAt: number } | null = null;
let inflightPromise: Promise<MappingsCache> | null = null;
let cacheGeneration = 0;

type MappingRecord = {
  kind: string;
  key: string;
  value: string;
};

function toStringField(
  source: Record<string, unknown>,
  key: string,
  defaultValue = ''
): string {
  const value = source[key];
  return typeof value === 'string' ? value : defaultValue;
}

function transformMappings(records: MappingRecord[]): MappingsCache {
  const grouped: MappingsCache = {
    drivers: {},
    fleets: {},
    trailers: {},
  };

  for (const record of records) {
    const parsed = parseMappingValue<Record<string, unknown>>(record.value);

    if (record.kind === 'driver') {
      grouped.drivers[record.key] = {
        phone: toStringField(parsed, 'phone'),
        status: toStringField(parsed, 'status', 'Active'),
      };
      continue;
    }

    if (record.kind === 'fleet') {
      grouped.fleets[record.key] = {
        rego: toStringField(parsed, 'rego', record.key),
        status: toStringField(parsed, 'status', 'Active'),
      };
      continue;
    }

    if (record.kind === 'trailer') {
      grouped.trailers[record.key] = {
        rego: toStringField(parsed, 'rego'),
        type: toStringField(parsed, 'type'),
        status: toStringField(parsed, 'status', 'Active'),
        location: toStringField(parsed, 'location'),
      };
    }
  }

  return grouped;
}

async function loadMappings(): Promise<MappingsCache> {
  const now = Date.now();
  if (cachedMappings && cachedMappings.expiresAt > now) {
    return cachedMappings.data;
  }

  if (!inflightPromise) {
    const generationAtStart = cacheGeneration;
    inflightPromise = (async () => {
      const records = await prisma.mapping.findMany({
        select: { kind: true, key: true, value: true },
      });
      const data = transformMappings(records);
      if (generationAtStart === cacheGeneration) {
        cachedMappings = {
          data,
          expiresAt: Date.now() + CACHE_TTL_MS,
        };
      }
      return data;
    })();
  }

  try {
    return await inflightPromise;
  } finally {
    inflightPromise = null;
  }
}

function invalidateCache() {
  cacheGeneration += 1;
  cachedMappings = null;
  inflightPromise = null;
}

export async function GET() {
  try {
    const mappings = await loadMappings();

    const hasRecords =
      Object.keys(mappings.drivers).length > 0 ||
      Object.keys(mappings.fleets).length > 0 ||
      Object.keys(mappings.trailers).length > 0;

    if (!hasRecords) {
      const fallback = getFallbackMappings();
      // Cache the fallback so subsequent calls stay warm
      cachedMappings = {
        data: fallback,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };
      return NextResponse.json(fallback);
    }

    return NextResponse.json(mappings);
  } catch (error) {
    console.error('Error fetching mappings:', error);
    return NextResponse.json(getFallbackMappings());
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = mappingSchema.parse(body);

    const mapping = await prisma.mapping.upsert({
      where: {
        kind_key: {
          kind: validated.kind,
          key: validated.key,
        },
      },
      create: {
        kind: validated.kind,
        key: validated.key,
        value: validated.value,
      },
      update: {
        value: validated.value,
      },
    });

    invalidateCache();
    return NextResponse.json(mapping);
  } catch (error) {
    console.error('Error saving mapping:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to save mapping' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kind = searchParams.get('kind');
    const key = searchParams.get('key');

    if (!kind || !key) {
      return NextResponse.json(
        { error: 'Missing kind or key' },
        { status: 400 }
      );
    }

    await prisma.mapping.delete({
      where: {
        kind_key: {
          kind,
          key,
        },
      },
    });

    invalidateCache();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mapping:', error);
    return NextResponse.json(
      { error: 'Failed to delete mapping' },
      { status: 500 }
    );
  }
}
