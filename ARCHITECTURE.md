# ElctrDc - Electrochemistry Research OS
## Complete Architecture & Technical Specification

**Version:** 1.0
**Last Updated:** 2025-11-16
**Project Vision:** An all-in-one desktop application for electrochemistry research that consolidates project management, data analysis, visualization, and AI-powered insights into a single unified environment.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [Application Structure](#application-structure)
6. [Core Features & Implementation](#core-features--implementation)
7. [Data Parsers Architecture](#data-parsers-architecture)
8. [AI Integration Architecture](#ai-integration-architecture)
9. [File System & Storage](#file-system--storage)
10. [API Design](#api-design)
11. [Security & Privacy](#security--privacy)
12. [Deployment Strategy](#deployment-strategy)
13. [Development Phases](#development-phases)
14. [Testing Strategy](#testing-strategy)
15. [Performance Considerations](#performance-considerations)

---

## Executive Summary

### What We're Building

ElctrDc is a specialized research environment for electrochemistry that eliminates the fragmentation of modern research workflows. Unlike generic tools, ElctrDc provides domain-specific features including:

- Native support for all major electrochemistry techniques (CV, EIS, chronoamperometry, etc.)
- Intelligent parsers for industry-standard instrument formats
- Publication-ready scientific plotting
- Context-aware AI trained on electrochemical concepts
- Notion-like project organization with deep scientific context

### Target Users

- Electrochemistry PhD students
- Battery researchers
- Fuel cell researchers
- Corrosion scientists
- Electrochemical sensor developers
- Catalysis researchers

### Key Differentiators

1. **Domain-Specific Intelligence**: Not a generic research tool - built specifically for electrochemistry
2. **Deep Integration**: Data, literature, notes, and AI are contextually connected
3. **Privacy-First**: Self-hosted AI using Ollama - no data leaves your machine
4. **Comprehensive Workflows**: Support for every major electrochemistry technique

---

## System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  (Next.js 14 + React + TypeScript + Tailwind + shadcn/ui)      │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Project    │  │   Analysis   │  │   AI Chat    │         │
│  │  Management  │  │   Canvas     │  │   Interface  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                        │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Projects │  │   Data   │  │    AI    │  │   File   │      │
│  │   API    │  │ Parsing  │  │   API    │  │  Upload  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
         ┌────────────┐ ┌──────────┐ ┌──────────────┐
         │ PostgreSQL │ │  Ollama  │ │ File Storage │
         │  Database  │ │    AI    │ │  (S3/Blob)   │
         └────────────┘ └──────────┘ └──────────────┘
```

### Architecture Principles

1. **Separation of Concerns**: Clear boundaries between UI, business logic, and data
2. **Modularity**: Each electrochemistry technique is a self-contained module
3. **Scalability**: Database design supports millions of data points per project
4. **Privacy**: All AI computation happens locally or on user-controlled servers
5. **Offline-First**: Core features work without internet connectivity

---

## Technology Stack

### Frontend

```json
{
  "framework": "Next.js 14.2+ (App Router)",
  "language": "TypeScript 5.4+",
  "ui_library": "React 18+",
  "styling": "Tailwind CSS 3.4+",
  "components": "shadcn/ui (Radix UI primitives)",
  "state_management": "Zustand 4.5+",
  "plotting": "Plotly.js 2.30+",
  "forms": "React Hook Form 7.51+",
  "validation": "Zod 3.22+"
}
```

### Backend

```json
{
  "api": "Next.js API Routes (Node.js runtime)",
  "database": "PostgreSQL 16+",
  "orm": "Prisma 5.12+",
  "file_storage": "AWS S3 / Vercel Blob",
  "ai_runtime": "Ollama (local)",
  "ai_models": ["llama3.1:8b", "mistral:7b", "codellama:13b"]
}
```

### Data Processing

```json
{
  "scientific_computing": "math.js",
  "csv_parsing": "papaparse",
  "binary_parsing": "custom parsers",
  "statistical_analysis": "simple-statistics",
  "curve_fitting": "regression-js"
}
```

### Development Tools

```json
{
  "package_manager": "pnpm",
  "linting": "ESLint + Prettier",
  "testing": "Jest + React Testing Library + Playwright",
  "version_control": "Git",
  "deployment": "Vercel / Docker"
}
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1
       │
       │ n
┌──────┴──────┐
│   Project   │
└──────┬──────┘
       │ 1
       ├────────────┬────────────┬────────────┐
       │ n          │ n          │ n          │ n
┌──────┴──────┐ ┌──┴────┐ ┌─────┴─────┐ ┌───┴──────┐
│    Page     │ │Dataset│ │   Paper   │ │Workflow  │
└──────┬──────┘ └───┬───┘ └───────────┘ └──────────┘
       │ 1          │ 1
       │ n          │ n
┌──────┴──────┐ ┌──┴────────┐
│    Block    │ │Visualization│
└─────────────┘ └────────────┘
```

### Schema Details

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, archived, deleted
  research_type VARCHAR(100), -- battery, fuel_cell, corrosion, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_accessed TIMESTAMP DEFAULT NOW(),
  settings JSONB DEFAULT '{}'
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
```

#### Pages Table (Notion-like structure)
```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  icon TEXT, -- emoji or icon identifier
  cover_image TEXT,
  position INTEGER NOT NULL, -- for ordering
  properties JSONB DEFAULT '{}', -- custom properties
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pages_project_id ON pages(project_id);
CREATE INDEX idx_pages_parent_id ON pages(parent_page_id);
```

#### Blocks Table (Content blocks within pages)
```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  parent_block_id UUID REFERENCES blocks(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- text, heading, code, table, etc.
  position INTEGER NOT NULL,
  content JSONB NOT NULL, -- flexible content structure
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blocks_page_id ON blocks(page_id);
CREATE INDEX idx_blocks_type ON blocks(type);
```

#### Datasets Table
```sql
CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  technique VARCHAR(100) NOT NULL, -- CV, EIS, CA, CP, etc.
  instrument VARCHAR(100), -- BioLogic, Gamry, Metrohm, etc.
  file_format VARCHAR(50), -- mpt, dta, csv, etc.
  original_filename VARCHAR(500),
  file_url TEXT NOT NULL, -- S3/Blob storage URL
  parsed_data JSONB, -- structured parsed data
  metadata JSONB, -- instrument settings, timestamps, etc.
  row_count INTEGER,
  column_count INTEGER,
  file_size BIGINT,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_datasets_project_id ON datasets(project_id);
CREATE INDEX idx_datasets_technique ON datasets(technique);
```

#### Visualizations Table
```sql
CREATE TABLE visualizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  name VARCHAR(500) NOT NULL,
  plot_type VARCHAR(100) NOT NULL, -- cv_plot, nyquist, bode, etc.
  config JSONB NOT NULL, -- Plotly.js configuration
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visualizations_dataset_id ON visualizations(dataset_id);
CREATE INDEX idx_visualizations_page_id ON visualizations(page_id);
```

#### Papers Table (Literature management)
```sql
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(1000) NOT NULL,
  authors TEXT[],
  journal VARCHAR(500),
  year INTEGER,
  doi VARCHAR(255),
  abstract TEXT,
  file_url TEXT, -- PDF storage URL
  extracted_text TEXT, -- Full text extraction
  metadata JSONB,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_papers_project_id ON papers(project_id);
CREATE INDEX idx_papers_doi ON papers(doi);
```

#### Workflows Table (Technique-specific workflows)
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  workflow_type VARCHAR(100) NOT NULL, -- battery_cycling, cv_analysis, etc.
  steps JSONB NOT NULL, -- ordered list of analysis steps
  status VARCHAR(50) DEFAULT 'draft', -- draft, active, completed
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflows_project_id ON workflows(project_id);
CREATE INDEX idx_workflows_type ON workflows(workflow_type);
```

#### AI Conversations Table
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  visualization_id UUID REFERENCES visualizations(id) ON DELETE SET NULL,
  context_type VARCHAR(50) NOT NULL, -- page, visualization, general
  messages JSONB NOT NULL, -- array of messages
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_project_id ON ai_conversations(project_id);
```

---

## Application Structure

### File/Folder Organization

```
elctrdc/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Main app routes
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── page.tsx              # Home dashboard
│   │   ├── projects/
│   │   │   ├── [projectId]/      # Dynamic project routes
│   │   │   │   ├── page.tsx      # Project overview
│   │   │   │   ├── pages/        # Project pages (Notion-like)
│   │   │   │   │   └── [pageId]/
│   │   │   │   ├── analyze/      # Analysis tab
│   │   │   │   └── settings/
│   │   │   └── new/
│   │   └── analyze/              # Global analysis workspace
│   ├── api/                      # API routes
│   │   ├── projects/
│   │   │   ├── route.ts          # GET, POST projects
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET, PATCH, DELETE project
│   │   │       ├── pages/
│   │   │       ├── datasets/
│   │   │       └── papers/
│   │   ├── datasets/
│   │   │   ├── upload/
│   │   │   ├── parse/
│   │   │   └── [id]/
│   │   ├── visualizations/
│   │   ├── ai/
│   │   │   ├── chat/
│   │   │   ├── analyze-plot/
│   │   │   └── suggest/
│   │   └── papers/
│   ├── globals.css
│   └── layout.tsx
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── editor/                   # Block-based editor
│   │   ├── BlockEditor.tsx
│   │   ├── blocks/
│   │   │   ├── TextBlock.tsx
│   │   │   ├── HeadingBlock.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── TableBlock.tsx
│   │   │   ├── DatasetBlock.tsx
│   │   │   └── PaperBlock.tsx
│   │   └── CommandMenu.tsx       # Ctrl+K menu
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── ProjectTree.tsx
│   │   └── QuickAccess.tsx
│   ├── analysis/                 # Data analysis components
│   │   ├── DataUploader.tsx
│   │   ├── DataPreview.tsx
│   │   ├── VisualizationBlock.tsx
│   │   ├── PlotControls.tsx
│   │   └── techniques/           # Technique-specific components
│   │       ├── CVAnalyzer.tsx
│   │       ├── EISAnalyzer.tsx
│   │       ├── BatteryCycling.tsx
│   │       └── ...
│   ├── ai/
│   │   ├── AIAssistant.tsx       # Floating AI chat
│   │   ├── ContextAwareChat.tsx
│   │   └── SuggestionsPanel.tsx
│   └── shared/
│       ├── Breadcrumbs.tsx
│       ├── PageHeader.tsx
│       └── LoadingStates.tsx
│
├── lib/                          # Utility libraries
│   ├── prisma.ts                 # Prisma client
│   ├── auth.ts                   # Authentication logic
│   ├── parsers/                  # Data parsers
│   │   ├── base-parser.ts
│   │   ├── biologic/
│   │   │   ├── mpt-parser.ts
│   │   │   └── mpr-parser.ts
│   │   ├── gamry/
│   │   │   └── dta-parser.ts
│   │   ├── metrohm/
│   │   ├── neware/
│   │   ├── arbin/
│   │   └── csv-parser.ts
│   ├── analysis/                 # Analysis engines
│   │   ├── cv-analysis.ts
│   │   ├── eis-analysis.ts
│   │   ├── battery-analysis.ts
│   │   └── statistics.ts
│   ├── ai/
│   │   ├── ollama-client.ts
│   │   ├── prompts.ts
│   │   └── context-builder.ts
│   ├── plotting/
│   │   ├── plot-configs.ts       # Plotly config templates
│   │   ├── cv-plots.ts
│   │   ├── eis-plots.ts
│   │   └── battery-plots.ts
│   └── utils/
│       ├── file-upload.ts
│       ├── pdf-parser.ts
│       └── validators.ts
│
├── stores/                       # Zustand state stores
│   ├── project-store.ts
│   ├── editor-store.ts
│   ├── analysis-store.ts
│   └── ai-store.ts
│
├── types/                        # TypeScript types
│   ├── database.types.ts         # Prisma generated types
│   ├── electrochemistry.types.ts
│   ├── plotting.types.ts
│   └── ai.types.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│   ├── templates/                # Project templates
│   └── icons/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md (this file)
│   ├── API.md
│   ├── PARSERS.md
│   └── WORKFLOWS.md
│
├── .env.example
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## Core Features & Implementation

### Feature 1: Command Bar (Ctrl/Cmd + K)

**Purpose**: Fast navigation and action execution

**Implementation**:
```typescript
// components/editor/CommandMenu.tsx
import { Command } from 'cmdk'

const CommandMenu = () => {
  // Groups:
  // 1. Navigation (Projects, Pages)
  // 2. Creation (New Project, New Page, New Dataset)
  // 3. Actions (Plot Data, Analyze CV, Ask AI)
  // 4. Recent (Recently accessed items)
}
```

**Key Commands**:
- "New Project" → Opens project creation modal
- "Analyze CV" → Opens CV analysis workflow
- "Plot [dataset name]" → Creates visualization
- "Ask AI about..." → Opens AI chat with context

---

### Feature 2: Notion-like Block Editor

**Block Types**:

1. **Text Blocks**
   - Paragraph
   - Heading (H1, H2, H3)
   - Bulleted List
   - Numbered List
   - To-do List
   - Toggle List
   - Quote
   - Callout
   - Code

2. **Media Blocks**
   - Image
   - File
   - PDF (Paper)

3. **Data Blocks** (Unique to ElctrDc)
   - Dataset Preview
   - Visualization Embed
   - Equation (LaTeX)
   - Table

**Implementation**:
```typescript
// components/editor/BlockEditor.tsx

interface Block {
  id: string
  type: BlockType
  content: BlockContent
  position: number
  parentId?: string
}

// Each block renders based on type
// Supports drag-to-reorder
// "/" command for block creation
// Nested blocks for toggle lists
```

---

### Feature 3: Project Management & Workflows

**Workflow Templates**:

1. **Battery Cycling Analysis**
   - Steps:
     1. Upload cycling data (Neware, BioLogic, Arbin)
     2. Extract capacity vs. cycle number
     3. Generate charge/discharge curves
     4. Calculate coulombic efficiency
     5. Identify degradation patterns
     6. AI suggests failure modes

2. **Cyclic Voltammetry (CV) Analysis**
   - Steps:
     1. Upload CV data
     2. Detect peaks (anodic/cathodic)
     3. Calculate peak separation (ΔEp)
     4. Determine reversibility
     5. Plot Randles-Sevcik analysis
     6. AI compares to literature

3. **Electrochemical Impedance Spectroscopy (EIS)**
   - Steps:
     1. Upload EIS data
     2. Generate Nyquist plot
     3. Generate Bode plot
     4. Fit equivalent circuit (Randles, custom)
     5. Extract parameters (Rct, Cdl, etc.)
     6. AI suggests physical interpretation

4. **Corrosion Testing (Tafel Analysis)**
   - Steps:
     1. Upload polarization data
     2. Generate Tafel plot
     3. Extract Ecorr, icorr
     4. Calculate corrosion rate
     5. AI compares to standards

5. **Fuel Cell Performance**
   - Steps:
     1. Upload polarization curve
     2. Plot voltage vs. current density
     3. Extract power density
     4. Calculate efficiency
     5. Identify limiting factors

**Implementation**:
```typescript
// lib/workflows/battery-cycling.ts

export class BatteryCyclingWorkflow {
  async execute(dataset: Dataset) {
    // 1. Parse data
    const parsed = await parseBatteryData(dataset)

    // 2. Extract metrics
    const metrics = calculateBatteryMetrics(parsed)

    // 3. Generate visualizations
    const plots = [
      createCapacityPlot(metrics),
      createEfficiencyPlot(metrics),
      createVoltagePlot(parsed)
    ]

    // 4. AI analysis
    const insights = await analyzeWithAI(metrics, plots)

    return { metrics, plots, insights }
  }
}
```

---

### Feature 4: Data Analysis & Visualization

**Plotting Library**: Plotly.js

**Why Plotly?**
- Interactive (zoom, pan, hover tooltips)
- Publication-quality exports (SVG, PNG)
- Scientific plot types (3D, contour, heatmaps)
- Customizable styling

**Plot Templates for Each Technique**:

```typescript
// lib/plotting/cv-plots.ts

export const cvPlotConfig = (data: CVData) => ({
  data: [{
    x: data.potential,
    y: data.current,
    type: 'scatter',
    mode: 'lines',
    name: 'CV Curve',
    line: { color: '#2563eb', width: 2 }
  }],
  layout: {
    title: 'Cyclic Voltammogram',
    xaxis: {
      title: 'E vs. Reference (V)',
      zeroline: true
    },
    yaxis: {
      title: 'Current (μA)',
      zeroline: true
    },
    hovermode: 'closest'
  }
})

// lib/plotting/eis-plots.ts

export const nyquistPlotConfig = (data: EISData) => ({
  data: [{
    x: data.zReal,
    y: data.zImag.map(v => -v), // Convention: -Z'' on y-axis
    type: 'scatter',
    mode: 'markers+lines',
    name: 'Nyquist',
    marker: { size: 6 }
  }],
  layout: {
    title: 'Nyquist Plot',
    xaxis: { title: "Z' (Ω)" },
    yaxis: {
      title: "-Z'' (Ω)",
      scaleanchor: 'x', // Equal aspect ratio
      scaleratio: 1
    }
  }
})
```

**Interactive Plot Controls** (Canva-style):

```typescript
// components/analysis/PlotControls.tsx

interface PlotControls {
  // Data Selection
  xAxis: string         // Column selector
  yAxis: string         // Column selector

  // Plot Type
  plotType: 'line' | 'scatter' | 'bar' | 'heatmap' | '3d'

  // Styling
  lineColor: string
  lineWidth: number
  markerSize: number
  markerShape: string

  // Axes
  xLabel: string
  yLabel: string
  xScale: 'linear' | 'log'
  yScale: 'linear' | 'log'
  xRange: [number, number]
  yRange: [number, number]

  // Appearance
  title: string
  showGrid: boolean
  showLegend: boolean
  backgroundColor: string
}
```

---

### Feature 5: Context-Aware AI Assistant

**AI Models** (via Ollama):

1. **Primary Model**: `llama3.1:8b`
   - General research assistant
   - Literature analysis
   - Page summarization

2. **Code/Data Model**: `codellama:13b`
   - Data analysis
   - Plot generation
   - Statistical calculations

3. **Fast Model**: `mistral:7b`
   - Quick queries
   - Auto-suggestions

**Context Injection Strategy**:

```typescript
// lib/ai/context-builder.ts

export async function buildProjectContext(
  projectId: string,
  contextType: 'page' | 'visualization' | 'general'
) {
  const context = {
    project: await getProject(projectId),
    pages: await getProjectPages(projectId),
    papers: await getProjectPapers(projectId),
    datasets: await getProjectDatasets(projectId)
  }

  // Build system prompt
  const systemPrompt = `
You are an expert electrochemistry research assistant working on the project "${context.project.title}".

RESEARCH CONTEXT:
- Research Type: ${context.project.research_type}
- Number of Pages: ${context.pages.length}
- Uploaded Papers: ${context.papers.length}
- Datasets: ${context.datasets.length}

PROJECT NOTES:
${context.pages.map(p => `Page: ${p.title}\n${p.content}`).join('\n\n')}

UPLOADED LITERATURE:
${context.papers.map(p => `${p.title} (${p.year})\nAbstract: ${p.abstract}`).join('\n\n')}

Your responses should:
1. Reference specific data and notes from this project
2. Connect findings to uploaded literature
3. Suggest next experimental steps
4. Maintain scientific rigor
`

  return systemPrompt
}
```

**AI Features**:

1. **Page-Level AI**:
   - "Summarize this page"
   - "Find contradictions in my notes"
   - "Generate methodology section"
   - "Extract key findings from papers"

2. **Visualization AI**:
   - "Explain this plot"
   - "What statistical tests should I run?"
   - "Suggest different plot type"
   - "Compare to literature values"

3. **Literature AI**:
   - "Find similar work in uploaded papers"
   - "What methodology did [Paper X] use?"
   - "Compare my results to [Paper Y]"

**Implementation**:

```typescript
// lib/ai/ollama-client.ts

import { Ollama } from 'ollama'

export class AIClient {
  private ollama: Ollama

  constructor() {
    this.ollama = new Ollama({ host: 'http://localhost:11434' })
  }

  async chat(
    messages: Message[],
    systemPrompt: string,
    model: string = 'llama3.1:8b'
  ) {
    const response = await this.ollama.chat({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      stream: true
    })

    return response
  }

  async analyzeVisualization(
    plotConfig: PlotlyConfig,
    dataset: Dataset,
    question: string
  ) {
    const dataContext = `
Dataset: ${dataset.name}
Technique: ${dataset.technique}
Rows: ${dataset.row_count}
Columns: ${Object.keys(dataset.parsed_data).join(', ')}

Plot Type: ${plotConfig.type}
X-axis: ${plotConfig.layout.xaxis.title}
Y-axis: ${plotConfig.layout.yaxis.title}

Data Sample:
${JSON.stringify(dataset.parsed_data.slice(0, 10), null, 2)}
`

    return this.chat(
      [{ role: 'user', content: question }],
      `You are analyzing electrochemical data. ${dataContext}`,
      'codellama:13b'
    )
  }
}
```

---

## Data Parsers Architecture

### Parser Interface

```typescript
// lib/parsers/base-parser.ts

export interface ParsedData {
  technique: string
  instrument: string
  metadata: {
    date?: Date
    settings?: Record<string, any>
    sampleInfo?: Record<string, any>
  }
  data: {
    columns: string[]
    rows: number[][]
  }
  units: Record<string, string>
}

export abstract class BaseParser {
  abstract canParse(file: File): boolean
  abstract parse(file: File): Promise<ParsedData>

  protected detectTechnique(headers: string[]): string {
    // Auto-detect technique from headers/content
  }
}
```

### Instrument-Specific Parsers

#### 1. BioLogic (.mpt, .mpr)

```typescript
// lib/parsers/biologic/mpt-parser.ts

export class BioLogicMPTParser extends BaseParser {
  canParse(file: File): boolean {
    return file.name.endsWith('.mpt')
  }

  async parse(file: File): Promise<ParsedData> {
    const text = await file.text()

    // MPT files have distinct sections:
    // 1. Header section (metadata)
    // 2. Settings section (technique parameters)
    // 3. Data section (tab-delimited)

    const sections = this.splitSections(text)
    const metadata = this.parseMetadata(sections.header)
    const settings = this.parseSettings(sections.settings)
    const data = this.parseData(sections.data)

    return {
      technique: this.detectTechnique(data.columns),
      instrument: 'BioLogic',
      metadata: { ...metadata, settings },
      data,
      units: this.extractUnits(data.columns)
    }
  }

  private splitSections(text: string) {
    // MPT format parsing logic
  }

  private parseMetadata(header: string) {
    // Extract date, sample info, etc.
  }

  private parseSettings(settings: string) {
    // Extract technique parameters
  }

  private parseData(dataSection: string) {
    // Parse tab-delimited data
  }

  private extractUnits(columns: string[]) {
    // Extract units from column headers
    // Example: "Ewe/V" → { "Ewe": "V" }
  }
}
```

#### 2. Gamry (.dta)

```typescript
// lib/parsers/gamry/dta-parser.ts

export class GamryDTAParser extends BaseParser {
  canParse(file: File): boolean {
    return file.name.endsWith('.dta')
  }

  async parse(file: File): Promise<ParsedData> {
    // Gamry DTA files are tab-delimited with extensive headers
    const text = await file.text()
    const lines = text.split('\n')

    // Find where data starts (after "CURVE" or "ZCURVE" tags)
    const dataStartIndex = lines.findIndex(l =>
      l.includes('CURVE') || l.includes('ZCURVE')
    )

    const metadata = this.parseGamryHeader(lines.slice(0, dataStartIndex))
    const data = this.parseGamryData(lines.slice(dataStartIndex + 1))

    return {
      technique: metadata.technique || this.detectTechnique(data.columns),
      instrument: 'Gamry',
      metadata,
      data,
      units: this.extractUnits(data.columns)
    }
  }
}
```

#### 3. Neware (Battery Cyclers)

```typescript
// lib/parsers/neware/neware-parser.ts

export class NewareParser extends BaseParser {
  // Neware exports are typically CSV or Excel
  // Columns: Cycle, Step, Time(s), Voltage(V), Current(A), Capacity(Ah), etc.

  async parse(file: File): Promise<ParsedData> {
    const text = await file.text()

    // Neware CSVs have metadata in first few rows
    const lines = text.split('\n')
    const metadataEnd = lines.findIndex(l => l.includes('Record'))

    const metadata = this.parseNewareMetadata(lines.slice(0, metadataEnd))
    const data = Papa.parse(lines.slice(metadataEnd).join('\n'), {
      header: true,
      dynamicTyping: true
    })

    return {
      technique: 'Battery Cycling',
      instrument: 'Neware',
      metadata,
      data: {
        columns: data.meta.fields,
        rows: data.data.map(row => Object.values(row))
      },
      units: this.extractUnitsFromHeaders(data.meta.fields)
    }
  }
}
```

#### 4. Metrohm Autolab

```typescript
// lib/parsers/metrohm/autolab-parser.ts

export class AutolabParser extends BaseParser {
  // Autolab files (.txt, .nox) have specific format
}
```

#### 5. Arbin (Battery Testing)

```typescript
// lib/parsers/arbin/arbin-parser.ts

export class ArbinParser extends BaseParser {
  // Arbin exports Excel or CSV with specific column structure
}
```

#### 6. Generic CSV Parser

```typescript
// lib/parsers/csv-parser.ts

export class GenericCSVParser extends BaseParser {
  canParse(file: File): boolean {
    return file.name.endsWith('.csv') || file.name.endsWith('.txt')
  }

  async parse(file: File): Promise<ParsedData> {
    const text = await file.text()

    const parsed = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    })

    return {
      technique: 'Unknown',
      instrument: 'Generic',
      metadata: {},
      data: {
        columns: parsed.meta.fields,
        rows: parsed.data.map(row => Object.values(row))
      },
      units: {}
    }
  }
}
```

### Parser Registry

```typescript
// lib/parsers/parser-registry.ts

export class ParserRegistry {
  private parsers: BaseParser[] = [
    new BioLogicMPTParser(),
    new BioLogicMPRParser(),
    new GamryDTAParser(),
    new NewareParser(),
    new ArbinParser(),
    new AutolabParser(),
    new GenericCSVParser() // Fallback
  ]

  async parseFile(file: File): Promise<ParsedData> {
    for (const parser of this.parsers) {
      if (parser.canParse(file)) {
        return await parser.parse(file)
      }
    }

    throw new Error('No parser found for this file type')
  }
}
```

---

## AI Integration Architecture

### Ollama Setup & Configuration

**Installation**:
```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve

# Pull models
ollama pull llama3.1:8b
ollama pull mistral:7b
ollama pull codellama:13b
```

**Environment Variables**:
```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.1:8b
OLLAMA_CODE_MODEL=codellama:13b
OLLAMA_FAST_MODEL=mistral:7b
```

### API Integration

```typescript
// app/api/ai/chat/route.ts

import { NextRequest } from 'next/server'
import { AIClient } from '@/lib/ai/ollama-client'
import { buildProjectContext } from '@/lib/ai/context-builder'

export async function POST(req: NextRequest) {
  const { projectId, messages, contextType } = await req.json()

  // Build context-aware system prompt
  const systemPrompt = await buildProjectContext(projectId, contextType)

  // Stream AI response
  const ai = new AIClient()
  const stream = await ai.chat(messages, systemPrompt)

  // Return streaming response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  })
}
```

### Specialized AI Prompts

```typescript
// lib/ai/prompts.ts

export const PROMPTS = {
  analyzePlot: (technique: string) => `
Analyze this ${technique} plot and provide:
1. Key observations from the data
2. Statistical summary
3. Physical interpretation
4. Comparison to typical behavior
5. Suggestions for further analysis
`,

  suggestNextSteps: (projectType: string) => `
Based on the current experimental results in this ${projectType} project, suggest:
1. Next experiments to run
2. Parameters to vary
3. Additional characterization techniques
4. Potential issues to investigate
`,

  compareLiterature: (papers: Paper[]) => `
Compare the current results to the following papers:
${papers.map(p => `- ${p.title} (${p.year}): ${p.abstract}`).join('\n')}

Provide:
1. Similarities in findings
2. Differences and possible explanations
3. Relevant methodologies from literature
4. Gaps in current understanding
`,

  interpretEIS: () => `
You are an expert in electrochemical impedance spectroscopy. Analyze the EIS data and:
1. Identify characteristic features (semicircles, Warburg, etc.)
2. Suggest appropriate equivalent circuit
3. Estimate physical parameters
4. Interpret in terms of electrochemical processes
`,

  analyzeCV: () => `
You are an expert in cyclic voltammetry. Analyze the CV and:
1. Identify redox peaks
2. Calculate peak separation and reversibility
3. Determine diffusion coefficient (if applicable)
4. Assess electrochemical reversibility
5. Suggest mechanism
`
}
```

---

## File System & Storage

### Storage Architecture

```typescript
// Cloud Storage (AWS S3 / Vercel Blob)
/storage/
  /users/
    /{userId}/
      /projects/
        /{projectId}/
          /datasets/
            /{datasetId}/
              - original.mpt
              - parsed.json
          /papers/
            /{paperId}/
              - paper.pdf
              - extracted.txt
          /visualizations/
            /{vizId}/
              - thumbnail.png
              - config.json
          /exports/
            - project-export.zip
```

### File Upload Flow

```typescript
// app/api/datasets/upload/route.ts

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const projectId = formData.get('projectId') as string

  // 1. Validate file
  const validation = validateFile(file)
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 })
  }

  // 2. Upload to S3/Blob
  const fileUrl = await uploadToStorage(file, {
    path: `users/${userId}/projects/${projectId}/datasets`
  })

  // 3. Parse file
  const parser = new ParserRegistry()
  const parsedData = await parser.parseFile(file)

  // 4. Save to database
  const dataset = await prisma.dataset.create({
    data: {
      projectId,
      name: file.name,
      technique: parsedData.technique,
      instrument: parsedData.instrument,
      file_format: getFileExtension(file.name),
      original_filename: file.name,
      file_url: fileUrl,
      parsed_data: parsedData.data,
      metadata: parsedData.metadata,
      row_count: parsedData.data.rows.length,
      column_count: parsedData.data.columns.length,
      file_size: file.size
    }
  })

  return Response.json({ dataset })
}
```

---

## API Design

### REST API Endpoints

#### Projects

```
GET    /api/projects                    # List user's projects
POST   /api/projects                    # Create new project
GET    /api/projects/:id                # Get project details
PATCH  /api/projects/:id                # Update project
DELETE /api/projects/:id                # Delete project
GET    /api/projects/:id/export         # Export project
```

#### Pages

```
GET    /api/projects/:projectId/pages           # List pages
POST   /api/projects/:projectId/pages           # Create page
GET    /api/projects/:projectId/pages/:id       # Get page
PATCH  /api/projects/:projectId/pages/:id       # Update page
DELETE /api/projects/:projectId/pages/:id       # Delete page
POST   /api/projects/:projectId/pages/:id/duplicate
```

#### Blocks

```
GET    /api/pages/:pageId/blocks        # Get page blocks
POST   /api/pages/:pageId/blocks        # Create block
PATCH  /api/blocks/:id                  # Update block
DELETE /api/blocks/:id                  # Delete block
POST   /api/blocks/:id/move             # Reorder blocks
```

#### Datasets

```
POST   /api/datasets/upload             # Upload & parse dataset
GET    /api/datasets/:id                # Get dataset
DELETE /api/datasets/:id                # Delete dataset
GET    /api/datasets/:id/preview        # Get data preview
POST   /api/datasets/:id/analyze        # Run analysis
```

#### Visualizations

```
POST   /api/visualizations              # Create visualization
GET    /api/visualizations/:id          # Get visualization
PATCH  /api/visualizations/:id          # Update config
DELETE /api/visualizations/:id          # Delete
GET    /api/visualizations/:id/export   # Export as PNG/SVG
```

#### AI

```
POST   /api/ai/chat                     # General chat
POST   /api/ai/analyze-plot             # Analyze visualization
POST   /api/ai/suggest-next             # Suggest next steps
POST   /api/ai/compare-literature       # Compare to papers
GET    /api/ai/conversations/:id        # Get conversation history
```

#### Papers

```
POST   /api/papers/upload               # Upload PDF
GET    /api/papers/:id                  # Get paper details
DELETE /api/papers/:id                  # Delete paper
GET    /api/papers/:id/extract          # Get extracted text
POST   /api/papers/:id/analyze          # AI analysis
```

---

## Security & Privacy

### Authentication

```typescript
// lib/auth.ts

import { hash, compare } from 'bcrypt'
import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function hashPassword(password: string) {
  return await hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return await compare(password, hash)
}

export async function createToken(userId: string) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET)
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET)
  return payload.userId as string
}
```

### Authorization Middleware

```typescript
// middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.redirect('/login')
  }

  try {
    const userId = await verifyToken(token)

    // Add userId to request headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', userId)

    return NextResponse.next({
      request: { headers: requestHeaders }
    })
  } catch {
    return NextResponse.redirect('/login')
  }
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*']
}
```

### Data Privacy

1. **Local AI Processing**: All AI computation via Ollama runs locally
2. **Encrypted Storage**: Files encrypted at rest in S3
3. **HTTPS Only**: All communication over TLS
4. **Row-Level Security**: Database queries filtered by userId
5. **API Rate Limiting**: Prevent abuse

---

## Deployment Strategy

### Development Environment

```bash
# Install dependencies
pnpm install

