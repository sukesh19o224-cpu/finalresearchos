@echo off
REM Deploy script to merge claude branch to main and trigger Vercel deployment

echo.
echo 🚀 Deploying ResearchOS to main branch...
echo.

REM Fetch latest from remote
echo 📥 Fetching latest changes...
git fetch origin

REM Checkout main branch
echo 📂 Switching to main branch...
git checkout main

REM Merge claude branch
echo 🔀 Merging claude/resume-session-01Rtx7a3cdwFdLW83tvwhrib to main...
git merge claude/resume-session-01Rtx7a3cdwFdLW83tvwhrib -m "Deploy: Complete platform redesign with AI features"

REM Push to main
echo 📤 Pushing to main branch...
git push origin main

echo.
echo ✅ Successfully deployed to main!
echo 🌐 Vercel will automatically deploy in ~2 minutes
echo.
echo Check deployment status at: https://vercel.com/dashboard
pause
