'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow, format } from 'date-fns'
import {
  FileUp,
  FileText,
  GitBranch,
  Users,
  Settings,
  Trash2,
  Star,
  Edit,
  Plus,
  Download,
  MessageSquare,
} from 'lucide-react'

interface TimelineEvent {
  id: string
  type: 'upload' | 'create' | 'edit' | 'delete' | 'share' | 'export' | 'comment' | 'star'
  title: string
  description: string
  timestamp: Date
  user: {
    name: string
    avatar?: string
  }
  metadata?: any
}

const mockEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'upload' as const,
    title: 'Uploaded dataset',
    description: 'CV_battery_test_01.csv',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    user: { name: 'You' },
  },
  {
    id: '2',
    type: 'create' as const,
    title: 'Created visualization',
    description: 'Nyquist plot for EIS analysis',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    user: { name: 'You' },
  },
  {
    id: '3',
    type: 'comment' as const,
    title: 'Added comment',
    description: 'Peak current observed at 0.5V vs Ag/AgCl',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    user: { name: 'You' },
  },
  {
    id: '4',
    type: 'share' as const,
    title: 'Shared project',
    description: 'Invited Dr. Smith as collaborator',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    user: { name: 'You' },
  },
  {
    id: '5',
    type: 'export' as const,
    title: 'Exported data',
    description: 'Project data exported to CSV format',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    user: { name: 'You' },
  },
]

const eventIcons = {
  upload: FileUp,
  create: Plus,
  edit: Edit,
  delete: Trash2,
  share: Users,
  export: Download,
  comment: MessageSquare,
  star: Star,
}

const eventColors = {
  upload: 'bg-blue-100 text-blue-600',
  create: 'bg-green-100 text-green-600',
  edit: 'bg-yellow-100 text-yellow-600',
  delete: 'bg-red-100 text-red-600',
  share: 'bg-purple-100 text-purple-600',
  export: 'bg-orange-100 text-orange-600',
  comment: 'bg-pink-100 text-pink-600',
  star: 'bg-amber-100 text-amber-600',
}

export function ActivityTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[25px] top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Events */}
          <div className="space-y-6">
            {mockEvents.map((event, index) => {
              const Icon = eventIcons[event.type]
              const isToday = new Date(event.timestamp).toDateString() === new Date().toDateString()

              return (
                <div key={event.id} className="relative pl-14">
                  {/* Icon */}
                  <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${eventColors[event.type]}`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{event.title}</p>
                          {isToday && <Badge variant="secondary" className="text-xs">Today</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{event.user.name}</span>
                          <span>•</span>
                          <time>{formatDistanceToNow(event.timestamp, { addSuffix: true })}</time>
                          <span>•</span>
                          <time>{format(event.timestamp, 'MMM d, h:mm a')}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load more */}
          <div className="mt-6 text-center">
            <button className="text-sm text-blue-600 hover:underline">
              Load earlier activity
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact timeline for dashboard
 */
export function CompactTimeline() {
  return (
    <div className="space-y-3">
      {mockEvents.slice(0, 5).map(event => {
        const Icon = eventIcons[event.type]
        return (
          <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${eventColors[event.type]}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{event.title}</p>
              <p className="text-xs text-gray-600 truncate">{event.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(event.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
