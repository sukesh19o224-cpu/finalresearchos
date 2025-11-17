# ElctrDc Deployment Guide

This guide will help you deploy ElctrDc to Vercel for production use.

## Prerequisites

- GitHub account with ElctrDc repository
- Vercel account (free tier works)
- PostgreSQL database (Neon, Supabase, or Railway recommended)

## Step 1: Prepare Your Database

1. Create a PostgreSQL database on your preferred platform:
   - **Neon** (recommended): https://neon.tech
   - **Supabase**: https://supabase.com
   - **Railway**: https://railway.app

2. Get your database connection string (it should look like):
   ```
   postgresql://user:password@host:5432/database?sslmode=require
   ```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard

1. Go to https://vercel.com/new

2. Import your GitHub repository:
   - Click "Import Git Repository"
   - Select `sukesh19o224-cpu/ElctrDc`
   - Click "Import"

3. Configure your project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install --legacy-peer-deps`

4. Add Environment Variables:
   ```
   DATABASE_URL=<your-postgresql-connection-string>
   NEXTAUTH_SECRET=<generate-random-32-char-string>
   NEXTAUTH_URL=https://your-project.vercel.app
   ```

   To generate NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

5. Click "Deploy"

### Option B: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project directory:
   ```bash
   cd /path/to/ElctrDc
   vercel
   ```

4. Follow the prompts and add environment variables when asked

## Step 3: Setup Database

After deployment, you need to initialize the database:

1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Functions"
3. Add the following environment variable:
   ```
   DATABASE_URL=<your-postgresql-connection-string>
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

   Or use Vercel's command:
   ```bash
   vercel env pull
   npx prisma db push
   ```

## Step 4: Verify Deployment

1. Visit your deployment URL: `https://your-project.vercel.app`
2. Create a test account
3. Upload a sample dataset
4. Test all features:
   - Data upload and visualization
   - Export functionality
   - Literature management
   - Project timeline
   - Collaboration features

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret for JWT encryption | Generated 32-char string |
| `NEXTAUTH_URL` | Your production URL | `https://your-app.vercel.app` |

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Check that all dependencies are installed:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Ensure Prisma is generated:
   ```bash
   npx prisma generate
   ```

3. Clear Vercel cache and redeploy:
   - Go to project settings
   - Under "General" → "Build & Development Settings"
   - Enable "Clear cache on deploy"

### Database Connection Issues

If database connection fails:

1. Verify your DATABASE_URL is correct
2. Ensure SSL is enabled: `?sslmode=require`
3. Check database firewall allows connections from Vercel IPs
4. For Neon/Supabase: Enable pooling if needed

### Performance Optimization

For better performance:

1. Enable Vercel Edge Functions for API routes
2. Configure ISR (Incremental Static Regeneration) for dashboards
3. Use Vercel Image Optimization for plots
4. Enable CDN caching for static assets

## Custom Domain Setup

To add a custom domain:

1. Go to project "Settings" → "Domains"
2. Add your domain (e.g., `elctrdc.yourdomain.com`)
3. Configure DNS records as shown
4. Update `NEXTAUTH_URL` to your custom domain

## Monitoring & Analytics

Vercel provides built-in analytics:

1. Go to "Analytics" tab in your project
2. View real-time metrics:
   - Page views
   - Function execution times
   - Error rates
   - Geographic distribution

## Scaling

As your usage grows:

1. **Database**: Upgrade to larger PostgreSQL instance
2. **Functions**: Increase timeout limits in `vercel.json`
3. **Storage**: Consider adding S3/R2 for large files
4. **Caching**: Implement Redis for session management

## Security Checklist

- ✅ HTTPS enabled (automatic with Vercel)
- ✅ Environment variables secured
- ✅ Database uses SSL connections
- ✅ CORS properly configured
- ✅ API rate limiting enabled
- ✅ Regular security updates

## Support

For issues specific to:
- **Vercel**: https://vercel.com/support
- **ElctrDc**: Open an issue on GitHub
- **Database**: Contact your database provider

## Continuous Deployment

Every push to your `main` branch will automatically:
1. Trigger a new build
2. Run tests (if configured)
3. Deploy to production
4. Update edge cache

To disable auto-deploy:
1. Go to project "Settings" → "Git"
2. Toggle "Auto-deploy" settings

---

**Need help?** Check the [main README](./README.md) or open an issue on GitHub.