# Setup database
pnpm prisma migrate dev
pnpm prisma generate

# Start Ollama
ollama serve
ollama pull llama3.1:8b

# Run dev server
pnpm dev
```

### Production Deployment Options

#### Option 1: Vercel + Neon (PostgreSQL) + S3

```yaml
Platform: Vercel
Database: Neon (Serverless PostgreSQL)
Storage: AWS S3
AI: User runs Ollama locally on their machine
```

**Pros**: Easy deployment, scalable
**Cons**: AI requires local Ollama installation

#### Option 2: Docker + VPS

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN pnpm install --frozen-lockfile

# Copy app
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

CMD ["pnpm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/elctrdc
      OLLAMA_HOST: http://ollama:11434
    depends_on:
      - db
      - ollama

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: elctrdc
    volumes:
      - postgres_data:/var/lib/postgresql/data

  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama

volumes:
  postgres_data:
  ollama_data:
```

**Pros**: Complete control, AI included
**Cons**: Requires server management

#### Option 3: Electron Desktop App

```typescript
// For truly local-first experience
// Package as desktop app with embedded database
```

---

## Development Phases

### Phase 1: Foundation (Weeks 1-4)

**Goals**: Basic infrastructure

- [ ] Project setup (Next.js, TypeScript, Tailwind)
- [ ] Database schema & Prisma setup
- [ ] Authentication system
- [ ] Basic project CRUD
- [ ] Sidebar navigation
- [ ] Command bar (Ctrl+K)

