/**
 * Data Transformation Pipeline System
 * Build and execute complex data transformations
 */

export type TransformationType =
  | 'normalize'
  | 'standardize'
  | 'smooth'
  | 'derivative'
  | 'integral'
  | 'baseline'
  | 'filter'
  | 'resample'
  | 'interpolate'
  | 'fft'
  | 'abs'
  | 'log'
  | 'exp'
  | 'sqrt'
  | 'custom'

export interface TransformationStep {
  id: string
  type: TransformationType
  name: string
  parameters: Record<string, any>
  enabled: boolean
}

export interface PipelineResult {
  xData: number[]
  yData: number[]
  transformedAt: Date
  appliedSteps: TransformationStep[]
}

export class DataTransformationPipeline {
  private steps: TransformationStep[] = []

  /**
   * Add a transformation step
   */
  addStep(type: TransformationType, parameters: Record<string, any> = {}): string {
    const id = `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const step: TransformationStep = {
      id,
      type,
      name: this.getStepName(type),
      parameters,
      enabled: true,
    }
    this.steps.push(step)
    return id
  }

  /**
   * Remove a step
   */
  removeStep(id: string): void {
    this.steps = this.steps.filter((s) => s.id !== id)
  }

  /**
   * Toggle step enabled/disabled
   */
  toggleStep(id: string): void {
    const step = this.steps.find((s) => s.id === id)
    if (step) {
      step.enabled = !step.enabled
    }
  }

  /**
   * Update step parameters
   */
  updateStep(id: string, parameters: Record<string, any>): void {
    const step = this.steps.find((s) => s.id === id)
    if (step) {
      step.parameters = { ...step.parameters, ...parameters }
    }
  }

  /**
   * Reorder steps
   */
  reorderSteps(fromIndex: number, toIndex: number): void {
    const [removed] = this.steps.splice(fromIndex, 1)
    this.steps.splice(toIndex, 0, removed)
  }

  /**
   * Execute the pipeline
   */
  execute(xData: number[], yData: number[]): PipelineResult {
    let currentX = [...xData]
    let currentY = [...yData]
    const appliedSteps: TransformationStep[] = []

    for (const step of this.steps) {
      if (!step.enabled) continue

      const result = this.applyTransformation(step.type, currentX, currentY, step.parameters)
      currentX = result.x
      currentY = result.y
      appliedSteps.push(step)
    }

    return {
      xData: currentX,
      yData: currentY,
      transformedAt: new Date(),
      appliedSteps,
    }
  }

  /**
   * Apply a single transformation
   */
  private applyTransformation(
    type: TransformationType,
    xData: number[],
    yData: number[],
    parameters: Record<string, any>
  ): { x: number[]; y: number[] } {
    switch (type) {
      case 'normalize':
        return { x: xData, y: this.normalize(yData) }

      case 'standardize':
        return { x: xData, y: this.standardize(yData) }

      case 'smooth':
        return {
          x: xData,
          y: this.movingAverage(yData, parameters.window || 5),
        }

      case 'derivative':
        return this.derivative(xData, yData)

      case 'integral':
        return { x: xData, y: this.integral(xData, yData) }

      case 'baseline':
        return {
          x: xData,
          y: this.baselineCorrection(yData, parameters.order || 1),
        }

      case 'filter':
        return {
          x: xData,
          y: this.filter(yData, parameters.cutoff || 0.1, parameters.type || 'lowpass'),
        }

      case 'resample':
        return this.resample(xData, yData, parameters.points || 100)

      case 'interpolate':
        return this.interpolate(xData, yData, parameters.method || 'linear')

      case 'fft':
        return this.fft(xData, yData)

      case 'abs':
        return { x: xData, y: yData.map(Math.abs) }

      case 'log':
        return { x: xData, y: yData.map((y) => Math.log(Math.abs(y) || 1e-10)) }

      case 'exp':
        return { x: xData, y: yData.map(Math.exp) }

      case 'sqrt':
        return { x: xData, y: yData.map((y) => Math.sqrt(Math.abs(y))) }

      case 'custom':
        if (parameters.expression) {
          return this.customTransform(xData, yData, parameters.expression)
        }
        return { x: xData, y: yData }

      default:
        return { x: xData, y: yData }
    }
  }

  /**
   * Normalize to [0, 1]
   */
  private normalize(data: number[]): number[] {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min
    return data.map((val) => (range === 0 ? 0 : (val - min) / range))
  }

  /**
   * Standardize to mean=0, std=1
   */
  private standardize(data: number[]): number[] {
    const mean = data.reduce((a, b) => a + b, 0) / data.length
    const variance =
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    const std = Math.sqrt(variance)
    return data.map((val) => (std === 0 ? 0 : (val - mean) / std))
  }

  /**
   * Moving average smoothing
   */
  private movingAverage(data: number[], window: number): number[] {
    const result: number[] = []
    const halfWindow = Math.floor(window / 2)

    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - halfWindow)
      const end = Math.min(data.length, i + halfWindow + 1)
      const windowData = data.slice(start, end)
      const avg = windowData.reduce((a, b) => a + b, 0) / windowData.length
      result.push(avg)
    }

    return result
  }

  /**
   * Calculate derivative (dy/dx)
   */
  private derivative(xData: number[], yData: number[]): { x: number[]; y: number[] } {
    const newX: number[] = []
    const newY: number[] = []

    for (let i = 1; i < xData.length; i++) {
      const dx = xData[i] - xData[i - 1]
      const dy = yData[i] - yData[i - 1]
      newX.push((xData[i] + xData[i - 1]) / 2)
      newY.push(dx === 0 ? 0 : dy / dx)
    }

    return { x: newX, y: newY }
  }

  /**
   * Calculate integral using trapezoidal rule
   */
  private integral(xData: number[], yData: number[]): number[] {
    const result: number[] = [0]
    let cumulative = 0

    for (let i = 1; i < xData.length; i++) {
      const dx = xData[i] - xData[i - 1]
      const avgY = (yData[i] + yData[i - 1]) / 2
      cumulative += avgY * dx
      result.push(cumulative)
    }

    return result
  }

  /**
   * Baseline correction using polynomial fit
   */
  private baselineCorrection(data: number[], order: number): number[] {
    const n = data.length
    const x = Array.from({ length: n }, (_, i) => i)

    // Fit polynomial
    const coeffs = this.polyfit(x, data, order)

    // Subtract baseline
    return data.map((val, i) => {
      let baseline = 0
      for (let j = 0; j <= order; j++) {
        baseline += coeffs[j] * Math.pow(i, j)
      }
      return val - baseline
    })
  }

  /**
   * Simple polynomial fit
   */
  private polyfit(x: number[], y: number[], order: number): number[] {
    // Simplified polynomial fitting (would use proper library in production)
    const coeffs: number[] = []

    if (order === 0) {
      const mean = y.reduce((a, b) => a + b, 0) / y.length
      return [mean]
    } else if (order === 1) {
      // Linear fit
      const n = x.length
      const sumX = x.reduce((a, b) => a + b, 0)
      const sumY = y.reduce((a, b) => a + b, 0)
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n

      return [intercept, slope]
    }

    // For higher orders, return zeros (would implement proper fitting)
    return Array(order + 1).fill(0)
  }

  /**
   * Simple low/high pass filter
   */
  private filter(
    data: number[],
    cutoff: number,
    type: 'lowpass' | 'highpass'
  ): number[] {
    // Simple moving average filter for lowpass
    if (type === 'lowpass') {
      const window = Math.max(3, Math.floor(1 / cutoff))
      return this.movingAverage(data, window)
    } else {
      // Highpass = original - lowpass
      const lowpass = this.filter(data, cutoff, 'lowpass')
      return data.map((val, i) => val - lowpass[i])
    }
  }

  /**
   * Resample data to specified number of points
   */
  private resample(
    xData: number[],
    yData: number[],
    targetPoints: number
  ): { x: number[]; y: number[] } {
    const newX: number[] = []
    const newY: number[] = []

    const xMin = Math.min(...xData)
    const xMax = Math.max(...xData)
    const step = (xMax - xMin) / (targetPoints - 1)

    for (let i = 0; i < targetPoints; i++) {
      const targetX = xMin + i * step
      newX.push(targetX)

      // Linear interpolation
      let y = 0
      if (targetX <= xData[0]) {
        y = yData[0]
      } else if (targetX >= xData[xData.length - 1]) {
        y = yData[yData.length - 1]
      } else {
        // Find surrounding points
        for (let j = 0; j < xData.length - 1; j++) {
          if (xData[j] <= targetX && targetX <= xData[j + 1]) {
            const t = (targetX - xData[j]) / (xData[j + 1] - xData[j])
            y = yData[j] + t * (yData[j + 1] - yData[j])
            break
          }
        }
      }

      newY.push(y)
    }

    return { x: newX, y: newY }
  }

  /**
   * Interpolate missing data
   */
  private interpolate(
    xData: number[],
    yData: number[],
    method: 'linear' | 'cubic'
  ): { x: number[]; y: number[] } {
    // For now, just return original (would implement proper interpolation)
    return { x: xData, y: yData }
  }

  /**
   * Fast Fourier Transform (simplified)
   */
  private fft(xData: number[], yData: number[]): { x: number[]; y: number[] } {
    // Simplified FFT - would use proper FFT library in production
    const n = yData.length
    const frequencies: number[] = []
    const magnitudes: number[] = []

    for (let k = 0; k < Math.floor(n / 2); k++) {
      frequencies.push(k / (xData[xData.length - 1] - xData[0]))

      // Calculate magnitude at frequency k
      let real = 0
      let imag = 0

      for (let j = 0; j < n; j++) {
        const angle = (-2 * Math.PI * k * j) / n
        real += yData[j] * Math.cos(angle)
        imag += yData[j] * Math.sin(angle)
      }

      magnitudes.push(Math.sqrt(real * real + imag * imag) / n)
    }

    return { x: frequencies, y: magnitudes }
  }

  /**
   * Custom transformation with expression
   */
  private customTransform(
    xData: number[],
    yData: number[],
    expression: string
  ): { x: number[]; y: number[] } {
    try {
      // Safe evaluation of simple math expressions
      // In production, would use a proper expression parser
      const newY = yData.map((y, i) => {
        const x = xData[i]
        // Replace variables and evaluate
        let expr = expression.replace(/y/g, String(y)).replace(/x/g, String(x))
        // Very basic evaluation (unsafe - would use proper parser)
        return eval(expr) as number
      })

      return { x: xData, y: newY }
    } catch (error) {
      console.error('Error in custom transform:', error)
      return { x: xData, y: yData }
    }
  }

  /**
   * Get step name
   */
  private getStepName(type: TransformationType): string {
    const names: Record<TransformationType, string> = {
      normalize: 'Normalize (0-1)',
      standardize: 'Standardize (Z-score)',
      smooth: 'Smooth (Moving Avg)',
      derivative: 'Derivative (dy/dx)',
      integral: 'Integral',
      baseline: 'Baseline Correction',
      filter: 'Filter',
      resample: 'Resample',
      interpolate: 'Interpolate',
      fft: 'FFT',
      abs: 'Absolute Value',
      log: 'Logarithm',
      exp: 'Exponential',
      sqrt: 'Square Root',
      custom: 'Custom Expression',
    }

    return names[type] || type
  }

  /**
   * Get all steps
   */
  getSteps(): TransformationStep[] {
    return this.steps
  }

  /**
   * Clear all steps
   */
  clear(): void {
    this.steps = []
  }

  /**
   * Save pipeline to JSON
   */
  toJSON(): string {
    return JSON.stringify({
      steps: this.steps,
      createdAt: new Date().toISOString(),
    })
  }

  /**
   * Load pipeline from JSON
   */
  static fromJSON(json: string): DataTransformationPipeline {
    const pipeline = new DataTransformationPipeline()
    try {
      const data = JSON.parse(json)
      pipeline.steps = data.steps || []
    } catch (error) {
      console.error('Error loading pipeline:', error)
    }
    return pipeline
  }
}
