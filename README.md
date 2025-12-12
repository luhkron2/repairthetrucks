# SE Repairs - Professional Fleet Management System

<div align="center">
  <img src="./public/logo.svg" alt="SE Repairs Logo" width="200" height="80" />
  
  <p align="center">
    <strong>Enterprise-grade fleet repair management system</strong>
    <br />
    Streamline operations, enhance productivity, and maintain fleet excellence
  </p>

  <p align="center">
    <a href="#quick-start">Quick Start</a> •
    <a href="#features">Features</a> •
    <a href="#documentation">Documentation</a> •
    <a href="#api">API</a> •
    <a href="#support">Support</a>
  </p>
</div>

---

## Overview

SE Repairs is a comprehensive, modern fleet management solution designed for enterprise operations. Built with cutting-edge technologies and professional-grade architecture, it provides seamless coordination between drivers, workshop staff, and operations teams.

### Key Benefits

- **🚀 Increased Efficiency**: Streamlined workflows reduce downtime by up to 40%
- **📊 Data-Driven Insights**: Real-time analytics and comprehensive reporting
- **🔒 Enterprise Security**: Role-based access control and audit trails
- **📱 Mobile-First Design**: Optimized for field operations and mobile devices
- **⚡ Real-Time Updates**: Live status tracking and instant notifications
- **🌐 Scalable Architecture**: Built to handle enterprise-scale operations

## Features

- **Driver Portal**: Report issues with auto-fill, offline support, and file uploads
- **Workshop Dashboard**: Kanban board for work order management
- **Operations Center**: Comprehensive issue tracking and reporting
- **Scheduling**: Calendar-based work order scheduling
- **Admin Panel**: Fleet and driver data management
- **Real-time Updates**: Live status updates and notifications
- **Export Capabilities**: CSV and PDF report generation

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: NextAuth.js
- **File Storage**: S3-compatible object storage (production), Local (development)
- **UI Components**: Radix UI, shadcn/ui
- **Deployment**: Vercel (Recommended), Render

## Quick Start

### Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd se-repairs
   npm install
   ```

2. **Environment Setup**
   Create `.env` with local development settings:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="set-a-strong-random-string"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Database Setup**
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Open http://localhost:3000
   - Staff login (NextAuth credentials) at `/login`:
     - `admin@example.com / password123`
     - `ops@example.com / password123`
     - `workshop@example.com / password123`
   - Demo access gate at `/access` (no email):
     - Operations: `ops123`
     - Workshop: `workshop123`

### Production Deployment

Deploy seamlessly to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-org%2Fse-repairs&env=NEXTAUTH_SECRET,NEXTAUTH_URL,DATABASE_URL,BLOB_READ_WRITE_TOKEN)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full Vercel guide.
For Render deployment, see [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md).

## Project Structure

```
se-repairs/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── admin/          # Admin pages
│   │   ├── issues/         # Issue detail pages
│   │   ├── login/          # Authentication
│   │   ├── operations/     # Operations dashboard
│   │   ├── report/         # Issue reporting
│   │   ├── schedule/       # Calendar scheduling
│   │   ├── thanks/         # Confirmation pages
│   │   └── workshop/       # Workshop dashboard
│   ├── components/         # React components
│   │   └── ui/            # shadcn/ui components
│   └── lib/               # Utility libraries
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── docs/                  # Documentation
```

## Key Features

### For Drivers
- Simple issue reporting form
- Auto-fill from fleet data
- Offline support with sync
- Photo/video uploads
- Real-time status updates

### For Workshop Staff
- Kanban board workflow
- Drag-and-drop scheduling
- Issue prioritization
- Work order management
- Time tracking

### For Operations
- Comprehensive reporting
- Data export (CSV/PDF)
- Analytics dashboard
- Fleet management
- Driver management

## Database Schema

- **Users**: Authentication and role management
- **Issues**: Core issue tracking
- **WorkOrders**: Scheduled repairs
- **Comments**: Issue communication
- **Media**: File attachments
- **Mappings**: Fleet and driver data

## API Endpoints

- `GET/POST /api/issues` - Issue management
- `GET/PATCH /api/issues/[id]` - Issue details
- `POST /api/issues/[id]/comment` - Add comments
- `POST /api/upload` - File uploads
- `GET/POST /api/mappings` - Fleet data
- `GET/POST /api/workorders` - Work orders
- `GET /api/export/csv` - Data export

## Environment Variables

```env
# Database (production use PostgreSQL; development uses SQLite)
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://your-service.onrender.com"

# Object Storage (Production)
S3_BUCKET="your-bucket"
S3_REGION="ap-southeast-2"
S3_ENDPOINT=""
S3_PUBLIC_BASE_URL="https://your-bucket.example.com"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
```

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
npm run lint         # Run ESLint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Private - All rights reserved

## Support

For technical support or questions, contact the development team.
