/**
 * Saved Analysis Workflows
 * Save and reuse analysis pipelines
 */

import { TransformationStep } from '@/lib/transform/pipeline'

export interface AnalysisWorkflow {
  id: string
  name: string
  description?: string
  category: 'data-processing' | 'fitting' | 'visualization' | 'custom'
  steps: WorkflowStep[]
  createdAt: Date
  updatedAt: Date
  useCount: number
  isFavorite: boolean
}

export interface WorkflowStep {
  id: string
  type: 'transform' | 'analysis' | 'visualization' | 'export'
  action: string
  parameters: Record<string, any>
  order: number
}

export class WorkflowManager {
  private static STORAGE_KEY = 'elctrdc_workflows'

  /**
   * Get all workflows
   */
  static getAll(): AnalysisWorkflow[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []

    try {
      const workflows = JSON.parse(stored)
      return workflows.map((w: any) => ({
        ...w,
        createdAt: new Date(w.createdAt),
        updatedAt: new Date(w.updatedAt),
      }))
    } catch (error) {
      console.error('Error parsing workflows:', error)
      return []
    }
  }

  /**
   * Create new workflow
   */
  static create(
    name: string,
    steps: WorkflowStep[],
    category: AnalysisWorkflow['category'] = 'custom',
    description?: string
  ): AnalysisWorkflow {
    const workflow: AnalysisWorkflow = {
      id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      category,
      steps,
      createdAt: new Date(),
      updatedAt: new Date(),
      useCount: 0,
      isFavorite: false,
    }

    const workflows = this.getAll()
    workflows.push(workflow)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workflows))

    return workflow
  }

  /**
   * Update workflow
   */
  static update(id: string, updates: Partial<AnalysisWorkflow>): void {
    const workflows = this.getAll()
    const index = workflows.findIndex((w) => w.id === id)

    if (index !== -1) {
      workflows[index] = {
        ...workflows[index],
        ...updates,
        updatedAt: new Date(),
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workflows))
    }
  }

  /**
   * Delete workflow
   */
  static delete(id: string): void {
    const workflows = this.getAll()
    const filtered = workflows.filter((w) => w.id !== id)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
  }

  /**
   * Get workflow by ID
   */
  static getById(id: string): AnalysisWorkflow | undefined {
    return this.getAll().find((w) => w.id === id)
  }

  /**
   * Increment use count
   */
  static incrementUseCount(id: string): void {
    const workflows = this.getAll()
    const workflow = workflows.find((w) => w.id === id)

    if (workflow) {
      workflow.useCount++
      workflow.updatedAt = new Date()
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workflows))
    }
  }

  /**
   * Toggle favorite
   */
  static toggleFavorite(id: string): void {
    const workflows = this.getAll()
    const workflow = workflows.find((w) => w.id === id)

    if (workflow) {
      workflow.isFavorite = !workflow.isFavorite
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workflows))
    }
  }

  /**
   * Get by category
   */
  static getByCategory(category: AnalysisWorkflow['category']): AnalysisWorkflow[] {
    return this.getAll().filter((w) => w.category === category)
  }

  /**
   * Get favorites
   */
  static getFavorites(): AnalysisWorkflow[] {
    return this.getAll().filter((w) => w.isFavorite)
  }

  /**
   * Get most used
   */
  static getMostUsed(limit: number = 5): AnalysisWorkflow[] {
    return this.getAll()
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, limit)
  }

  /**
   * Export workflow as JSON
   */
  static export(id: string): string {
    const workflow = this.getById(id)
    if (!workflow) throw new Error('Workflow not found')
    return JSON.stringify(workflow, null, 2)
  }

  /**
   * Import workflow from JSON
   */
  static import(json: string): AnalysisWorkflow {
    const workflow = JSON.parse(json)
    workflow.id = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    workflow.createdAt = new Date()
    workflow.updatedAt = new Date()

    const workflows = this.getAll()
    workflows.push(workflow)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workflows))

    return workflow
  }
}

/**
 * Built-in workflow templates
 */
export const WorkflowTemplates: Omit<AnalysisWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>[] = [
  {
    name: 'Standard CV Analysis',
    description: 'Complete cyclic voltammetry analysis pipeline',
    category: 'fitting',
    isFavorite: false,
    steps: [
      {
        id: 'step-1',
        type: 'transform',
        action: 'baseline',
        parameters: { order: 1 },
        order: 1,
      },
      {
        id: 'step-2',
        type: 'transform',
        action: 'smooth',
        parameters: { window: 5 },
        order: 2,
      },
      {
        id: 'step-3',
        type: 'analysis',
        action: 'find_peaks',
        parameters: { minProminence: 0.1 },
        order: 3,
      },
      {
        id: 'step-4',
        type: 'visualization',
        action: 'plot',
        parameters: { type: '2d' },
        order: 4,
      },
    ],
  },
  {
    name: 'EIS Data Processing',
    description: 'Electrochemical impedance spectroscopy workflow',
    category: 'data-processing',
    isFavorite: false,
    steps: [
      {
        id: 'step-1',
        type: 'transform',
        action: 'log',
        parameters: {},
        order: 1,
      },
      {
        id: 'step-2',
        type: 'analysis',
        action: 'fit_circuit',
        parameters: { model: 'randles' },
        order: 2,
      },
      {
        id: 'step-3',
        type: 'visualization',
        action: 'nyquist_plot',
        parameters: {},
        order: 3,
      },
    ],
  },
  {
    name: 'Noise Reduction',
    description: 'Advanced noise filtering and smoothing',
    category: 'data-processing',
    isFavorite: false,
    steps: [
      {
        id: 'step-1',
        type: 'analysis',
        action: 'detect_anomalies',
        parameters: { method: 'zscore', threshold: 3 },
        order: 1,
      },
      {
        id: 'step-2',
        type: 'transform',
        action: 'filter',
        parameters: { type: 'lowpass', cutoff: 0.1 },
        order: 2,
      },
      {
        id: 'step-3',
        type: 'transform',
        action: 'smooth',
        parameters: { window: 10 },
        order: 3,
      },
    ],
  },
]