**Deliverable**: Users can create projects and navigate

---

### Phase 2: Block Editor (Weeks 5-8)

**Goals**: Notion-like editing

- [ ] Block-based editor
- [ ] Text blocks (paragraph, heading, list, etc.)
- [ ] Block creation ("/" command)
- [ ] Drag-to-reorder
- [ ] Page hierarchy
- [ ] Breadcrumb navigation

**Deliverable**: Users can create and organize notes

---

### Phase 3: Data Upload & Parsing (Weeks 9-12)

**Goals**: Data ingestion

- [ ] File upload system
- [ ] CSV parser
- [ ] BioLogic (.mpt) parser
- [ ] Gamry (.dta) parser
- [ ] Neware parser
- [ ] Dataset preview table
- [ ] Column type detection

**Deliverable**: Users can upload and view electrochemistry data

---

### Phase 4: Visualization (Weeks 13-16)

**Goals**: Interactive plotting

- [ ] Plotly.js integration
- [ ] Plot controls (Canva-style)
- [ ] CV plot templates
- [ ] EIS plot templates (Nyquist, Bode)
- [ ] Battery cycling plots
- [ ] Plot export (PNG, SVG)
- [ ] Visualization blocks in pages

**Deliverable**: Users can create publication-ready plots

---

### Phase 5: AI Integration (Weeks 17-20)

