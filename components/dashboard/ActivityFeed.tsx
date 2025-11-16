'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FolderOpen,
  Database,
  BarChart3,
  FileText,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  type: 'project_created' | 'dataset_uploaded' | 'visualization_created' | 'page_created'
  title: string
  description: string
  timestamp: string
  projectId: string
  projectTitle: string
}

export function ActivityFeed({ limit = 10 }: { limit?: number }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/activity?limit=${limit}`)
      if (res.ok) {
        const data = await res.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'project_created':
        return <FolderOpen className="h-4 w-4 text-blue-600" />
      case 'dataset_uploaded':
        return <Database className="h-4 w-4 text-green-600" />
      case 'visualization_created':
        return <BarChart3 className="h-4 w-4 text-purple-600" />
      case 'page_created':
        return <FileText className="h-4 w-4 text-orange-600" />
    }
  }

  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'recently'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest research actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest research actions</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">Start working on projects to see activity here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                  onClick={() => router.push(`/dashboard/projects/${activity.projectId}`)}
                >
                  <div className="mt-1 flex-shrink-0">{getIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {activity.description}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <p className="text-xs text-gray-500">
                        in {activity.projectTitle}
                      </p>
                      <span className="text-gray-300">•</span>
                      <p className="text-xs text-gray-500">
                        {getTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
