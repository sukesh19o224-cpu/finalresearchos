'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  TrendingUp,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  Activity,
  Sparkles,
  BarChart3,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface MLPredictionsProps {
  projectId: string
}

export function MLPredictions({ projectId }: MLPredictionsProps) {
  const [predicting, setPredicting] = useState(false)
  const [modelTrained, setModelTrained] = useState(true)
  const { toast } = useToast()

  // Mock prediction results
  const predictions = {
    peakCurrent: {
      predicted: 2.45,
      confidence: 94.2,
      range: [2.38, 2.52],
      unit: 'mA',
    },
    resistance: {
      predicted: 15.3,
      confidence: 91.5,
      range: [14.8, 15.8],
      unit: 'Ω',
    },
    capacitance: {
      predicted: 142.7,
      confidence: 88.9,
      range: [138.2, 147.2],
      unit: 'mF',
    },
    cycleLife: {
      predicted: 1250,
      confidence: 85.3,
      range: [1180, 1320],
      unit: 'cycles',
    },
  }

  const models = [
    {
      name: 'Peak Current Predictor',
      type: 'Random Forest',
      accuracy: 94.2,
      trained: '2 days ago',
      samples: 250,
      status: 'ready',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Resistance Estimator',
      type: 'Neural Network',
      accuracy: 91.5,
      trained: '1 week ago',
      samples: 180,
      status: 'ready',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Cycle Life Forecaster',
      type: 'Gradient Boosting',
      accuracy: 85.3,
      trained: '3 days ago',
      samples: 320,
      status: 'ready',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Anomaly Detector',
      type: 'Isolation Forest',
      accuracy: 96.8,
      trained: '5 days ago',
      samples: 450,
      status: 'ready',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ]

  const trainingMetrics = [
    { label: 'Training Accuracy', value: 94.2, unit: '%' },
    { label: 'Validation Accuracy', value: 91.8, unit: '%' },
    { label: 'R² Score', value: 0.92, unit: '' },
    { label: 'MAE', value: 0.08, unit: 'units' },
    { label: 'Training Samples', value: 250, unit: 'samples' },
    { label: 'Training Time', value: 3.2, unit: 'sec' },
  ]

  const featureImportance = [
    { feature: 'Scan Rate', importance: 0.28 },
    { feature: 'Electrolyte Concentration', importance: 0.22 },
    { feature: 'Temperature', importance: 0.18 },
    { feature: 'Electrode Area', importance: 0.15 },
    { feature: 'pH Level', importance: 0.10 },
    { feature: 'Previous Cycle Performance', importance: 0.07 },
  ]

  const recommendations = [
    {
      title: 'Optimize Scan Rate',
      description: 'Model suggests scan rate of 50 mV/s for optimal current density',
      impact: 'high',
      confidence: 92,
      icon: Target,
    },
    {
      title: 'Temperature Control',
      description: 'Maintain temperature at 25°C ± 1°C for best reproducibility',
      impact: 'medium',
      confidence: 88,
      icon: Activity,
    },
    {
      title: 'Electrolyte Adjustment',
      description: 'Increase concentration to 0.5M for improved performance',
      impact: 'high',
      confidence: 90,
      icon: Sparkles,
    },
  ]

  const runPrediction = async () => {
    setPredicting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setPredicting(false)

    toast({
      title: 'Prediction complete!',
      description: 'ML models have generated predictions for your parameters.',
    })
  }

  const retrainModel = async () => {
    toast({
      title: 'Model retraining started',
      description: 'This may take a few minutes...',
    })

    await new Promise((resolve) => setTimeout(resolve, 3000))

    toast({
      title: 'Model retrained successfully',
      description: 'Model accuracy improved by 2.3%',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Machine Learning Predictions
          </CardTitle>
          <CardDescription>
            AI-powered predictions and performance optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="predictions">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="optimize">Optimize</TabsTrigger>
            </TabsList>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Parameter Predictions</h3>
                  <p className="text-sm text-gray-600">
                    AI-generated predictions based on your historical data
                  </p>
                </div>
                <Button onClick={runPrediction} disabled={predicting}>
                  {predicting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Run Prediction
                    </>
                  )}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(predictions).map(([key, pred]) => (
                  <Card key={key}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-3xl font-bold mt-1">
                            {pred.predicted}
                            <span className="text-base font-normal text-gray-500 ml-1">
                              {pred.unit}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">
                              {pred.confidence}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">confidence</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Confidence Range</span>
                          <span className="font-medium">
                            {pred.range[0]} - {pred.range[1]} {pred.unit}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: `${pred.confidence}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  <Brain className="h-4 w-4 inline mr-1" />
                  How Predictions Work
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Models trained on your historical experimental data</li>
                  <li>• Predictions based on current experimental conditions</li>
                  <li>• Confidence intervals show prediction uncertainty</li>
                  <li>• Models continuously improve as you add more data</li>
                </ul>
              </div>
            </TabsContent>

            {/* Models Tab */}
            <TabsContent value="models" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Active ML Models</h3>
                  <p className="text-sm text-gray-600">
                    {models.length} models trained and ready
                  </p>
                </div>
                <Button onClick={retrainModel} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retrain All Models
                </Button>
              </div>

              <div className="grid gap-4">
                {models.map((model) => {
                  const Icon = model.icon
                  return (
                    <Card key={model.name}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={`h-12 w-12 rounded-lg ${model.bgColor} flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`h-6 w-6 ${model.color}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{model.name}</h4>
                              <p className="text-sm text-gray-600">{model.type}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>Trained {model.trained}</span>
                                <span>•</span>
                                <span>{model.samples} samples</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="text-2xl font-bold text-green-600">
                                  {model.accuracy}%
                                </p>
                                <p className="text-xs text-gray-500">accuracy</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Training Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Model Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {trainingMetrics.map((metric) => (
                      <div key={metric.label} className="p-3 border rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                        <p className="text-xl font-bold">
                          {metric.value}
                          {metric.unit && (
                            <span className="text-sm font-normal text-gray-500 ml-1">
                              {metric.unit}
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              {/* Feature Importance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feature Importance</CardTitle>
                  <CardDescription>
                    Which experimental parameters have the biggest impact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {featureImportance.map((feature, index) => (
                      <div key={feature.feature}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-400">
                              #{index + 1}
                            </span>
                            <span className="font-medium">{feature.feature}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {(feature.importance * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                            style={{ width: `${feature.importance * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Anomaly Detection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                    Anomaly Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-green-900">All Systems Normal</p>
                          <p className="text-sm text-green-700 mt-1">
                            No anomalies detected in recent experiments
                          </p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 border rounded">
                        <p className="text-2xl font-bold text-green-600">0</p>
                        <p className="text-xs text-gray-600 mt-1">Anomalies Found</p>
                      </div>
                      <div className="p-3 border rounded">
                        <p className="text-2xl font-bold text-blue-600">100</p>
                        <p className="text-xs text-gray-600 mt-1">Scans Analyzed</p>
                      </div>
                      <div className="p-3 border rounded">
                        <p className="text-2xl font-bold text-purple-600">96.8%</p>
                        <p className="text-xs text-gray-600 mt-1">Detection Accuracy</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Optimize Tab */}
            <TabsContent value="optimize" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Recommendations</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Optimize your experimental conditions based on ML insights
                </p>
              </div>

              <div className="space-y-3">
                {recommendations.map((rec) => {
                  const Icon = rec.icon
                  return (
                    <Card key={rec.title}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{rec.title}</h4>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`px-2 py-1 text-xs rounded ${
                                    rec.impact === 'high'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {rec.impact} impact
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-gray-600">
                                  {rec.confidence}% confidence
                                </span>
                              </div>
                              <Button size="sm" variant="outline">
                                Apply
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="bg-purple-50 border border-purple-200 p-4 rounded">
                <p className="text-sm text-purple-900 font-medium mb-2">
                  <Sparkles className="h-4 w-4 inline mr-1" />
                  Optimization Strategy
                </p>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Recommendations based on analysis of 250+ experiments</li>
                  <li>• Models identify optimal parameter combinations</li>
                  <li>• Continuous learning improves suggestions over time</li>
                  <li>• Apply recommendations incrementally and track results</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
