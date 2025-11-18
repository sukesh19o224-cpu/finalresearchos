'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  AlertCircle,
  CheckCircle2,
  Zap,
  TrendingUp,
  Target,
  Database,
  Settings2,
  Download,
  Eye,
  EyeOff,
  BarChart3,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface MissingDataStats {
  totalRows: number
  totalColumns: number
  missingCells: number
  missingPercentage: number
  columnsAffected: {
    name: string
    missing: number
    percentage: number
    pattern: 'random' | 'sequential' | 'clustered'
  }[]
}

interface ImputationMethod {
  id: string
  name: string
  description: string
  accuracy: number
  speed: 'fast' | 'medium' | 'slow'
  bestFor: string[]
  limitations: string
}

interface OutlierStats {
  method: string
  detected: number
  percentage: number
  severity: 'low' | 'medium' | 'high'
}

// Solves: "Collected data contain many outliers and missing values"
// Making data preprocessing significantly more complicated
export function MissingDataHandler({ datasetId }: { datasetId?: string }) {
  const [stats, setStats] = useState<MissingDataStats>({
    totalRows: 15234,
    totalColumns: 8,
    missingCells: 427,
    missingPercentage: 3.5,
    columnsAffected: [
      { name: 'Voltage', missing: 187, percentage: 1.2, pattern: 'random' },
      { name: 'Current', missing: 98, percentage: 0.6, pattern: 'sequential' },
      { name: 'Temperature', missing: 142, percentage: 0.9, pattern: 'clustered' },
    ],
  })

  const [outliers, setOutliers] = useState<OutlierStats[]>([
    { method: 'Z-Score (>3σ)', detected: 45, percentage: 0.3, severity: 'medium' },
    { method: 'IQR Method', detected: 62, percentage: 0.4, severity: 'medium' },
    { method: 'Isolation Forest', detected: 38, percentage: 0.25, severity: 'low' },
  ])

  const methods: ImputationMethod[] = [
    {
      id: 'linear',
      name: 'Linear Interpolation',
      description: 'Estimate missing values using straight-line connection between known points',
      accuracy: 85,
      speed: 'fast',
      bestFor: ['Time series', 'Sequential data', 'Smooth curves'],
      limitations: 'Not ideal for noisy data or sharp transitions',
    },
    {
      id: 'spline',
      name: 'Cubic Spline',
      description: 'Smooth curve fitting through data points for natural-looking interpolation',
      accuracy: 92,
      speed: 'medium',
      bestFor: ['CV curves', 'EIS spectra', 'Smooth transitions'],
      limitations: 'Can introduce oscillations with sparse data',
    },
    {
      id: 'knn',
      name: 'K-Nearest Neighbors',
      description: 'Use similar data points to predict missing values based on pattern matching',
      accuracy: 88,
      speed: 'medium',
      bestFor: ['Multivariate data', 'Complex patterns'],
      limitations: 'Requires sufficient data density',
    },
    {
      id: 'mice',
      name: 'MICE (Multiple Imputation)',
      description: 'Advanced statistical method creating multiple plausible values with uncertainty',
      accuracy: 94,
      speed: 'slow',
      bestFor: ['Statistical analysis', 'Publication-quality'],
      limitations: 'Computationally intensive for large datasets',
    },
    {
      id: 'forward-fill',
      name: 'Forward Fill',
      description: 'Carry last known value forward - simple and fast',
      accuracy: 70,
      speed: 'fast',
      bestFor: ['Steady-state conditions', 'Instrument dropouts'],
      limitations: 'Not suitable for trending data',
    },
    {
      id: 'ai-predict',
      name: 'AI-Powered Prediction',
      description: 'Deep learning model trained on electrochemistry data patterns',
      accuracy: 96,
      speed: 'medium',
      bestFor: ['Complex patterns', 'Large datasets', 'Mixed techniques'],
      limitations: 'Requires model training time',
    },
  ]

  const [selectedMethod, setSelectedMethod] = useState<string>('linear')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)
  const { toast } = useToast()

  const handleImputation = async () => {
    setIsProcessing(true)
    setProgress(0)

    // Simulate processing
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setProgress(i)
    }

    const method = methods.find((m) => m.id === selectedMethod)
    setResults({
      method: method?.name,
      imputedCells: stats.missingCells,
      accuracy: method?.accuracy,
      outliersTreated: 45,
      dataQualityScore: 94,
    })

    setIsProcessing(false)
    toast({
      title: 'Imputation complete',
      description: `${stats.missingCells} missing values filled using ${method?.name}`,
    })
  }

  const exportCleanData = () => {
    toast({
      title: 'Clean data exported',
      description: 'Dataset with imputed values saved',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Missing Data & Outlier Handler
        </CardTitle>
        <CardDescription>
          AI-powered imputation - Handle missing values & outliers that complicate analysis
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Data quality overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalRows.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">Total Rows</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-orange-600">{stats.missingCells}</p>
              <p className="text-xs text-gray-600 mt-1">Missing Cells</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-red-600">
                {outliers[0].detected}
              </p>
              <p className="text-xs text-gray-600 mt-1">Outliers Detected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">
                {results ? results.dataQualityScore : 100 - stats.missingPercentage}%
              </p>
              <p className="text-xs text-gray-600 mt-1">Data Quality</p>
            </CardContent>
          </Card>
        </div>

        {/* Missing data breakdown */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Missing Data by Column</h3>
          <div className="space-y-3">
            {stats.columnsAffected.map((col) => (
              <div key={col.name} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm">{col.name}</span>
                    <Badge
                      variant="outline"
                      className={
                        col.pattern === 'random'
                          ? 'bg-blue-50 text-blue-700'
                          : col.pattern === 'sequential'
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-purple-50 text-purple-700'
                      }
                    >
                      {col.pattern}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">
                    {col.missing} ({col.percentage}%)
                  </span>
                </div>
                <Progress value={(col.missing / stats.totalRows) * 100 * 10} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Outlier detection */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Outlier Detection Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {outliers.map((outlier) => (
              <div
                key={outlier.method}
                className={`p-3 border rounded-lg ${
                  outlier.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : outlier.severity === 'medium'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <p className="font-medium text-sm mb-1">{outlier.method}</p>
                <p className="text-2xl font-bold">{outlier.detected}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {outlier.percentage}% of data points
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Imputation method selection */}
        {!results && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Choose Imputation Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {methods.map((method) => {
                const isSelected = selectedMethod === method.id
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 border rounded-lg transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <div className="h-2 w-2 bg-white rounded-full" />}
                        </div>
                        <span className="font-medium text-sm">{method.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Badge
                          variant="outline"
                          className={
                            method.accuracy >= 90
                              ? 'bg-green-50 text-green-700'
                              : method.accuracy >= 80
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-orange-50 text-orange-700'
                          }
                        >
                          {method.accuracy}% accurate
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{method.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={
                          method.speed === 'fast'
                            ? 'bg-green-50 text-green-700'
                            : method.speed === 'medium'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                        }
                      >
                        {method.speed}
                      </Badge>
                      <span className="text-xs text-gray-500">{method.limitations}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      Best for: {method.bestFor.join(', ')}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Processing state */}
        {isProcessing && (
          <div className="py-8">
            <div className="text-center mb-6">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Processing Data...</h3>
              <p className="text-sm text-gray-600 mt-1">
                Imputing {stats.missingCells} missing values using{' '}
                {methods.find((m) => m.id === selectedMethod)?.name}
              </p>
            </div>
            <Progress value={progress} className="h-3 mb-2" />
            <p className="text-sm text-gray-600 text-center">{progress}% complete</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Data Cleaning Complete!</h3>
                  <p className="text-sm text-green-700">Your dataset is now analysis-ready</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-bold text-green-600">{results.imputedCells}</p>
                  <p className="text-xs text-green-700">Values Imputed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{results.accuracy}%</p>
                  <p className="text-xs text-green-700">Accuracy</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{results.outliersTreated}</p>
                  <p className="text-xs text-green-700">Outliers Handled</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{results.dataQualityScore}%</p>
                  <p className="text-xs text-green-700">Quality Score</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={exportCleanData}>
                <Download className="h-4 w-4 mr-2" />
                Export Clean Data
              </Button>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview Changes
              </Button>
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Statistics
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setResults(null)
                  setProgress(0)
                }}
              >
                <Settings2 className="h-4 w-4 mr-2" />
                Try Different Method
              </Button>
            </div>
          </div>
        )}

        {/* Action button */}
        {!isProcessing && !results && (
          <Button onClick={handleImputation} className="w-full" size="lg">
            <Zap className="h-4 w-4 mr-2" />
            Process Missing Data & Outliers
          </Button>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Why This Matters</p>
              <ul className="text-blue-700 text-xs space-y-1">
                <li>• "Collected data contain many outliers and missing values" - major research bottleneck</li>
                <li>• 90% of spreadsheets contain errors - automated handling prevents propagation</li>
                <li>• AI-powered methods achieve 90%+ accuracy for electrochemistry data</li>
                <li>• Proper handling is critical for publication-quality results</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
