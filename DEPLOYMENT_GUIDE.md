# 🚀 How to Deploy ElctrDc (Collaborator Guide)

This guide explains how to deploy your own version of ElctrDc to Vercel for free using the "Fork Method". This avoids the Vercel Pro requirement for teams.

## Step 1: Fork the Repository
1. Go to the main repository on GitHub: [https://github.com/sukesh19o224-cpu/ElctrDc](https://github.com/sukesh19o224-cpu/ElctrDc)
2. Click the **"Fork"** button in the top-right corner.
3. Create the fork under **your own personal GitHub account**.

## Step 2: Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** -> **"Project"**.
3. Select **your forked repository** (e.g., `your-username/ElctrDc`) and click **Import**.

## Step 3: Configure Environment Variables (CRITICAL)
Before clicking "Deploy", you must add the following Environment Variables in the Vercel project setup screen.

**Copy and paste these exact values:**

| Variable Name | Value |
|--------------|-------|
| `GROQ_API_KEY` | `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` |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_yLiTBVnK6b5Y@ep-weathered-bird-a41yx8y6-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_SECRET` | `GgyEsV5aQ7C9fUUai88dixuUb9NafO/AD4mTaJWzEes=` |
| `NEXTAUTH_URL` | `https://YOUR-VERCEL-APP-URL.vercel.app` (Update this after deployment!) |

### ⚠️ Important Note on `NEXTAUTH_URL`
- For the initial deployment, you can set `NEXTAUTH_URL` to `http://localhost:3000`.
- **After deployment succeeds**, Vercel will give you a domain (e.g., `elctrdc-friend.vercel.app`).
- Go to **Settings -> Environment Variables** in Vercel, update `NEXTAUTH_URL` to your actual Vercel domain, and **Redeploy**.

### ⚠️ Missing Variable: `BLOB_READ_WRITE_TOKEN`
This token is required for file uploads (PDFs, images). You need to create your own free Blob store on Vercel:

1. Go to your Vercel Dashboard.
2. Click the **"Storage"** tab at the top.
3. Click **"Create Database"** -> Select **"Blob"** -> Click **"Continue"**.
4. Give it a name (e.g., `elctrdc-blob`) and click **"Create"**.
5. Once created, scroll down to **"Environment Variables"**.
6. Copy the value for `BLOB_READ_WRITE_TOKEN` (starts with `vercel_blob_rw_...`).
7. Go back to your Project Settings -> Environment Variables and add it there.

## Step 4: Deploy
1. Click **"Deploy"**.
2. Wait for the build to finish (approx. 2-3 minutes).
3. Once live, your app is ready!

## Step 5: How to Collaborate
- **To make changes:** Edit code on your laptop, push to your fork (`git push origin main`). Vercel will auto-deploy your site.
- **To share changes:** Go to GitHub and open a **Pull Request** from your fork to the original repository.
- **To get updates:** Click **"Sync Fork"** on your GitHub repo page to pull the latest changes from the original repo.
