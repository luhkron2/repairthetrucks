# SE Repairs API Documentation

## Overview

The SE Repairs API provides comprehensive endpoints for managing fleet repair operations, including issue tracking, work order management, user authentication, and data export capabilities.

### Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

### Authentication

The API uses NextAuth.js for authentication. Most endpoints require authentication via session cookies or API tokens.

```javascript
// Example authenticated request
fetch('/api/issues', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'next-auth.session-token=...'
  }
})
```

## Core Endpoints

### Issues Management

#### GET /api/issues
Retrieve a list of issues with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 20)
- `status` (string): Filter by issue status
- `priority` (string): Filter by priority level
- `assignedTo` (string): Filter by assigned user ID
- `search` (string): Search in issue titles and descriptions

**Response:**
```json
{
  "issues": [
    {
      "id": "clx1234567890",
      "title": "Engine overheating",
      "description": "Engine temperature warning light activated",
      "status": "OPEN",
      "priority": "HIGH",
      "vehicleId": "TRUCK001",
      "reportedBy": "driver@company.com",
      "assignedTo": "mechanic@company.com",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T14:20:00Z",
      "location": "Highway 1, Mile 45",
      "estimatedCost": 1500.00,
      "actualCost": null,
      "media": [
        {
          "id": "media123",
          "url": "https://storage.example.com/images/engine-issue.jpg",
          "type": "image",
          "filename": "engine-issue.jpg"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### POST /api/issues
Create a new issue report.

**Request Body:**
```json
{
  "title": "Brake system malfunction",
  "description": "Brake pedal feels spongy, reduced stopping power",
  "vehicleId": "TRUCK002",
  "priority": "HIGH",
  "location": "Main Street Depot",
  "estimatedCost": 800.00,
  "media": ["media456", "media789"]
}
```

**Response:**
```json
{
  "id": "clx9876543210",
  "title": "Brake system malfunction",
  "status": "OPEN",
  "createdAt": "2024-01-15T16:45:00Z"
}
```

#### GET /api/issues/[id]
Retrieve detailed information about a specific issue.

**Response:**
```json
{
  "id": "clx1234567890",
  "title": "Engine overheating",
  "description": "Engine temperature warning light activated",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "vehicleId": "TRUCK001",
  "reportedBy": {
    "id": "user123",
    "name": "John Driver",
    "email": "driver@company.com"
  },
  "assignedTo": {
    "id": "user456",
    "name": "Mike Mechanic",
    "email": "mechanic@company.com"
  },
  "workOrder": {
    "id": "wo789",
    "scheduledDate": "2024-01-16T09:00:00Z",
    "estimatedDuration": 240,
    "status": "SCHEDULED"
  },
  "comments": [
    {
      "id": "comment123",
      "content": "Initial diagnosis complete. Requires coolant system flush.",
      "author": "Mike Mechanic",
      "createdAt": "2024-01-15T14:20:00Z"
    }
  ],
  "media": [],
  "timeline": [
    {
      "action": "CREATED",
      "timestamp": "2024-01-15T10:30:00Z",
      "user": "John Driver"
    },
    {
      "action": "ASSIGNED",
      "timestamp": "2024-01-15T11:15:00Z",
      "user": "Operations Manager"
    }
  ]
}
```

#### PATCH /api/issues/[id]
Update an existing issue.

**Request Body:**
```json
{
  "status": "RESOLVED",
  "actualCost": 1200.00,
  "resolution": "Replaced thermostat and flushed coolant system"
}
```

#### POST /api/issues/[id]/comments
Add a comment to an issue.

**Request Body:**
```json
{
  "content": "Parts have arrived. Starting repair work now.",
  "isInternal": false
}
```

### Work Orders

#### GET /api/workorders
Retrieve work orders with scheduling information.

**Query Parameters:**
- `date` (string): Filter by specific date (YYYY-MM-DD)
- `status` (string): Filter by work order status
- `mechanic` (string): Filter by assigned mechanic

**Response:**
```json
{
  "workOrders": [
    {
      "id": "wo789",
      "issueId": "clx1234567890",
      "title": "Engine overheating repair",
      "scheduledDate": "2024-01-16T09:00:00Z",
      "estimatedDuration": 240,
      "actualDuration": null,
      "status": "SCHEDULED",
      "assignedMechanic": {
        "id": "user456",
        "name": "Mike Mechanic"
      },
      "vehicle": {
        "id": "TRUCK001",
        "make": "Volvo",
        "model": "FH16",
        "year": 2020
      }
    }
  ]
}
```

#### POST /api/workorders
Create a new work order.

**Request Body:**
```json
{
  "issueId": "clx1234567890",
  "scheduledDate": "2024-01-16T09:00:00Z",
  "estimatedDuration": 240,
  "assignedMechanic": "user456",
  "priority": "HIGH"
}
```

### File Upload

#### POST /api/upload
Upload files (images, videos, documents) related to issues.

**Request:** Multipart form data
- `file`: File to upload
- `issueId` (optional): Associate with specific issue

**Response:**
```json
{
  "id": "media123",
  "url": "https://storage.example.com/uploads/image.jpg",
  "filename": "brake-issue-photo.jpg",
  "size": 2048576,
  "type": "image/jpeg"
}
```

### Fleet Management

#### GET /api/vehicles
Retrieve fleet vehicle information.

**Response:**
```json
{
  "vehicles": [
    {
      "id": "TRUCK001",
      "make": "Volvo",
      "model": "FH16",
      "year": 2020,
      "vin": "YV2A2A1C5LA123456",
      "licensePlate": "ABC-123",
      "status": "ACTIVE",
      "currentLocation": "Main Depot",
      "mileage": 125000,
      "lastService": "2024-01-01T00:00:00Z",
      "nextService": "2024-04-01T00:00:00Z"
    }
  ]
}
```

### User Management

#### GET /api/users
Retrieve user information (admin only).

**Response:**
```json
{
  "users": [
    {
      "id": "user123",
      "name": "John Driver",
      "email": "driver@company.com",
      "role": "DRIVER",
      "status": "ACTIVE",
      "lastLogin": "2024-01-15T08:30:00Z"
    }
  ]
}
```

### Analytics & Reporting

#### GET /api/analytics/dashboard
Retrieve dashboard analytics data.

**Response:**
```json
{
  "summary": {
    "totalIssues": 150,
    "openIssues": 25,
    "inProgressIssues": 15,
    "resolvedIssues": 110,
    "averageResolutionTime": 48.5,
    "totalCost": 125000.00
  },
  "trends": {
    "issuesThisMonth": 35,
    "issuesLastMonth": 28,
    "costThisMonth": 15000.00,
    "costLastMonth": 12000.00
  },
  "topIssueTypes": [
    {
      "type": "Engine",
      "count": 45,
      "percentage": 30
    },
    {
      "type": "Brakes",
      "count": 30,
      "percentage": 20
    }
  ]
}
```

#### GET /api/export/csv
Export data in CSV format.

**Query Parameters:**
- `type` (string): Data type to export (issues, workorders, vehicles)
- `dateFrom` (string): Start date for export
- `dateTo` (string): End date for export

**Response:** CSV file download

### Data Export

#### GET /api/export/pdf
Generate PDF reports.

**Query Parameters:**
- `reportType` (string): Type of report (summary, detailed, custom)
- `dateRange` (string): Date range for report
- `filters` (object): Additional filters

**Response:** PDF file download

## Error Handling

The API uses standard HTTP status codes and returns error details in JSON format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "vehicleId",
      "issue": "Vehicle ID is required"
    }
  }
}
```

