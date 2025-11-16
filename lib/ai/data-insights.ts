/**
 * AI-Powered Data Insights and Anomaly Detection
 * Uses Ollama for local AI processing of electrochemistry data
 */

export interface DataInsight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'pattern'
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  confidence: number // 0-1
  affectedDataPoints?: number[]
  suggestion?: string
}

export interface AnomalyDetectionResult {
  anomalies: number[]
  scores: number[]
  threshold: number
  method: 'zscore' | 'iqr' | 'isolation_forest' | 'moving_average'
}

/**
 * Anomaly Detection using Z-Score method
 */
export function detectAnomaliesZScore(
  data: number[],
  threshold: number = 3
): AnomalyDetectionResult {
  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const variance =
    data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
  const stdDev = Math.sqrt(variance)

  const scores = data.map((val) => Math.abs((val - mean) / stdDev))
  const anomalies = scores
    .map((score, index) => (score > threshold ? index : -1))
    .filter((i) => i !== -1)

  return {
    anomalies,
    scores,
    threshold,
    method: 'zscore',
  }
}

/**
 * Anomaly Detection using IQR (Interquartile Range) method
 */
export function detectAnomaliesIQR(data: number[]): AnomalyDetectionResult {
  const sorted = [...data].sort((a, b) => a - b)
  const q1Index = Math.floor(sorted.length * 0.25)
  const q3Index = Math.floor(sorted.length * 0.75)
  const q1 = sorted[q1Index]
  const q3 = sorted[q3Index]
  const iqr = q3 - q1

  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr

  const anomalies: number[] = []
  const scores = data.map((val, index) => {
    const isAnomaly = val < lowerBound || val > upperBound
    if (isAnomaly) anomalies.push(index)

    // Calculate score based on distance from bounds
    const score = Math.max(
      Math.abs(val - lowerBound) / iqr,
      Math.abs(val - upperBound) / iqr
    )
    return score
  })

  return {
    anomalies,
    scores,
    threshold: 1.5,
    method: 'iqr',
  }
}

/**
 * Anomaly Detection using Moving Average method
 */
export function detectAnomaliesMovingAverage(
  data: number[],
  windowSize: number = 10,
  threshold: number = 2
): AnomalyDetectionResult {
  const movingAvg: number[] = []
  const movingStd: number[] = []

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize)
    const window = data.slice(start, i + 1)
    const avg = window.reduce((a, b) => a + b, 0) / window.length
    const variance =
      window.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / window.length
    const std = Math.sqrt(variance)

    movingAvg.push(avg)
    movingStd.push(std)
  }

  const anomalies: number[] = []
  const scores = data.map((val, index) => {
    const deviation = Math.abs(val - movingAvg[index]) / (movingStd[index] || 1)
    if (deviation > threshold) anomalies.push(index)
    return deviation
  })

  return {
    anomalies,
    scores,
    threshold,
    method: 'moving_average',
  }
}

/**
 * Generate insights from electrochemistry data
 */
