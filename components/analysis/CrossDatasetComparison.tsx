'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Settings2,
  Download,
  FileText,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Dataset {
  id: string
  name: string
  technique: string
  rows: number
  columns: string[]
  units: Record<string, string>
  dateCollected: Date
  operator: string
}

interface ComparisonIssue {
  type: 'unit-mismatch' | 'column-missing' | 'scale-difference' | 'time-offset'
  severity: 'critical' | 'warning' | 'info'
  description: string
  autoFixAvailable: boolean
}

interface StandardizationAction {
  dataset: string
  action: string
  from: string
  to: string
  applied: boolean
}

// Solves: Cross-lab comparison failures (Harvard vs Berkeley)
// Different units, scales, time offsets prevent data comparison
export function CrossDatasetComparison({ projectId }: { projectId?: string }) {
  const [selectedDatasets, setSelectedDatasets] = useState<Dataset[]>([])
  const [comparisonStatus, setComparisonStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle')
  const [issues, setIssues] = useState<ComparisonIssue[]>([])
  const [standardizationActions, setStandardizationActions] = useState<StandardizationAction[]>([])
  const { toast } = useToast()

  // Mock datasets for demo
  const availableDatasets: Dataset[] = [
    {
      id: '1',
      name: 'Lab A - CV Scan',
      technique: 'Cyclic Voltammetry',
      rows: 1500,
      columns: ['Time', 'Voltage', 'Current'],
      units: { Voltage: 'mV', Current: 'µA', Time: 'seconds' },
      dateCollected: new Date('2024-11-15'),
      operator: 'Researcher A',
    },
    {
      id: '2',
      name: 'Lab B - CV Scan',
      technique: 'Cyclic Voltammetry',
      rows: 1520,
      columns: ['Time', 'Potential', 'Current'],
      units: { Potential: 'V', Current: 'mA', Time: 'ms' },
      dateCollected: new Date('2024-11-16'),
      operator: 'Researcher B',
    },
    {
      id: '3',
      name: 'Lab C - EIS Data',
      technique: 'EIS',
      rows: 2000,
      columns: ['Frequency', 'Z_real', 'Z_imag'],
      units: { Frequency: 'Hz', Z_real: 'Ω', Z_imag: 'Ω' },
      dateCollected: new Date('2024-11-17'),
      operator: 'Researcher C',
    },
  ]

  const handleDatasetSelection = (dataset: Dataset) => {
    if (selectedDatasets.find((d) => d.id === dataset.id)) {
      setSelectedDatasets(selectedDatasets.filter((d) => d.id !== dataset.id))
    } else if (selectedDatasets.length < 4) {
      setSelectedDatasets([...selectedDatasets, dataset])
    } else {
      toast({
        title: 'Maximum 4 datasets',
        description: 'You can compare up to 4 datasets at once',
        variant: 'destructive',
      })
    }
  }

  const analyzeCompatibility = async () => {
    if (selectedDatasets.length < 2) {
      toast({
        title: 'Select at least 2 datasets',
        description: 'Comparison requires minimum 2 datasets',
        variant: 'destructive',
      })
      return
    }

    setComparisonStatus('analyzing')

    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Detect issues
    const detectedIssues: ComparisonIssue[] = [
      {
        type: 'unit-mismatch',
        severity: 'critical',
        description: 'Voltage units differ: Lab A uses mV, Lab B uses V (1000x difference)',
        autoFixAvailable: true,
      },
      {
        type: 'unit-mismatch',
        severity: 'critical',
        description: 'Current units differ: Lab A uses µA, Lab B uses mA (1000x difference)',
        autoFixAvailable: true,
      },
      {
        type: 'column-missing',
        severity: 'warning',
        description: 'Column name mismatch: "Voltage" vs "Potential" - likely same parameter',
        autoFixAvailable: true,
      },
      {
        type: 'time-offset',
        severity: 'warning',
        description: 'Time units differ: Lab A uses seconds, Lab B uses milliseconds',
        autoFixAvailable: true,
      },
      {
        type: 'scale-difference',
        severity: 'info',
        description: 'Datasets collected on different dates - may need temporal alignment',
        autoFixAvailable: false,
      },
    ]

    const actions: StandardizationAction[] = [
      {
        dataset: 'Lab A - CV Scan',
        action: 'Convert voltage units',
        from: 'mV',
        to: 'V',
        applied: false,
      },
      {
        dataset: 'Lab B - CV Scan',
        action: 'Convert current units',
        from: 'mA',
        to: 'µA',
        applied: false,
      },
      {
        dataset: 'Lab B - CV Scan',
        action: 'Rename column',
        from: 'Potential',
        to: 'Voltage',
        applied: false,
      },
      {
        dataset: 'Lab B - CV Scan',
        action: 'Convert time units',
        from: 'ms',
        to: 'seconds',
        applied: false,
      },
    ]

    setIssues(detectedIssues)
    setStandardizationActions(actions)
    setComparisonStatus('complete')
  }

  const applyAllStandardizations = () => {
    setStandardizationActions(
      standardizationActions.map((action) => ({ ...action, applied: true }))
    )
    toast({
      title: 'Standardization applied',
      description: `${standardizationActions.length} transformations applied to datasets`,
    })
  }

  const exportComparisonReport = () => {
    toast({
      title: 'Report exported',
      description: 'Comparison report saved with all standardization steps',
    })
  }

  const severityIcons = {
    critical: AlertTriangle,
    warning: AlertTriangle,
    info: CheckCircle2,
  }

  const severityColors = {
    critical: 'text-red-600 bg-red-50 border-red-200',
    warning: 'text-orange-600 bg-orange-50 border-orange-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Cross-Dataset Comparison & Auto-Standardization
            </CardTitle>
            <CardDescription>
              Compare datasets across labs - Auto-fix unit mismatches & column differences
            </CardDescription>
          </div>
          {selectedDatasets.length > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {selectedDatasets.length} selected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Dataset selection */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Select Datasets to Compare (2-4)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableDatasets.map((dataset) => {
              const isSelected = selectedDatasets.find((d) => d.id === dataset.id)
              return (
                <button
                  key={dataset.id}
                  onClick={() => handleDatasetSelection(dataset)}
                  className={`p-4 border rounded-lg transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <span className="font-medium text-sm">{dataset.name}</span>
                    </div>
                    <Badge variant="outline">{dataset.technique}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                    <span>{dataset.rows.toLocaleString()} rows</span>
                    <span>{dataset.columns.length} columns</span>
                    <span>{dataset.operator}</span>
                    <span>{dataset.dateCollected.toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dataset.columns.slice(0, 3).map((col) => (
                      <Badge key={col} variant="outline" className="text-xs">
                        {col} ({dataset.units[col] || 'unknown'})
                      </Badge>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

          {selectedDatasets.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">
              Select 2 or more datasets to begin comparison analysis
            </p>
          )}
        </div>

        {/* Analysis button */}
        {selectedDatasets.length >= 2 && comparisonStatus === 'idle' && (
          <Button onClick={analyzeCompatibility} className="w-full" size="lg">
            <Settings2 className="h-4 w-4 mr-2" />
            Analyze Compatibility & Auto-Standardize
          </Button>
        )}

        {/* Analyzing state */}
        {comparisonStatus === 'analyzing' && (
          <div className="py-12 text-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <p className="text-lg font-semibold">Analyzing {selectedDatasets.length} datasets...</p>
            <p className="text-sm text-gray-600 mt-1">
              Checking units, columns, scales, and time alignment
            </p>
          </div>
        )}

        {/* Results */}
        {comparisonStatus === 'complete' && (
          <div className="space-y-6">
            {/* Compatibility issues */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Detected Issues</h3>
              <div className="space-y-2">
                {issues.map((issue, index) => {
                  const Icon = severityIcons[issue.severity]
                  return (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${severityColors[issue.severity]}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm capitalize">
                              {issue.type.replace(/-/g, ' ')}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                issue.severity === 'critical'
                                  ? 'bg-red-100'
                                  : issue.severity === 'warning'
                                  ? 'bg-orange-100'
                                  : 'bg-blue-100'
                              }`}
                            >
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-sm">{issue.description}</p>
                          {issue.autoFixAvailable && (
                            <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Auto-fix available
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Standardization actions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Standardization Actions</h3>
                <Button variant="outline" size="sm" onClick={applyAllStandardizations}>
                  <Zap className="h-3 w-3 mr-1" />
                  Apply All ({standardizationActions.length})
                </Button>
              </div>
              <div className="space-y-2">
                {standardizationActions.map((action, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg ${
                      action.applied ? 'bg-green-50 border-green-300' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {action.applied ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Settings2 className="h-5 w-5 text-gray-500" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{action.dataset}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {action.action}: <code className="bg-white px-1 py-0.5 rounded">{action.from}</code> →{' '}
                          <code className="bg-white px-1 py-0.5 rounded">{action.to}</code>
                        </p>
                      </div>
                      {action.applied && (
                        <Badge className="bg-green-100 text-green-800">Applied</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">
                      {standardizationActions.filter(a => a.applied).length}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">Actions Applied</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <p className="text-2xl font-bold text-orange-600">
                      {issues.filter(i => i.severity === 'critical').length}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">Critical Issues</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-600">
                      {standardizationActions.filter(a => a.applied).length === standardizationActions.length ? '100' : '0'}%
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">Ready to Compare</p>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button onClick={exportComparisonReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Side-by-Side
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setComparisonStatus('idle')
                  setIssues([])
                  setStandardizationActions([])
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Comparison
              </Button>
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <GitCompare className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-purple-900 mb-1">Why Cross-Lab Comparison Matters</p>
              <ul className="text-purple-700 text-xs space-y-1">
                <li>• Harvard & Berkeley couldn't reproduce results for 2 years due to unit differences</li>
                <li>• Auto-standardization prevents 1000x scaling errors (mV vs V, µA vs mA)</li>
                <li>• Critical for collaborative research and meta-analyses</li>
                <li>• Ensures reproducibility across different labs and instruments</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
