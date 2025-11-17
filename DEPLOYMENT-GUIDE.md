# ElctrDc Deployment Guide - Vercel + Neon PostgreSQL

This guide will walk you through deploying ElctrDc to Vercel with a Neon PostgreSQL database. Your application will be live 24/7 on Vercel's servers - **you don't need to keep your PC running**.

## 📋 Prerequisites

Before you begin, create free accounts on:

1. **GitHub** (you already have this) - [github.com](https://github.com)
2. **Vercel** - [vercel.com](https://vercel.com)
3. **Neon** (PostgreSQL Database) - [neon.tech](https://neon.tech)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. Make sure all your code is committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Set Up Neon PostgreSQL Database

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Click **"Create a project"**
3. Configure your database:
   - **Project name**: `elctrdc` (or any name you prefer)
   - **Database name**: `elctrdc`
   - **Region**: Choose closest to your users (e.g., US East, EU West)
4. Click **"Create Project"**
5. Copy the **connection string** that appears - it looks like:
   ```
   postgresql://username:password@ep-xyz-123.region.aws.neon.tech/elctrdc?sslmode=require
   ```
6. **IMPORTANT**: Save this connection string - you'll need it for Vercel

### Step 3: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended for First Time)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository:
   - Find **"sukesh19o224-cpu/ElctrDc"**
   - Click **"Import"**

4. Configure your project:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should be pre-filled)
   - **Install Command**: `npm install --legacy-peer-deps`

5. Add Environment Variables (Click "Environment Variables"):

   **Required Variables:**

   ```env
   # Database
   DATABASE_URL = [paste your Neon connection string here]

   # NextAuth
   NEXTAUTH_URL = https://your-app.vercel.app
   NEXTAUTH_SECRET = [generate a random secret - see below]
   ```

   **How to generate NEXTAUTH_SECRET:**
   ```bash
   # Run this in your terminal:
   openssl rand -base64 32

   # Or use this online: https://generate-secret.vercel.app/32
   ```

6. Click **"Deploy"**

7. Wait for deployment (usually 2-5 minutes)

8. Once deployed, you'll get a URL like: `https://elctrdc.vercel.app`

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

### Step 4: Initialize Database Schema

After deployment, you need to create the database tables:

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Verify `DATABASE_URL` is set correctly
4. Go to **"Deployments"** tab
5. Find your latest deployment and click on it
6. In the deployment details, you'll see the deployment URL

7. **Run Prisma migrations** (Two options):

   **Option A: Using Vercel CLI locally:**
   ```bash
   # Make sure you have the DATABASE_URL in your .env file
   echo "DATABASE_URL=your_neon_connection_string" > .env

   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma db push
   ```

   **Option B: Using Vercel's built-in tools:**
   - Vercel will automatically run migrations during build if configured
   - Check `package.json` - the `vercel-build` script should include migration

### Step 5: Update Environment Variables

1. Go back to Vercel dashboard → Your Project → **"Settings"** → **"Environment Variables"**
2. Update `NEXTAUTH_URL` with your actual Vercel URL:
   ```env
   NEXTAUTH_URL = https://your-actual-app.vercel.app
   ```
3. Click **"Save"**
4. Redeploy your application:
   - Go to **"Deployments"** tab
   - Click the three dots on the latest deployment
   - Click **"Redeploy"**

### Step 6: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try creating an account
3. Try logging in
4. Create a test project
5. Upload a test file
6. Test local folder sync feature (Chrome/Edge only)

## 🔧 Configuration Files Explained

### vercel.json
Already configured in your project with:
- Build and install commands
- Environment variables mapping
- API function timeouts
- CORS headers

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `NEXTAUTH_URL` | Your deployed app URL | `https://elctrdc.vercel.app` |
| `NEXTAUTH_SECRET` | Secret for session encryption | `[random 32-char string]` |

## 📊 Free Tier Limits

### Vercel Free Tier
- ✅ 100GB bandwidth per month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Good for 1,000+ monthly users

### Neon Free Tier
- ✅ 0.5GB storage
- ✅ 1 project
- ✅ Auto-suspend after inactivity (good for saving resources)
- ✅ Good for 10,000+ records

**Total Cost: $0/month for most research labs!**

## 🐛 Troubleshooting

### Build Fails with Dependency Errors
```bash
# Solution: Use --legacy-peer-deps
# Already configured in vercel.json
```

### Database Connection Error
1. Check your `DATABASE_URL` in Vercel environment variables
2. Make sure connection string ends with `?sslmode=require`
3. Verify Neon database is active (not paused)

### NextAuth Error: "Invalid URL"
1. Make sure `NEXTAUTH_URL` matches your actual Vercel URL
2. Include `https://` in the URL
3. No trailing slash

### Prisma Schema Not Applied
```bash
# Run this locally with DATABASE_URL in .env:
npx prisma db push

# Or redeploy on Vercel (build script runs migrations)
```

### File Upload Not Working
- File uploads use browser memory (no server storage needed)
- Large files may hit browser limits (usually 50-100MB)
- For larger files, consider implementing cloud storage (S3/R2)

### Local Folder Sync Not Working
- Only works on Chrome, Edge, and Chromium-based browsers
- Requires HTTPS (works on Vercel, not on localhost without SSL)
- User must grant permission to folder

## 🔄 Updating Your Deployment

Every time you push to GitHub, Vercel automatically deploys:

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically deploys in ~2 minutes
```

**Manual deployment:**
- Go to Vercel dashboard → Deployments → Click "Redeploy"

## 🌐 Custom Domain (Optional)

### Using Vercel's Free Domain
You get: `your-app.vercel.app` (already works!)

### Using Your Own Domain
1. Buy a domain (Namecheap, GoDaddy, etc.) - ~$12/year
2. In Vercel: Settings → Domains → Add Domain
3. Follow Vercel's DNS instructions
4. Update `NEXTAUTH_URL` environment variable
5. Redeploy

## 📈 Monitoring Your Application

### Vercel Analytics (Built-in)
- Go to your project → "Analytics" tab
- See page views, performance, etc.

### Database Monitoring (Neon)
- Go to Neon dashboard → Your project
- See connection count, storage usage, etc.

## 🔐 Security Best Practices

1. **Never commit `.env` files** to GitHub
   - Already in `.gitignore`
   - Use Vercel's environment variables

2. **Rotate secrets regularly**
   - Generate new `NEXTAUTH_SECRET` every few months
   - Update in Vercel environment variables

3. **Use strong database passwords**
   - Neon generates strong passwords automatically

4. **Enable 2FA on Vercel and Neon**
   - Adds extra security layer

## 💡 Performance Tips

1. **Enable Vercel Analytics**
   - Free on all plans
   - Shows real user performance data

2. **Monitor Database Usage**
   - Neon shows query performance
   - Optimize slow queries

3. **Use Edge Functions** (if needed)
   - For faster API responses
   - Already configured for API routes

## 📞 Getting Help

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

## ✅ Deployment Checklist

Before considering deployment complete:

- [ ] Vercel project created and deployed
- [ ] Neon database created and connected
- [ ] All environment variables set correctly
- [ ] Database schema migrated successfully
- [ ] Can create account and login
- [ ] Can create projects
- [ ] Can upload files
- [ ] Local folder sync works (Chrome/Edge)
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring set up

## 🎉 Success!

Once deployed:
- ✅ Your app runs 24/7 on Vercel's servers
- ✅ You don't need to keep your PC running
- ✅ Users can access from anywhere in the world
- ✅ Automatic HTTPS and security
- ✅ Global CDN for fast loading
- ✅ Automatic deployments on push

**Your ElctrDc app is now live and accessible to anyone!** 🚀

Share your URL with your team and start collaborating!