**Goals**: Intelligent assistance

- [ ] Ollama client setup
- [ ] Context builder
- [ ] Floating AI chat component
- [ ] Page-level AI queries
- [ ] Visualization analysis
- [ ] Prompt templates
- [ ] Streaming responses

**Deliverable**: AI can answer questions about projects and data

---

### Phase 6: Workflows (Weeks 21-24)

**Goals**: Technique-specific analysis

- [ ] Battery cycling workflow
- [ ] CV analysis workflow
- [ ] EIS analysis workflow
- [ ] Workflow templates
- [ ] Auto-calculation of metrics
- [ ] AI-powered insights per workflow

**Deliverable**: Users can run complete analysis workflows

---

### Phase 7: Literature Management (Weeks 25-26)

**Goals**: Paper integration

- [ ] PDF upload
- [ ] Text extraction
- [ ] Metadata extraction (title, authors, DOI)
- [ ] Paper blocks in pages
- [ ] AI literature comparison

**Deliverable**: Users can upload papers and get AI comparisons

---

### Phase 8: Polish & Testing (Weeks 27-30)

**Goals**: Production-ready

- [ ] Performance optimization
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Onboarding flow
- [ ] Documentation
- [ ] E2E tests
- [ ] Beta user testing

**Deliverable**: Production-ready application