### Common Error Codes

- `400` - Bad Request: Invalid input data
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `422` - Unprocessable Entity: Validation errors
- `500` - Internal Server Error: Server-side error

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **File uploads**: 100 requests per hour
- **Export operations**: 10 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
```

## Webhooks

Configure webhooks to receive real-time notifications about issue updates:

### Webhook Events

- `issue.created` - New issue reported
- `issue.updated` - Issue status changed
- `issue.assigned` - Issue assigned to mechanic
- `workorder.scheduled` - Work order scheduled
- `workorder.completed` - Work order completed

### Webhook Payload Example

```json
{
  "event": "issue.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "issueId": "clx1234567890",
    "title": "Engine overheating",
    "vehicleId": "TRUCK001",
    "priority": "HIGH",
    "reportedBy": "driver@company.com"
  }
}
```

## SDK and Libraries

### JavaScript/TypeScript SDK

```bash
npm install @se-repairs/sdk
```

```javascript
import { SERepairsClient } from '@se-repairs/sdk';

const client = new SERepairsClient({
  baseUrl: 'https://your-domain.com/api',
  apiKey: 'your-api-key'
});

// Create an issue
const issue = await client.issues.create({
  title: 'Brake issue',
  vehicleId: 'TRUCK001',
  priority: 'HIGH'
});
```

## Support

For API support and questions:

- **Documentation**: [docs.se-repairs.com](https://docs.se-repairs.com)
- **Support Email**: api-support@se-repairs.com
- **Developer Portal**: [developers.se-repairs.com](https://developers.se-repairs.com)

## Changelog

### v2.1.0 (Latest)
- Added webhook support
- Enhanced analytics endpoints
- Improved error handling
- Added rate limiting

### v2.0.0
- Complete API redesign
- Added authentication
- Improved performance
- Enhanced security