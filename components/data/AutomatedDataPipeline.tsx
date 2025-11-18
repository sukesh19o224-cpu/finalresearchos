'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Workflow,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  FileCheck,
  Database,
  Filter,
  TrendingUp,
  Download,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ValidationResult {
  rule: string
  status: 'pass' | 'warning' | 'fail'
  message: string
  affectedRows?: number
}

interface DataQualityReport {
  totalRows: number
  cleanRows: number
  issuesFound: number
  validationResults: ValidationResult[]
  autoFixedIssues: number
  suggestions: string[]
}

export function AutomatedDataPipeline({ projectId }: { projectId: string }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [report, setReport] = useState<DataQualityReport | null>(null)
  const { toast } = useToast()

  const runAutomatedPipeline = async () => {
    setIsProcessing(true)
    setProgress(0)

    // Simulate data processing steps
    const steps = [
      { name: 'Detecting file format', duration: 500 },
      { name: 'Reading data', duration: 800 },
      { name: 'Validating structure', duration: 600 },
      { name: 'Checking for outliers', duration: 1000 },
      { name: 'Cleaning data', duration: 700 },
      { name: 'Generating report', duration: 400 },
    ]

    let currentProgress = 0
    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.duration))
      currentProgress += 100 / steps.length
      setProgress(currentProgress)
    }

    // Generate mock report
    setReport({
      totalRows: 15234,
      cleanRows: 14891,
      issuesFound: 343,
      autoFixedIssues: 289,
      validationResults: [
        {
          rule: 'Missing Values',
          status: 'warning',
          message: 'Found 54 rows with missing voltage values',
          affectedRows: 54,
        },
        {
          rule: 'Outlier Detection',
          status: 'warning',
          message: 'Detected 23 outliers (>3σ from mean)',
          affectedRows: 23,
        },
        {
          rule: 'Time Sequence',
          status: 'pass',
          message: 'Time stamps are sequential and valid',
        },
        {
          rule: 'Data Range',
          status: 'pass',
          message: 'All values within expected ranges',
        },
        {
          rule: 'Duplicate Rows',
          status: 'pass',
          message: 'No duplicate entries found',
        },
        {
          rule: 'Units Consistency',
          status: 'warning',
          message: 'Mixed units detected (mV and V)',
          affectedRows: 12,
        },
      ],
      suggestions: [
        'Interpolate missing voltage values using linear method',
        'Review outliers - they may indicate interesting phenomena',
        'Standardize all voltage units to V',
        'Consider adding temperature compensation',
      ],
    })

    setIsProcessing(false)
    toast({
      title: 'Data pipeline completed',
      description: '289 issues auto-fixed, 54 require review',
    })
  }

  const statusIcons = {
    pass: CheckCircle2,
    warning: AlertTriangle,
    fail: XCircle,
  }

  const statusColors = {
    pass: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-orange-600 bg-orange-50 border-orange-200',
    fail: 'text-red-600 bg-red-50 border-red-200',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Automated Data Pipeline
        </CardTitle>
        <CardDescription>
          AI-powered data cleaning & validation - Save 80% of your time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!report && !isProcessing && (
          <div className="text-center py-8">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Process Your Data</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Our automated pipeline will validate, clean, and prepare your data for analysis.
              No manual work required!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded-lg">
                <FileCheck className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-medium">Format Detection</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Database className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-xs font-medium">Data Validation</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Filter className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <p className="text-xs font-medium">Auto-Cleaning</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                <p className="text-xs font-medium">Quality Report</p>
              </div>
            </div>
            <Button onClick={runAutomatedPipeline} size="lg">
              <Zap className="h-4 w-4 mr-2" />
              Run Automated Pipeline
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="py-8">
            <div className="text-center mb-6">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Workflow className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Processing Your Data...</h3>
              <p className="text-sm text-gray-600 mt-1">
                Validating and cleaning {(15234).toLocaleString()} data points
              </p>
            </div>
            <Progress value={progress} className="h-3 mb-2" />
            <p className="text-sm text-gray-600 text-center">{progress.toFixed(0)}% complete</p>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {report.totalRows.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Total Rows</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold text-green-600">
                    {report.cleanRows.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Clean Rows</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold text-orange-600">{report.issuesFound}</p>
                  <p className="text-xs text-gray-600 mt-1">Issues Found</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold text-purple-600">
                    {report.autoFixedIssues}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Auto-Fixed</p>
                </CardContent>
              </Card>
            </div>

            {/* Validation Results */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Validation Results</h3>
              <div className="space-y-2">
                {report.validationResults.map((result, index) => {
                  const Icon = statusIcons[result.status]
                  return (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${statusColors[result.status]}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{result.rule}</p>
                          <p className="text-sm mt-1">{result.message}</p>
                          {result.affectedRows && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {result.affectedRows} rows affected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI Suggestions */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                AI Recommendations
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {report.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-blue-900">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Accept All Fixes
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" onClick={runAutomatedPipeline}>
                <Workflow className="h-4 w-4 mr-2" />
                Run Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