---

## Testing Strategy

### Unit Tests

```typescript
// tests/unit/parsers/biologic.test.ts

describe('BioLogicMPTParser', () => {
  it('should parse CV data correctly', async () => {
    const file = new File([mockMPTContent], 'test.mpt')
    const parser = new BioLogicMPTParser()
    const result = await parser.parse(file)

    expect(result.technique).toBe('Cyclic Voltammetry')
    expect(result.data.columns).toContain('Ewe/V')
    expect(result.data.rows.length).toBeGreaterThan(0)
  })
})
```

### Integration Tests

```typescript
// tests/integration/api/datasets.test.ts

describe('Dataset API', () => {
  it('should upload and parse dataset', async () => {
    const formData = new FormData()
    formData.append('file', testFile)
    formData.append('projectId', projectId)

    const res = await fetch('/api/datasets/upload', {
      method: 'POST',
      body: formData
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.dataset.technique).toBeDefined()
  })
})
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/workflows/cv-analysis.spec.ts

test('complete CV analysis workflow', async ({ page }) => {
  // 1. Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')

  // 2. Create project
  await page.click('text=New Project')
  await page.fill('[name="title"]', 'CV Test Project')
  await page.click('button:has-text("Create")')

  // 3. Upload CV data
  await page.click('text=Analyze Data')
  await page.setInputFiles('[type="file"]', 'test-data/cv-sample.mpt')
  await page.waitForSelector('text=Dataset uploaded')

  // 4. Create CV plot
  await page.click('text=Create Visualization')
  await page.selectOption('[name="plotType"]', 'cv_plot')
  await page.click('button:has-text("Generate")')

  // 5. Verify plot appears
  await expect(page.locator('.plotly')).toBeVisible()
})
```

