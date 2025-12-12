# SE Repairs – Vercel Deployment Guide

This guide walks through deploying the SE Repairs application to [Vercel](https://vercel.com), the creators of Next.js. This is the recommended deployment method for best performance and ease of use.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-org%2Fse-repairs&env=NEXTAUTH_SECRET,NEXTAUTH_URL,POSTGRES_PRISMA_URL,POSTGRES_URL_NON_POOLING,BLOB_READ_WRITE_TOKEN)

## 1. Prerequisites
- GitHub repository containing this project
- Vercel account
- A Postgres database (Vercel Postgres or external)
- Blob storage (Vercel Blob or S3)

---

## 2. One-Click Deployment (Recommended)
1. Click the **Deploy with Vercel** button above.
2. Link your GitHub account and select the repository.
3. Vercel will prompt you to configure the project.
   - **Database**: Add the **Vercel Postgres** integration.
   - **Storage**: Add the **Vercel Blob** integration.
4. **Environment Variables**: Fill in the required variables (see below).

---

## 3. Manual Configuration

### Database (Vercel Postgres)
1. In your Vercel project dashboard, go to the **Storage** tab.
2. Click **Connect Store** and select **Postgres**.
3. Once created, Vercel automatically adds `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` to your environment variables.
4. **Important**: Update your `schema.prisma` to use these variables if not already set (it defaults to `DATABASE_URL`).
   - If using Vercel Postgres, set `DATABASE_URL` in your Vercel environment variables to the value of `POSTGRES_PRISMA_URL`.

### File Storage (Vercel Blob)
1. In the **Storage** tab, click **Connect Store** and select **Blob**.
2. This automatically adds `BLOB_READ_WRITE_TOKEN` to your environment variables.
3. The application is already configured to prioritize Vercel Blob if this token is present.

### Environment Variables
Configure these in **Settings > Environment Variables**:

| Key | Description |
| --- | --- |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your deployment URL (e.g., `https://se-repairs.vercel.app`) |
| `DATABASE_URL` | Connection string for your database (use `POSTGRES_PRISMA_URL` if using Vercel Postgres) |
| `BLOB_READ_WRITE_TOKEN` | Automatically set by Vercel Blob integration |

**Legacy S3 Support**:
If you prefer S3 over Vercel Blob, set the following instead of `BLOB_READ_WRITE_TOKEN`:
- `S3_BUCKET`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

---

## 4. Post-Deployment Steps

### Database Migration
After deployment, you need to push your database schema:

1. Go to your Vercel dashboard.
2. Navigate to the **Deployments** tab.
3. Click the three dots on the latest deployment and select **Redeploy** (ensure "Build Cache" is unchecked if you changed env vars).
4. Alternatively, run migrations locally against the production database:
   ```bash
   # Get the connection string from Vercel dashboard
   export DATABASE_URL="postgres://..."
   npm run db:push
   npm run db:seed
   ```

### Custom Domain
1. Go to **Settings > Domains**.
2. Add your custom domain (e.g., `www.yourcompany.com`).
3. Update `NEXTAUTH_URL` in Environment Variables to match the new domain.

---

## 5. Troubleshooting
- **Database Connection Errors**: Ensure `DATABASE_URL` is set correctly. If using Vercel Postgres, it handles connection pooling automatically.
- **Upload Errors**: Check if `BLOB_READ_WRITE_TOKEN` is present. If using S3, check your credentials.
