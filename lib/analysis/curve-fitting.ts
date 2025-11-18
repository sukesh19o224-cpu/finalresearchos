import * as ss from 'simple-statistics'
import { linear, polynomial } from 'regression'

export interface FitResult {
  type: string
  equation: string
  r2: number
  coefficients: number[]
  predict: (x: number) => number
}

export interface StatisticsResult {
  mean: number
  median: number
  stdDev: number
  variance: number
  min: number
  max: number
  q1: number
  q3: number
  count: number
}

export interface PeakResult {
  index: number
  x: number
  y: number
  prominence: number
  width?: number
}

/**
 * Linear regression: y = mx + b
 */
export function fitLinear(xData: number[], yData: number[]): FitResult {
  const points = xData.map((x, i) => [x, yData[i]] as [number, number])
  const result = linear(points)

  const predictions = xData.map((x) => result.predict(x)[1])
  const r2 = calculateR2(yData, predictions)

  return {
    type: 'Linear',
    equation: `y = ${result.equation[0].toFixed(6)}x + ${result.equation[1].toFixed(6)}`,
    r2,
    coefficients: result.equation,
    predict: (x: number) => result.predict(x)[1],
  }
}

/**
 * Polynomial regression: y = a₀ + a₁x + a₂x² + ... + aₙxⁿ
 */
export function fitPolynomial(
  xData: number[],
  yData: number[],
  order: number = 2
): FitResult {
  const points = xData.map((x, i) => [x, yData[i]] as [number, number])
  const result = polynomial(points, { order })

  const predictions = xData.map((x) => result.predict(x)[1])
  const r2 = calculateR2(yData, predictions)

  // Build equation string
  const terms = result.equation
    .map((coef, i) => {
      const power = result.equation.length - 1 - i
      if (power === 0) return coef.toFixed(6)
      if (power === 1) return `${coef.toFixed(6)}x`
      return `${coef.toFixed(6)}x^${power}`
    })
    .join(' + ')

  return {
    type: `Polynomial (order ${order})`,
    equation: `y = ${terms}`,
    r2,
    coefficients: result.equation,
    predict: (x: number) => result.predict(x)[1],
  }
}

/**
 * Exponential regression: y = ae^(bx)
 */
export function fitExponential(xData: number[], yData: number[]): FitResult {
  // Convert to linear by taking log
  const logY = yData.map((y) => Math.log(Math.abs(y)))
  const points = xData.map((x, i) => [x, logY[i]] as [number, number])
  const result = linear(points)

  const a = Math.exp(result.equation[1])
  const b = result.equation[0]

  const predict = (x: number) => a * Math.exp(b * x)
  const predictions = xData.map(predict)
  const r2 = calculateR2(yData, predictions)

  return {
    type: 'Exponential',
    equation: `y = ${a.toFixed(6)}e^(${b.toFixed(6)}x)`,
    r2,
    coefficients: [a, b],
    predict,
  }
}

/**
 * Logarithmic regression: y = a + b*ln(x)
 */
export function fitLogarithmic(xData: number[], yData: number[]): FitResult {
  const logX = xData.map((x) => Math.log(Math.abs(x)))
  const points = logX.map((x, i) => [x, yData[i]] as [number, number])
  const result = linear(points)

  const a = result.equation[1]
  const b = result.equation[0]

  const predict = (x: number) => a + b * Math.log(Math.abs(x))
  const predictions = xData.map(predict)
  const r2 = calculateR2(yData, predictions)

  return {
    type: 'Logarithmic',
    equation: `y = ${a.toFixed(6)} + ${b.toFixed(6)}*ln(x)`,
    r2,
    coefficients: [a, b],
    predict,
  }
}

/**
 * Power regression: y = ax^b
 */