export function generateDataInsights(
  xData: number[],
  yData: number[],
  context?: {
    type?: 'CV' | 'EIS' | 'CA' | 'CP' | 'LSV'
    xLabel?: string
    yLabel?: string
  }
): DataInsight[] {
  const insights: DataInsight[] = []

  // Detect anomalies
  const anomalyResult = detectAnomaliesZScore(yData, 3)
  if (anomalyResult.anomalies.length > 0) {
    insights.push({
      type: 'anomaly',
      severity: anomalyResult.anomalies.length > yData.length * 0.1 ? 'critical' : 'warning',
      title: 'Anomalies Detected',
      description: `Found ${anomalyResult.anomalies.length} anomalous data points (${((anomalyResult.anomalies.length / yData.length) * 100).toFixed(1)}% of total)`,
      confidence: 0.85,
      affectedDataPoints: anomalyResult.anomalies,
      suggestion: 'Review measurement conditions and verify electrode stability',
    })
  }

  // Analyze trends
  const trend = analyzeTrend(yData)
  if (trend.slope !== 0) {
    insights.push({
      type: 'trend',
      severity: 'info',
      title: `${trend.direction} Trend Detected`,
      description: `Data shows a ${trend.direction.toLowerCase()} trend with slope ${trend.slope.toExponential(2)}`,
      confidence: trend.confidence,
      suggestion:
        trend.direction === 'Increasing'
          ? 'Monitor for potential degradation or fouling'
          : 'Verify experimental conditions for unexpected decay',
    })
  }

  // Cyclic voltammetry specific insights
  if (context?.type === 'CV') {
    const cvInsights = analyzeCyclicVoltammetry(xData, yData)
    insights.push(...cvInsights)
  }

  // EIS specific insights
  if (context?.type === 'EIS') {
    const eisInsights = analyzeEIS(xData, yData)
    insights.push(...eisInsights)
  }

  // Data quality check
  const qualityInsight = analyzeDataQuality(yData)
  if (qualityInsight) {
    insights.push(qualityInsight)
  }

  // Noise analysis
  const noiseLevel = analyzeNoise(yData)
  if (noiseLevel > 0.1) {
    insights.push({
      type: 'pattern',
      severity: noiseLevel > 0.3 ? 'warning' : 'info',
      title: 'High Noise Level',
      description: `Signal-to-noise ratio suggests ${(noiseLevel * 100).toFixed(1)}% noise`,
      confidence: 0.75,
      suggestion: 'Consider applying smoothing filter or checking electrical connections',
    })
  }

  return insights
}

/**
 * Analyze trend in data
 */
function analyzeTrend(data: number[]): {
  direction: 'Increasing' | 'Decreasing' | 'Stable'
  slope: number
  confidence: number
} {
  const n = data.length
  const x = Array.from({ length: n }, (_, i) => i)
  const y = data

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

  // Calculate R²
  const yMean = sumY / n
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
  const predicted = x.map((xi) => slope * xi + (sumY - slope * sumX) / n)
  const ssResidual = y.reduce((sum, yi, i) => sum + Math.pow(yi - predicted[i], 2), 0)
  const r2 = 1 - ssResidual / ssTotal

  const direction =
    Math.abs(slope) < 1e-10 ? 'Stable' : slope > 0 ? 'Increasing' : 'Decreasing'

  return {
    direction,
    slope,
    confidence: Math.abs(r2),
  }
}

/**
 * Analyze cyclic voltammetry data
 */
function analyzeCyclicVoltammetry(
  potential: number[],
  current: number[]
): DataInsight[] {
  const insights: DataInsight[] = []

  // Find peaks (oxidation/reduction)
  const peaks = findPeaks(current, { minProminence: 0.1 })

  if (peaks.length > 0) {
    insights.push({
      type: 'pattern',
      severity: 'info',
      title: 'Redox Peaks Detected',
      description: `Identified ${peaks.length} redox peaks in cyclic voltammogram`,
      confidence: 0.9,
      affectedDataPoints: peaks.map((p) => p.index),
      suggestion: 'Analyze peak potentials and currents for reversibility assessment',
    })
  }

  // Check for reversibility
  const reversibility = checkReversibility(potential, current)
  if (reversibility.isReversible === false) {
    insights.push({
      type: 'recommendation',
      severity: 'info',
      title: 'Quasi-reversible or Irreversible Process',
      description: `Peak separation: ${reversibility.peakSeparation.toFixed(0)} mV`,
      confidence: 0.75,
      suggestion: 'Consider kinetic analysis or varying scan rate',
    })
  }

  return insights
}

/**
 * Analyze EIS data
 */
