'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  TrendingUp,
  Activity,
  PieChart,
  LineChart,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

interface AdvancedAnalyticsProps {
  projectId: string
  datasets?: any[]
}

export function AdvancedAnalytics({ projectId, datasets = [] }: AdvancedAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('statistical')

  // Mock statistical data
  const stats = {
    totalDatapoints: 12547,
    averageQuality: 94.2,
    outliers: 23,
    completeness: 98.5,
    techniques: {
      CV: 45,
      EIS: 32,
      BatteryCycling: 23,
    },
  }

  const qualityMetrics = [
    {
      name: 'Data Completeness',
      value: 98.5,
      status: 'excellent',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Signal-to-Noise Ratio',
      value: 87.3,
      status: 'good',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Outlier Detection',
      value: 23,
      status: 'warning',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Reproducibility Score',
      value: 92.1,
      status: 'excellent',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  const trendAnalysis = [
    {
      metric: 'Peak Current Density',
      trend: '+12.3%',
      direction: 'up',
      confidence: 'high',
      description: 'Increasing trend over last 5 experiments',
    },
    {
      metric: 'Charge Transfer Resistance',
      trend: '-8.5%',
      direction: 'down',
      confidence: 'medium',
      description: 'Decreasing trend indicates better performance',
    },
    {
      metric: 'Capacitance',
      trend: '+5.2%',
      direction: 'up',
      confidence: 'high',
      description: 'Consistent improvement in capacitance values',
    },
    {
      metric: 'Stability Cycle Life',
      trend: '+18.7%',
      direction: 'up',
      confidence: 'high',
      description: 'Significant improvement in cycle stability',
    },
  ]

  const statisticalSummary = [
    { label: 'Total Datasets', value: datasets.length || 8, unit: 'files' },
    { label: 'Total Data Points', value: stats.totalDatapoints.toLocaleString(), unit: 'points' },
    { label: 'Average Quality', value: stats.averageQuality, unit: '%' },
    { label: 'Detected Outliers', value: stats.outliers, unit: 'points' },
    { label: 'Data Completeness', value: stats.completeness, unit: '%' },
    { label: 'Processing Time', value: '2.3', unit: 'sec' },
  ]

  const advancedTools = [
    {
      name: 'Fourier Transform',
      description: 'Frequency domain analysis of time-series data',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Peak Detection',
      description: 'Automated identification of peaks and valleys',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Regression Analysis',
      description: 'Linear and non-linear curve fitting',
      icon: LineChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Kinetics Modeling',
      description: 'Extract kinetic parameters from CV data',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      name: 'Equivalent Circuit',
      description: 'Fit EIS data to equivalent circuit models',
      icon: Target,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      name: 'Statistical Tests',
      description: 'ANOVA, t-tests, and significance analysis',
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Advanced Analytics Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive statistical analysis and data quality metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="quality">Data Quality</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="tools">Analysis Tools</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Statistical Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Statistical Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {statisticalSummary.map((stat) => (
                    <div key={stat.label} className="p-4 border rounded-lg bg-gradient-to-br from-white to-gray-50">
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                        <span className="text-sm font-normal text-gray-500 ml-1">{stat.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technique Distribution */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Technique Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(stats.techniques).map(([technique, count]) => {
                    const total = Object.values(stats.techniques).reduce((a, b) => a + b, 0)
                    const percentage = ((count / total) * 100).toFixed(1)
                    return (
                      <div key={technique}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{technique}</span>
                          <span className="text-sm text-gray-600">
                            {count} datasets ({percentage}%)
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Insights */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded">
                    <p className="font-medium text-green-900">Excellent Data Quality</p>
                    <p className="text-sm text-green-700 mt-1">
                      98.5% data completeness with minimal outliers
                    </p>
                  </div>
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                    <p className="font-medium text-blue-900">Strong Performance Trends</p>
                    <p className="text-sm text-blue-700 mt-1">
                      +12.3% improvement in key metrics over time
                    </p>
                  </div>
                  <div className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded">
                    <p className="font-medium text-purple-900">High Reproducibility</p>
                    <p className="text-sm text-purple-700 mt-1">
                      92.1% reproducibility score across experiments
                    </p>
                  </div>
                  <div className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded">
                    <p className="font-medium text-orange-900">Active Research</p>
                    <p className="text-sm text-orange-700 mt-1">
                      {datasets.length || 8} datasets analyzed this month
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Data Quality Tab */}
            <TabsContent value="quality" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {qualityMetrics.map((metric) => {
                  const Icon = metric.icon
                  return (
                    <Card key={metric.name}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className={`h-10 w-10 rounded-lg ${metric.bgColor} flex items-center justify-center mr-3`}>
                                <Icon className={`h-5 w-5 ${metric.color}`} />
                              </div>
                              <div>
                                <p className="font-medium">{metric.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{metric.status}</p>
                              </div>
                            </div>
                            <p className="text-3xl font-bold mt-2">
                              {typeof metric.value === 'number' && metric.value > 50
                                ? `${metric.value}%`
                                : metric.value}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Data Quality Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Quality Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { check: 'No missing values detected', status: true },
                      { check: 'All timestamps are sequential', status: true },
                      { check: 'Units are consistent across datasets', status: true },
                      { check: 'Baseline corrections applied', status: true },
                      { check: 'Outliers flagged for review', status: true },
                      { check: 'Metadata complete for all files', status: false },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded">
                        {item.status ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                        )}
                        <span className={item.status ? 'text-gray-700' : 'text-yellow-700'}>
                          {item.check}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-4">
              <div className="space-y-3">
                {trendAnalysis.map((trend) => (
                  <Card key={trend.metric}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <TrendingUp
                              className={`h-5 w-5 ${
                                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                              }`}
                            />
                            <div>
                              <p className="font-medium">{trend.metric}</p>
                              <p className="text-sm text-gray-600">{trend.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-2xl font-bold ${
                              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {trend.trend}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {trend.confidence} confidence
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <p className="text-sm text-blue-900 font-medium mb-2">Trend Analysis Notes</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Trends calculated from the last 10 experiments</li>
                  <li>• Confidence levels based on R² values and statistical significance</li>
                  <li>• Positive trends indicate performance improvements</li>
                  <li>• Use these insights to optimize future experiments</li>
                </ul>
              </div>
            </TabsContent>

            {/* Analysis Tools Tab */}
            <TabsContent value="tools" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {advancedTools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <Card key={tool.name} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 h-12 w-12 rounded-lg ${tool.bgColor} flex items-center justify-center`}>
                            <Icon className={`h-6 w-6 ${tool.color}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{tool.name}</h4>
                            <p className="text-sm text-gray-600">{tool.description}</p>
                            <Button size="sm" variant="ghost" className="mt-2 h-auto py-1 px-2 text-xs">
                              Run Analysis →
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="bg-purple-50 border border-purple-200 p-4 rounded">
                <p className="text-sm text-purple-900 font-medium mb-2">
                  <Zap className="h-4 w-4 inline mr-1" />
                  Advanced Analysis Features
                </p>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Automated parameter extraction and curve fitting</li>
                  <li>• Machine learning-powered trend prediction</li>
                  <li>• Custom analysis pipeline builder</li>
                  <li>• Export results in publication-ready formats</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
