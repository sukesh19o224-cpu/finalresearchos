'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { FileUp, LineChart, FileText, Zap, Activity as ActivityIcon } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'upload' | 'analysis' | 'export' | 'visualization'
  title: string
  description: string
  timestamp: Date
  status?: 'success' | 'processing' | 'failed'
}

const icons = {
  upload: FileUp,
  analysis: Zap,
  export: FileText,
  visualization: LineChart,
}

const statusColors = {
  success: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In the future, fetch real activities from API
    // For now, show empty state
    const fetchActivities = async () => {
      try {
        // TODO: Replace with actual API call when activity tracking is implemented
        // const res = await fetch('/api/activities')
        // const data = await res.json()
        // setActivities(data.activities || [])
        setActivities([])
      } catch (error) {
        console.error('Failed to fetch activities:', error)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your latest actions and analysis results
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center">
            <ActivityIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No recent activity</p>
            <p className="text-gray-400 text-xs mt-1">
              Activity will appear here as you upload datasets and run analyses
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = icons[activity.type]
              return (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    {activity.status && (
                      <Badge className={`${statusColors[activity.status]} mb-1`}>
                        {activity.status}
                      </Badge>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
