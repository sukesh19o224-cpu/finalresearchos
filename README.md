# ResearchOS - Electrochemistry Research Platform

![ResearchOS Banner](https://img.shields.io/badge/ResearchOS-Research%20Platform-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**ResearchOS** is a modern, full-stack web platform for electrochemistry research data management, visualization, and collaboration. Built with Next.js 14, it provides researchers with powerful tools to organize experiments, analyze data, and share findings with colleagues.

🌐 **Live Demo**: [https://research-os.vercel.app](https://research-os.vercel.app)

---

## 📚 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [User Guide](#-user-guide)
- [Deployment](#-deployment)
- [Technical Stack](#-technical-stack)
- [File Format Support](#-file-format-support)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Features

### Core Features
- **Project Management**: Organize research into projects with datasets, notes, and visualizations
- **Multi-Format Support**: Import data from BioLogic (.mpt), Gamry (.dta), CSV, and more
- **Interactive Visualizations**: Create beautiful, publication-ready plots with Plotly
- **Data Analysis**: Support for CV, EIS, Battery Cycling, CA, CP, and Tafel techniques
- **Real-time Collaboration**: Invite team members and manage permissions (Owner/Editor/Viewer)
- **Data Export**: Export results to CSV, JSON, Excel with UTF-8 support

### Advanced Features
- **Dashboard Analytics**: Real-time statistics and activity tracking
- **Global Search**: Quick search across projects, datasets, and visualizations (Ctrl+K)
- **Keyboard Shortcuts**: Power user features for faster navigation
- **Batch Operations**: Bulk actions on multiple items
- **Tag Management**: Organize content with custom tags
- **Activity Timeline**: Track all project activities
- **Performance Monitoring**: Real-time system health metrics
- **File Preview**: Preview data before downloading
- **Data Comparison**: Compare up to 4 datasets side-by-side

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Ready**: Modern UI with Tailwind CSS
- **Loading States**: Smooth skeleton loaders for better UX
- **Error Handling**: Custom 404 and error pages with helpful navigation
- **Notifications**: Real-time notification system

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- **Node.js** 20.0.0 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** database (local or cloud)
- **Git** installed on your system

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ResearchOS.git
   cd ResearchOS
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your values:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/researchos"

   # Authentication
   NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
   NEXTAUTH_URL="http://localhost:3000"

   # Optional: File Upload (if using S3)
   NEXT_PUBLIC_AWS_REGION="us-east-1"
   NEXT_PUBLIC_AWS_BUCKET="your-bucket-name"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 User Guide

### Getting Started

#### 1. Create an Account
- Navigate to the sign-up page
- Enter your email and create a password
- Verify your email address

#### 2. Dashboard Overview
After logging in, you'll see your dashboard with:
- **Stats Overview**: Total projects, datasets, visualizations, and active experiments
- **Quick Actions**: Create new project, view all projects, AI assistant (coming soon)
- **Research Analytics**: Visual charts of your research activity
- **Recent Projects**: Quick access to your latest work
- **Recent Activity**: Timeline of recent uploads and analyses

### Creating Your First Project

1. **Click "New Project"** from the dashboard or press `N`
2. **Fill in project details**:
   - **Title**: Give your project a descriptive name
   - **Description**: Add context about your research
   - **Tags**: Add relevant tags (e.g., "Battery", "CV", "EIS")
3. **Click "Create Project"**

### Uploading Data

1. **Open your project**
2. **Click "Upload Dataset"**
3. **Select your file** (Supported formats: .mpt, .dta, .csv, .txt)
4. **Add metadata** (optional):
   - Technique (CV, EIS, Battery Cycling, etc.)
   - Instrument used
   - Notes about the experiment
5. **Click "Upload"**

### Data Visualization

1. **Navigate to your dataset**
2. **Click "Create Visualization"**
3. **Choose plot type**:
   - Line plot
   - Scatter plot
   - Nyquist plot (for EIS)
   - Tafel plot
   - Custom
4. **Customize your plot**:
   - Select X and Y axes
   - Adjust colors and styles
   - Add annotations
5. **Export** as PNG, JPEG, or SVG

### Exporting Data

1. **Select datasets** using batch operations
2. **Click "Export"**
3. **Choose format**:
   - CSV (UTF-8 with BOM for Excel compatibility)
   - JSON (structured data)
   - Excel-compatible CSV
4. **Download** your file

### Collaboration

1. **Open your project**
2. **Click "Collaborators"**
3. **Click "Invite"**
4. **Enter collaborator's email**
5. **Choose role**:
   - **Owner**: Full control (can delete project)
   - **Editor**: Can view, edit, and upload data
   - **Viewer**: Read-only access
6. **Send invitation**

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` or `⌘K` | Open global search |
| `G` then `D` | Go to dashboard |
| `G` then `P` | Go to projects |
| `N` | Create new project |
| `?` | Show all shortcuts |
| `ESC` | Close dialogs |

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

#### Step 1: Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

#### Step 2: Set Up Database

1. **Create a Vercel Postgres database** or use **Neon** (recommended):
   - Go to [Neon](https://neon.tech) or Vercel Dashboard
   - Create a new PostgreSQL database
   - Copy the connection string

2. **Run database migrations**:
   ```bash
   DATABASE_URL="your-production-db-url" npx prisma db push
   ```

#### Step 3: Deploy to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

   OR use the Vercel Dashboard:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure as follows:

#### Step 4: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
```

#### Step 5: Deploy

- Vercel will automatically build and deploy
- Your app will be live at `https://your-app.vercel.app`

### Deploy to Other Platforms

<details>
<summary><b>Railway</b></summary>

1. Create a new project on [Railway](https://railway.app)
2. Add PostgreSQL database
3. Connect your GitHub repository
4. Add environment variables
5. Deploy
</details>

<details>
<summary><b>Render</b></summary>

1. Create a new Web Service on [Render](https://render.com)
2. Connect your repository
3. Add PostgreSQL database
4. Set build command: `npm install --legacy-peer-deps && npm run build`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy
</details>

---

## 🛠 Technical Stack

### Frontend
- **Next.js 14.2.3**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality component library
- **Plotly.js**: Interactive data visualization
- **Lucide Icons**: Modern icon library

### Backend
- **Next.js API Routes**: Serverless API
- **Prisma ORM**: Type-safe database access
- **PostgreSQL**: Relational database
- **NextAuth.js**: Authentication

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **TypeScript**: Static type checking

### Project Structure

```
ElctrDc/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                  # Authentication pages
│   ├── (dashboard)/             # Dashboard pages
│   │   └── dashboard/
│   │       ├── page.tsx         # Main dashboard
│   │       ├── projects/        # Projects pages
│   │       ├── profile/         # User profile
│   │       └── favorites/       # Favorites page
│   ├── api/                     # API routes
│   │   ├── auth/               # NextAuth endpoints
│   │   ├── projects/           # Project CRUD
│   │   └── datasets/           # Dataset management
│   ├── page.tsx                # Landing page
│   ├── layout.tsx              # Root layout
│   ├── error.tsx               # Error boundary
│   └── not-found.tsx           # 404 page
│
├── components/                  # React components
│   ├── ui/                     # shadcn/ui components
│   ├── dashboard/              # Dashboard components
│   ├── projects/               # Project components
│   ├── analysis/               # Analysis components
│   ├── shared/                 # Shared components
│   └── auth/                   # Auth components
│
├── lib/                        # Utility functions
│   ├── db.ts                  # Prisma client
│   ├── auth.ts                # Auth configuration
│   ├── utils.ts               # Helper functions
│   └── export/                # Data export utilities
│
├── prisma/                     # Database schema
│   └── schema.prisma          # Prisma schema
│
├── public/                     # Static assets
│
├── .env                       # Environment variables (gitignored)
├── .env.example              # Environment template
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

---

## 📁 File Format Support

### Supported Input Formats

| Format | Extension | Instrument | Notes |
|--------|-----------|------------|-------|
| BioLogic | `.mpt` | BioLogic SP/VSP series | Auto-detected headers |
| Gamry | `.dta` | Gamry Reference/Interface | Binary format supported |
| CSV | `.csv` | Universal | UTF-8 encoding recommended |
| Text | `.txt` | Universal | Tab or comma delimited |

### Supported Techniques

- **Cyclic Voltammetry (CV)**
- **Electrochemical Impedance Spectroscopy (EIS)**
- **Battery Cycling**
- **Chronoamperometry (CA)**
- **Chronopotentiometry (CP)**
- **Tafel Analysis**
- **Custom techniques**

### Export Formats

- **CSV**: Standard comma-separated values
- **JSON**: Structured JavaScript Object Notation
- **Excel CSV**: UTF-8 with BOM for Excel compatibility
- **PNG/JPEG/SVG**: Plot exports

---

## 🔧 Troubleshooting

### Common Issues

<details>
<summary><b>Build fails with TypeScript errors</b></summary>

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Rebuild
npm run build
```
</details>

<details>
<summary><b>Database connection errors</b></summary>

**Check**:
1. Is your DATABASE_URL correct in `.env`?
2. Is PostgreSQL running?
3. Have you run `npx prisma db push`?

**Solution**:
```bash
# Test database connection
npx prisma db pull

# Reset database (⚠️ deletes all data)
npx prisma db push --force-reset
```
</details>

<details>
<summary><b>Authentication not working</b></summary>

**Check**:
1. Is NEXTAUTH_SECRET set in `.env`?
2. Is NEXTAUTH_URL correct for your environment?

**Generate new secret**:
```bash
openssl rand -base64 32
```
</details>

<details>
<summary><b>File upload fails</b></summary>

**Check**:
1. File size limits (default 10MB)
2. File format is supported
3. Server has write permissions

**Increase size limit** in `next.config.js`:
```javascript
api: {
  bodyParser: {
    sizeLimit: '50mb',
  },
}
```
</details>

<details>
<summary><b>Vercel deployment timeout</b></summary>

**Solution**:
- Ensure build completes in <10 minutes
- Check for infinite loops in components
- Verify all dependencies install correctly
- Use `npm run build` locally first to catch errors
</details>

### FAQ

**Q: Can I use ResearchOS offline?**
A: Currently, ResearchOS requires an internet connection for full functionality. Offline support is planned for future releases.

**Q: How much data can I store?**
A: Storage limits depend on your database provider. Neon free tier offers 0.5GB, paid plans scale up.

**Q: Can I export my entire project?**
A: Yes! Use the batch export feature to download all datasets and visualizations.

**Q: Is my data secure?**
A: Yes. Data is encrypted in transit (HTTPS) and at rest. We follow security best practices.

**Q: Can I self-host ResearchOS?**
A: Absolutely! Follow the deployment guide for your preferred platform.

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
4. **Run tests**
   ```bash
   npm run test
   npm run lint
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Create a Pull Request**

### Code Style

- Use TypeScript for all new code
- Follow the existing component structure
- Add comments for complex logic
- Write meaningful commit messages
- Keep components small and focused

### Reporting Bugs

Open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Your environment (OS, browser, Node version)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Plotly.js](https://plotly.com/javascript/)
- Icons from [Lucide](https://lucide.dev/)

---

## 📞 Support

- **Documentation**: You're reading it!
- **Issues**: [GitHub Issues](https://github.com/yourusername/ResearchOS/issues)
- **Email**: support@researchos.com

---

## 🗺 Roadmap

### Coming Soon
- [ ] AI-powered data analysis
- [ ] Mobile app (iOS/Android)
- [ ] Real-time collaboration
- [ ] Advanced statistics
- [ ] Template library
- [ ] API access
- [ ] Offline mode
- [ ] Custom themes

### In Progress
- [x] Dashboard analytics
- [x] Collaboration features
- [x] Data export tools
- [x] Performance monitoring

---

**Made with ❤️ for electrochemistry researchers worldwide**

---

*Last updated: November 2024*
