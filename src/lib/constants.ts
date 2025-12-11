// Application constants
export const APP_CONFIG = {
  name: 'SE Repairs',
  description: 'Professional Fleet Management System',
  version: '2.0.0',
  author: 'Karan',
} as const;

export const API_ROUTES = {
  issues: '/api/issues',
  workOrders: '/api/workorders',
  mappings: '/api/mappings',
  upload: '/api/upload',
  export: {
    csv: '/api/export/csv',
    pdf: '/api/export/pdf',
  },
} as const;

export const ISSUE_CATEGORIES = [
  'Engine',
  'Transmission',
  'Brakes',
  'Electrical',
  'Tyres',
  'Suspension',
  'Body/Trailer',
  'Other',
] as const;

export const SEVERITY_LEVELS = {
  LOW: { label: 'Low', color: 'green', priority: 1 },
  MEDIUM: { label: 'Medium', color: 'yellow', priority: 2 },
  HIGH: { label: 'High', color: 'orange', priority: 3 },
  CRITICAL: { label: 'Critical', color: 'red', priority: 4 },
} as const;

export const STATUS_TYPES = {
  PENDING: { label: 'Pending', color: 'gray' },
  IN_PROGRESS: { label: 'In Progress', color: 'blue' },
  SCHEDULED: { label: 'Scheduled', color: 'purple' },
  COMPLETED: { label: 'Completed', color: 'green' },
} as const;

export const USER_ROLES = {
  DRIVER: { label: 'Driver', permissions: ['create_issue'] },
  WORKSHOP: { label: 'Workshop', permissions: ['view_issues', 'update_issues', 'create_workorder'] },
  OPERATIONS: { label: 'Operations', permissions: ['view_all', 'export_data'] },
  ADMIN: { label: 'Admin', permissions: ['full_access'] },
} as const;

export const FILE_UPLOAD = {
  maxSizeMB: 10, // used for both client and API validation
  allowedTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
  ],
  maxFiles: 10,
} as const;

export const CACHE_KEYS = {
  mappings: 'mappings',
  issues: 'issues',
  workOrders: 'workOrders',
} as const;

export const TIMEZONE = 'Australia/Melbourne';

export const PHONE_REGEX = /^(\+61|0)[2-9]\d{8}$/;
export const REGO_REGEX = /^[A-Z0-9]{3,6}$/;
