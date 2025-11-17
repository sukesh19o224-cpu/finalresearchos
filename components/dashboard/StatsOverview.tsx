'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, Database, TrendingUp, Activity } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  trend?: 'up' | 'down'
  loading?: boolean
}

function StatCard({ title, value, change, icon, trend, loading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {change && !loading && (
          <p className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-gray-600'}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function StatsOverview() {
  const [stats, setStats] = useState({
    projects: 0,
    datasets: 0,
    visualizations: 0,
    activeExperiments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/projects')
        if (res.ok) {
          const data = await res.json()
          const projects = data.projects || []

          // Calculate real stats from projects
          const totalDatasets = projects.reduce((sum: number, p: any) =>
            sum + (p._count?.datasets || 0), 0
          )

          setStats({
            projects: projects.length,
            datasets: totalDatasets,
            visualizations: 0, // This would come from a different API
            activeExperiments: projects.filter((p: any) => p.status === 'active').length,
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Projects"
        value={stats.projects}
        change={stats.projects > 0 ? `${stats.projects} active` : undefined}
        icon={<FolderKanban className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
      <StatCard
        title="Datasets"
        value={stats.datasets}
        change={stats.datasets > 0 ? `Across all projects` : undefined}
        icon={<Database className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
      <StatCard
        title="Visualizations"
        value={stats.visualizations}
        change="Coming soon"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
      <StatCard
        title="Active Experiments"
        value={stats.activeExperiments}
        change={stats.activeExperiments > 0 ? `${stats.activeExperiments} in progress` : undefined}
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
    </div>
  )
}