function analyzeEIS(frequency: number[], impedance: number[]): DataInsight[] {
  const insights: DataInsight[] = []

  // Check for typical EIS patterns
  const minZ = Math.min(...impedance)
  const maxZ = Math.max(...impedance)
  const range = maxZ - minZ

  if (range > minZ * 10) {
    insights.push({
      type: 'pattern',
      severity: 'info',
      title: 'Wide Impedance Range',
      description: `Impedance varies by ${(range / minZ).toFixed(1)}x across frequency spectrum`,
      confidence: 0.9,
      suggestion: 'Typical for systems with multiple time constants',
    })
  }

  return insights
}

/**
 * Analyze data quality
 */
function analyzeDataQuality(data: number[]): DataInsight | null {
  const hasNaN = data.some((val) => isNaN(val))
  const hasInf = data.some((val) => !isFinite(val))
  const hasZeros = data.every((val) => val === 0)

  if (hasNaN || hasInf) {
    return {
      type: 'anomaly',
      severity: 'critical',
      title: 'Data Quality Issue',
      description: 'Dataset contains invalid values (NaN or Infinity)',
      confidence: 1.0,
      suggestion: 'Check measurement equipment and data acquisition settings',
    }
  }

  if (hasZeros) {
    return {
      type: 'anomaly',
      severity: 'warning',
      title: 'All Zero Values',
      description: 'All data points are zero - possible measurement failure',
      confidence: 1.0,
      suggestion: 'Verify connections and restart measurement',
    }
  }

  return null
}

/**
 * Analyze noise level
 */
function analyzeNoise(data: number[]): number {
  if (data.length < 3) return 0

  // Calculate differences between consecutive points
  const diffs = data.slice(1).map((val, i) => Math.abs(val - data[i]))
  const meanDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length

  // Compare to overall signal range
  const range = Math.max(...data) - Math.min(...data)

  return range > 0 ? meanDiff / range : 0
}

/**
 * Find peaks in data
 */
function findPeaks(
  data: number[],
  options: { minProminence?: number } = {}
): Array<{ index: number; value: number }> {
  const peaks: Array<{ index: number; value: number }> = []
  const { minProminence = 0 } = options

  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
      const prominence = Math.min(data[i] - data[i - 1], data[i] - data[i + 1])

      if (prominence >= minProminence) {
        peaks.push({ index: i, value: data[i] })
      }
    }
  }

  return peaks
}

/**
 * Check CV reversibility
 */
function checkReversibility(
  potential: number[],
  current: number[]
): { isReversible: boolean; peakSeparation: number } {
  const oxidationPeaks = findPeaks(current, { minProminence: 0.1 })
  const reductionPeaks = findPeaks(
    current.map((c) => -c),
    { minProminence: 0.1 }
  )

  if (oxidationPeaks.length > 0 && reductionPeaks.length > 0) {
    const oxPotential = potential[oxidationPeaks[0].index]
    const redPotential = potential[reductionPeaks[0].index]
    const separation = Math.abs(oxPotential - redPotential) * 1000 // mV

    // For reversible system, separation should be ~59/n mV at 25°C
    const isReversible = separation < 100

    return { isReversible, peakSeparation: separation }
  }

  return { isReversible: false, peakSeparation: 0 }
}

/**
 * Get AI-powered recommendations using Ollama
 */
export async function getAIRecommendations(
  dataType: string,
  insights: DataInsight[]
): Promise<string> {
  try {
    const prompt = `You are an electrochemistry expert. Analyze the following data insights and provide specific recommendations:

Data Type: ${dataType}

Insights:
${insights.map((i, idx) => `${idx + 1}. ${i.title}: ${i.description}`).join('\n')}

Provide 3-5 specific, actionable recommendations for improving the experiment or interpreting the results. Focus on practical advice.`

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2',
        prompt,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error('Ollama API error')
    }

    const data = await response.json()
    return data.response
  } catch (error) {
    console.error('Error getting AI recommendations:', error)
    return 'AI recommendations unavailable. Ensure Ollama is running locally.'
  }
}
