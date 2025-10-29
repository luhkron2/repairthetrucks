import { z } from 'zod';

// Enhanced validation schemas
export const issueSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  fleetNumber: z.string().min(1, 'Fleet number is required'),
  driverName: z.string().min(2, 'Driver name must be at least 2 characters'),
  driverPhone: z.string().regex(/^(\+61|0)[2-9]\d{8}$/, 'Invalid Australian phone number').optional(),
  location: z.string().optional(),
  safeToContinue: z.enum(['YES', 'NO', 'UNSURE']).optional(),
  primeRego: z.string().optional(),
  trailerA: z.string().optional(),
  trailerB: z.string().optional(),
});

export const workOrderSchema = z.object({
  issueId: z.string().cuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  workshopSite: z.string().optional(),
  workType: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => new Date(data.endAt) > new Date(data.startAt), {
  message: 'End time must be after start time',
  path: ['endAt'],
});

export const mappingSchema = z.object({
  kind: z.enum(['driver', 'fleet', 'trailerSet']),
  key: z.string().min(1, 'Key is required'),
  value: z.string().min(1, 'Value is required'),
});

export const commentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
});

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

// File validation
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported' };
  }
  
  return { valid: true };
}