---

## Performance Considerations

### Database Optimization

```sql
-- Indexes for common queries
CREATE INDEX idx_projects_user_updated ON projects(user_id, updated_at DESC);
CREATE INDEX idx_datasets_project_technique ON datasets(project_id, technique);
CREATE INDEX idx_visualizations_dataset ON visualizations(dataset_id);

-- Partial indexes for active projects
CREATE INDEX idx_active_projects ON projects(user_id)
  WHERE status = 'active';
```

### Caching Strategy

```typescript
// lib/cache.ts

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN
})

// Cache parsed datasets
export async function getCachedDataset(datasetId: string) {
  const cached = await redis.get(`dataset:${datasetId}`)
  if (cached) return cached

  const dataset = await prisma.dataset.findUnique({
    where: { id: datasetId }
  })

  await redis.set(`dataset:${datasetId}`, dataset, { ex: 3600 })
  return dataset
}
```

### Large Dataset Handling

```typescript
// For datasets > 100k rows
// Use virtualization for display
// Paginate API responses

export async function getDatasetPreview(
  datasetId: string,
  page: number = 1,
  limit: number = 1000
) {
  const dataset = await prisma.dataset.findUnique({
    where: { id: datasetId }
  })

  const start = (page - 1) * limit
  const end = start + limit

  return {
    ...dataset,
    parsed_data: {
      ...dataset.parsed_data,
      rows: dataset.parsed_data.rows.slice(start, end)
    },
    pagination: {
      page,
      limit,
      total: dataset.row_count,
      totalPages: Math.ceil(dataset.row_count / limit)
    }
  }
}
```

