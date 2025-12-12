# SE Repairs Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying SE Repairs to production environments. The application supports multiple deployment strategies including cloud platforms, containerized environments, and traditional server deployments.

## Prerequisites

### System Requirements

- **Node.js**: Version 18.17.0 or higher
- **PostgreSQL**: Version 13 or higher
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 10GB available space
- **Network**: HTTPS support required for production

### Required Services

- **Database**: PostgreSQL instance
- **File Storage**: S3-compatible object storage
- **Email Service**: SMTP server for notifications
- **SSL Certificate**: For HTTPS encryption

## Environment Configuration

### Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Application
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars

# Database
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Authentication
NEXTAUTH_PROVIDERS=credentials,google,azure
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Storage (S3-compatible)
S3_BUCKET=se-repairs-production
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com
S3_PUBLIC_BASE_URL=https://your-bucket.s3.amazonaws.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@your-company.com
SMTP_PASS=your-app-password
SMTP_FROM=SE Repairs <notifications@your-company.com>

# Monitoring & Analytics
SENTRY_DSN=https://your-sentry-dsn
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# Security
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=3600000

# Features
ENABLE_WEBHOOKS=true
ENABLE_ANALYTICS=true
ENABLE_FILE_UPLOADS=true
MAX_FILE_SIZE=10485760
```

### Security Configuration

#### SSL/TLS Setup

Ensure your deployment includes proper SSL/TLS configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Deployment Methods

### Method 1: Cloud Platform Deployment (Recommended)

#### Vercel Deployment

1. **Connect Repository**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all production environment variables
   - Ensure `DATABASE_URL` points to your production database

3. **Database Setup**
   ```bash
   # Run migrations
   npx prisma migrate deploy
   
   # Seed initial data
   npx prisma db seed
   ```

#### Render Deployment

1. **Create New Web Service**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set start command: `npm start`

2. **Environment Configuration**
   - Add all environment variables in Render dashboard
   - Configure auto-deploy from main branch

3. **Database Setup**
   - Create PostgreSQL database in Render
   - Update `DATABASE_URL` in environment variables
   - Run database migrations

### Method 2: Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/se_repairs
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: se_repairs
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Deployment Commands

```bash
# Build and start services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npx prisma db seed

# View logs
docker-compose logs -f app
```

### Method 3: Traditional Server Deployment

#### Server Setup (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx
```

#### Application Deployment

```bash
# Clone repository
git clone https://github.com/your-org/se-repairs.git
cd se-repairs

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Set up environment
cp .env.example .env.production
# Edit .env.production with your configuration

# Run database migrations
npx prisma migrate deploy

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Configure PM2 to start on boot
pm2 startup
pm2 save
```

#### PM2 Configuration (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'se-repairs',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

## Database Setup

### PostgreSQL Configuration

#### Production Database Setup

```sql
-- Create database
CREATE DATABASE se_repairs_production;

-- Create user
CREATE USER se_repairs_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE se_repairs_production TO se_repairs_user;

-- Enable required extensions
\c se_repairs_production;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

#### Database Migrations

```bash
# Deploy migrations to production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed initial data
npx prisma db seed
```

#### Backup Strategy

```bash
#!/bin/bash
# backup.sh - Daily database backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/se-repairs"
DB_NAME="se_repairs_production"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

## Monitoring & Maintenance

### Health Checks

Create health check endpoints:

```javascript
// pages/api/health.js
export default function handler(req, res) {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    checks: {
      database: 'OK', // Add actual DB check
      storage: 'OK',   // Add actual storage check
      memory: process.memoryUsage()
    }
  };
  
  res.status(200).json(healthcheck);
}
```

### Logging Configuration

```javascript
// lib/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export default logger;
```

### Performance Monitoring

#### Application Metrics

```bash
# Install monitoring tools
npm install @sentry/nextjs newrelic

# Configure Sentry
# sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

#### Server Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Set up log rotation
sudo nano /etc/logrotate.d/se-repairs
```

## Security Hardening

### Application Security

1. **Environment Variables**
   - Never commit secrets to version control
   - Use strong, unique passwords
   - Rotate secrets regularly

2. **Database Security**
   - Use connection pooling
   - Enable SSL connections
   - Regular security updates

3. **File Upload Security**
   - Validate file types
   - Scan for malware
   - Limit file sizes

### Server Security

```bash
# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Install fail2ban
sudo apt install fail2ban

# Configure automatic updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database connectivity
npx prisma db pull

# Verify environment variables
echo $DATABASE_URL

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### Memory Issues

```bash
# Monitor memory usage
free -h
htop

# Check application memory
pm2 monit

# Restart application if needed
pm2 restart se-repairs
```

#### SSL Certificate Issues

```bash
# Renew SSL certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect your-domain.com:443

# Check certificate expiry
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Log Analysis

```bash
# Application logs
pm2 logs se-repairs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
sudo journalctl -u postgresql -f
```

## Rollback Procedures

### Application Rollback

```bash
# Rollback to previous version
git checkout previous-stable-tag
npm ci --only=production
npm run build
pm2 restart se-repairs
```

### Database Rollback

```bash
# Restore from backup
gunzip backup_YYYYMMDD_HHMMSS.sql.gz
psql se_repairs_production < backup_YYYYMMDD_HHMMSS.sql
```

## Support & Maintenance

### Regular Maintenance Tasks

1. **Daily**
   - Monitor application logs
   - Check system resources
   - Verify backup completion

2. **Weekly**
   - Review security logs
   - Update dependencies
   - Performance analysis

3. **Monthly**
   - Security updates
   - Database optimization
   - Capacity planning

### Support Contacts

- **Technical Support**: workshop@senational.com.au
- **Emergency Hotline**: +1-800-SE-REPAIRS
- **Documentation**: https://docs.se-repairs.com
- **Status Page**: https://status.se-repairs.com

## Appendix

### Useful Commands

```bash
# Application management
pm2 start/stop/restart se-repairs
pm2 logs se-repairs
pm2 monit

# Database management
npx prisma studio
npx prisma db push
npx prisma migrate status

# System monitoring
htop
iotop
df -h
free -h

# SSL management
sudo certbot certificates
sudo certbot renew --dry-run
```

### Configuration Templates

All configuration templates and scripts are available in the `/deployment` directory of the repository.