export function fitPower(xData: number[], yData: number[]): FitResult {
  const logX = xData.map((x) => Math.log(Math.abs(x)))
  const logY = yData.map((y) => Math.log(Math.abs(y)))
  const points = logX.map((x, i) => [x, logY[i]] as [number, number])
  const result = linear(points)

  const a = Math.exp(result.equation[1])
  const b = result.equation[0]

  const predict = (x: number) => a * Math.pow(Math.abs(x), b)
  const predictions = xData.map(predict)
  const r2 = calculateR2(yData, predictions)

  return {
    type: 'Power',
    equation: `y = ${a.toFixed(6)}x^${b.toFixed(6)}`,
    r2,
    coefficients: [a, b],
    predict,
  }
}

/**
 * Calculate R² (coefficient of determination)
 */
function calculateR2(actual: number[], predicted: number[]): number {
  const mean = ss.mean(actual)
  const ssTotal = actual.reduce((sum, y) => sum + Math.pow(y - mean, 2), 0)
  const ssResidual = actual.reduce(
    (sum, y, i) => sum + Math.pow(y - predicted[i], 2),
    0
  )
  return 1 - ssResidual / ssTotal
}

/**
 * Calculate comprehensive statistics
 */
export function calculateStatistics(data: number[]): StatisticsResult {
  const sorted = [...data].sort((a, b) => a - b)

  return {
    mean: ss.mean(data),
    median: ss.median(data),
    stdDev: ss.standardDeviation(data),
    variance: ss.variance(data),
    min: ss.min(data),
    max: ss.max(data),
    q1: ss.quantile(sorted, 0.25),
    q3: ss.quantile(sorted, 0.75),
    count: data.length,
  }
}

/**
 * Find peaks in data
 */
export function findPeaks(
  xData: number[],
  yData: number[],
  options: {
    minProminence?: number
    minDistance?: number
  } = {}
): PeakResult[] {
  const { minProminence = 0, minDistance = 1 } = options
  const peaks: PeakResult[] = []

  for (let i = 1; i < yData.length - 1; i++) {
    // Check if it's a local maximum
    if (yData[i] > yData[i - 1] && yData[i] > yData[i + 1]) {
      // Calculate prominence
      let leftMin = yData[i]
      let rightMin = yData[i]

      for (let j = i - 1; j >= 0; j--) {
        if (yData[j] < leftMin) leftMin = yData[j]
        if (yData[j] > yData[i]) break
      }

      for (let j = i + 1; j < yData.length; j++) {
        if (yData[j] < rightMin) rightMin = yData[j]
        if (yData[j] > yData[i]) break
      }

      const prominence = yData[i] - Math.max(leftMin, rightMin)

      if (prominence >= minProminence) {
        peaks.push({
          index: i,
          x: xData[i],
          y: yData[i],
          prominence,
        })
      }
    }
  }

  // Apply minimum distance constraint
  if (minDistance > 1) {
    return peaks.filter((peak, idx) => {
      if (idx === 0) return true
      return peak.index - peaks[idx - 1].index >= minDistance
    })
  }

  return peaks
}

/**
 * Smooth data using moving average
 */
export function smoothData(data: number[], windowSize: number = 5): number[] {
  const halfWindow = Math.floor(windowSize / 2)
  return data.map((_, i) => {
    const start = Math.max(0, i - halfWindow)
    const end = Math.min(data.length, i + halfWindow + 1)
    const window = data.slice(start, end)
    return ss.mean(window)
  })
}

/**
 * Calculate derivative (numerical differentiation)
 */
export function calculateDerivative(
  xData: number[],
  yData: number[]
): { x: number[]; dy: number[] } {
  const x: number[] = []
  const dy: number[] = []

  for (let i = 0; i < xData.length - 1; i++) {
    x.push((xData[i] + xData[i + 1]) / 2)
    dy.push((yData[i + 1] - yData[i]) / (xData[i + 1] - xData[i]))
  }

  return { x, dy }
}

/**
 * Baseline correction (polynomial subtraction)
 */
export function correctBaseline(
  xData: number[],
  yData: number[],
  order: number = 1
): number[] {
  const fit = fitPolynomial(xData, yData, order)
  return yData.map((y, i) => y - fit.predict(xData[i]))
}
