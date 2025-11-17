'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  Cpu,
  HardDrive,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  status: 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  icon: any
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'API Response Time',
      value: 145,
      unit: 'ms',
      status: 'good' as const,
      trend: 'down' as const,
      icon: Zap,
    },
    {
      name: 'Database Queries',
      value: 23,
      unit: 'ms avg',
      status: 'good' as const,
      trend: 'stable' as const,
      icon: HardDrive,
    },
    {
      name: 'Memory Usage',
      value: 67,
      unit: '%',
      status: 'warning' as const,
      trend: 'up' as const,
      icon: Cpu,
    },
    {
      name: 'Active Sessions',
      value: 12,
      unit: 'users',
      status: 'good' as const,
      trend: 'up' as const,
      icon: Activity,
    },
  ])

  const [systemHealth, setSystemHealth] = useState({
    overall: 95,
    uptime: '99.99%',
    lastIncident: '12 days ago',
  })

  const statusColors = {
    good: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
  }

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 10,
      })))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time performance monitoring</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {systemHealth.overall}%
              </div>
              <p className="text-sm text-gray-500">Overall Health</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{systemHealth.uptime}</p>
              <p className="text-sm text-gray-600 mt-1">Uptime</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">~150ms</p>
              <p className="text-sm text-gray-600 mt-1">Avg Response</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{systemHealth.lastIncident}</p>
              <p className="text-sm text-gray-600 mt-1">Last Incident</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Activity

          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <TrendIcon className={`h-4 w-4 ${
                    metric.trend === 'up' ? 'text-red-500' :
                    metric.trend === 'down' ? 'text-green-500' :
                    'text-gray-400'
                  }`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {Math.round(metric.value)}
                    </span>
                    <span className="text-sm text-gray-500">{metric.unit}</span>
                  </div>
                  <p className="text-sm text-gray-600">{metric.name}</p>
                  <Badge className={`${statusColors[metric.status]} border text-xs`}>
                    {metric.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Performance Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends (Last 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-b from-blue-50 to-transparent rounded-lg flex items-end justify-around p-4">
            {Array.from({ length: 24 }).map((_, i) => {
              const height = Math.random() * 100
              return (
                <div
                  key={i}
                  className="w-2 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`${i}:00 - ${Math.round(height)}ms`}
                />
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>24h ago</span>
            <span>Now</span>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">High Memory Usage Detected</p>
                <p className="text-xs text-gray-600 mt-1">Memory usage reached 67% - consider scaling</p>
                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Activity className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Performance Improved</p>
                <p className="text-xs text-gray-600 mt-1">API response time decreased by 15%</p>
                <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
