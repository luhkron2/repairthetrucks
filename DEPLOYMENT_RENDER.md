# SE Repairs – Render Deployment Guide

This playbook walks through deploying the SE Repairs application to [Render](https://render.com) with a managed PostgreSQL instance and S3-compatible object storage.

## 1. Prerequisites
- GitHub (or GitLab/Bitbucket) repository containing this project
- Render account
- S3-compatible object storage (AWS S3, Cloudflare R2, Backblaze B2, etc.)
- Domain registrar access (for DNS cut-over)

---

## 2. Configure Object Storage
1. Create or identify a bucket that allows public read access to uploaded media.
2. Generate API credentials (`access key` / `secret`).
3. Record the following values for later:
   - `S3_BUCKET` – bucket name
   - `S3_REGION` – AWS region or provider region slug
   - `S3_ENDPOINT` – optional custom endpoint (R2/B2). Leave blank for AWS.
   - `S3_PUBLIC_BASE_URL` – the public URL prefix for objects (e.g. `https://bucket.s3.ap-southeast-2.amazonaws.com`)
   - `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`

> If your provider requires signed URLs instead of a public bucket, integrate that before go-live. The current implementation expects the bucket (or CDN in front) to serve files publicly.

---

## 3. Render Blueprint
Render can provision services via `render.yaml`. This repo includes a blueprint at `render.yaml`. Review it and adjust the following before applying:

- `services[0].name` – change if you prefer a different service name.
- `services[0].region` – choose the Render region closest to your users (`oregon`, `frankfurt`, etc.).
- `databases[0].plan` – upgrade from `starter` if you expect higher load.

Apply the blueprint:
```bash
render blueprint deploy render.yaml
```
Alternatively, create resources in the Render dashboard manually using the same settings.

---

## 4. Environment Variables
Configure these for the Web Service on Render:

| Key | Description |
| --- | --- |
| `DATABASE_URL` | Added automatically when using the Render Postgres add-on |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://<your-service>.onrender.com` after the first deploy, then update when adding a custom domain |
| `S3_BUCKET` | Bucket name |
| `S3_REGION` | Region slug |
| `S3_ENDPOINT` | Optional custom endpoint (leave blank for AWS) |
| `S3_PUBLIC_BASE_URL` | Public CDN/base URL |
| `S3_ACCESS_KEY_ID` | Object storage access key |
| `S3_SECRET_ACCESS_KEY` | Object storage secret |
| `NODE_ENV` | `production` |

> Tip: Use Render’s “Secret Files” feature if you prefer to load a full `.env.production` file.

---

## 5. Deployment Workflow
1. Push changes to the branch referenced in `render.yaml` (default `main`).
2. Render builds using `npm install` then runs `npm run start` (Next.js `next start`). Adjust the commands in `render.yaml` if you use a package manager other than npm.
3. First deploy will provision the Postgres instance. Once live, capture the public URL for later steps.

---

## 6. Database Migration & Seed
Run migrations using Render’s shell:
```bash
render shell <service-name>
npm run db:push
npm run db:seed   # optional, seeds mapping data
```

If you prefer GitHub Actions or your local machine:
```bash
DATABASE_URL="..." npm run db:push
DATABASE_URL="..." npm run db:seed
```

---

## 7. Smoke Tests After Deploy
1. **Mappings/API health**  
   - Visit the `/report` page; ensure fleet/driver drop-downs populate.  
   - Run `curl https://<service>.onrender.com/api/mappings` from your terminal and confirm JSON returns without errors.
2. **Issue submission flow**  
   - Submit a test issue with 1–2 small attachments; wait for the thank-you page with ticket number.  
   - In the Render Postgres dashboard (or via `render shell` + `psql`), query `SELECT ticket, driverName FROM "Issue" ORDER BY "createdAt" DESC LIMIT 1;`
3. **Authentication & RBAC**  
   - Log in at `/login` with the seeded `admin@example.com` account (`password123`).  
   - Hit `/operations` and `/workshop` to verify they redirect unauthenticated users but load once you’re signed in.
4. **File storage**  
   - Inspect the S3 bucket for newly uploaded objects; confirm they are publicly accessible at the URL returned from `/api/upload`.  
   - Optional: run `curl -X POST https://<service>.onrender.com/api/upload` with a `multipart/form-data` payload to script the test.
5. **Logs & metrics**  
   - Check the Render service logs for Prisma connection messages or upload warnings.  
   - Confirm no unhandled errors are emitted during the above tests.

---

## 8. Custom Domain Configuration
To link your own domain (e.g., `www.yourcompany.com`) to the Render service:

1. **Render Dashboard**:
   - Go to your Web Service in the Render Dashboard.
   - Click on **Settings** > **Custom Domains**.
   - Click **Add Custom Domain** and enter your domain name (e.g., `app.example.com` or `example.com`).
   - Render will display the required DNS records (usually a CNAME for subdomains or an A record for root domains).

2. **DNS Provider**:
   - Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.).
   - Add the DNS records provided by Render.
   - Wait for DNS propagation (can take minutes to hours).

3. **Update Environment Variables**:
   - Once the domain is verified and active, go back to the **Environment** tab in Render.
   - Update `NEXTAUTH_URL` to your new custom domain: `https://app.example.com`.
   - **Important**: If you are using Google OAuth or other social logins, you must also add this new domain to the "Authorized redirect URIs" in your provider's developer console (e.g., `https://app.example.com/api/auth/callback/google`).

4. **Verify**:
   - Visit your new domain.
   - Try logging in to ensure authentication flows work correctly with the new domain.

---


## 9. Ongoing Operations
- **Deployments:** Every push to the tracked branch triggers a deploy. Toggle “Auto-Deploy” off if you want manual promotion.
- **Database backups:** Render Postgres Starter keeps 7-day backups; schedule exports for longer retention.
- **Environment changes:** Update env vars in Render, then click “Restart Service” to apply.
- **Scaling:** Upgrade plan or enable background workers if you add scheduled jobs or heavy processing.

---

## 10. Troubleshooting
| Symptom | Check |
| --- | --- |
| Uploads fail | Confirm S3 credentials, bucket ACL, and `S3_PUBLIC_BASE_URL` |
| Authentication redirects to Render URL | Ensure `NEXTAUTH_URL` matches your active hostname |
| Prisma errors | Verify `DATABASE_URL` and that migrations have run |
| Cold starts | Upgrade plan or add health checks/pings if you need faster warm-up |

For further assistance, inspect service logs in Render and validate configs with `render services show <service-name>`.