---

## Appendix: Additional Resources

### Electrochemistry Techniques Reference

1. **Cyclic Voltammetry (CV)**
   - Purpose: Redox behavior, reversibility
   - Key parameters: Scan rate, potential window
   - Analysis: Peak current, peak separation, reversibility

2. **Electrochemical Impedance Spectroscopy (EIS)**
   - Purpose: Interfacial properties, kinetics
   - Key parameters: Frequency range, amplitude
   - Analysis: Nyquist/Bode plots, equivalent circuits

3. **Chronoamperometry (CA)**
   - Purpose: Diffusion coefficients
   - Key parameters: Step potential, duration
   - Analysis: Cottrell equation fitting

4. **Chronopotentiometry (CP)**
   - Purpose: Charge storage
   - Key parameters: Current density, cutoff voltage
   - Analysis: Sand equation

5. **Linear Sweep Voltammetry (LSV)**
   - Purpose: Catalytic activity
   - Key parameters: Scan rate, rotation rate
   - Analysis: Tafel slopes, onset potential

6. **Galvanostatic Cycling (Battery Testing)**
   - Purpose: Capacity, cycle life
   - Key parameters: C-rate, voltage limits
   - Analysis: Coulombic efficiency, capacity retention

---

## Conclusion

This architecture provides a comprehensive blueprint for building ElctrDc. The modular design allows for:

- **Incremental development**: Build and test features independently
- **Scalability**: Architecture supports growth from MVP to enterprise
- **Maintainability**: Clear separation of concerns
- **Extensibility**: Easy to add new techniques, parsers, and workflows

**Next Steps**:
1. Review and approve this architecture
2. Set up development environment
3. Begin Phase 1 implementation
4. Recruit beta testers from target user base

---

**Document Version**: 1.0
**Total Estimated Development Time**: 30 weeks (7.5 months)
**Recommended Team Size**: 2-3 developers + 1 domain expert

For questions or clarifications, please open an issue in the repository.
