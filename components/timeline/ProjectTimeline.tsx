'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, CheckCircle, Circle, Clock, Plus, Target } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface Milestone {
  id: string
  title: string
  description: string
  dueDate: Date
  completed: boolean
  completedAt?: Date
  progress: number
}

interface ProjectTimelineProps {
  projectId: string
}

export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      title: 'Project Setup',
      description: 'Initialize project and configure equipment',
      dueDate: new Date(Date.now() - 86400000),
      completed: true,
      completedAt: new Date(Date.now() - 86400000),
      progress: 100,
    },
    {
      id: '2',
      title: 'Baseline Measurements',
      description: 'Collect baseline CV and EIS data',
      dueDate: new Date(Date.now() + 86400000),
      completed: false,
      progress: 60,
    },
    {
      id: '3',
      title: 'Data Analysis',
      description: 'Analyze collected data and extract parameters',
      dueDate: new Date(Date.now() + 172800000),
      completed: false,
      progress: 0,
    },
  ])

  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const { toast } = useToast()

  const addMilestone = () => {
    if (!newTitle.trim()) return

    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDescription,
      dueDate: new Date(Date.now() + 604800000), // 7 days from now
      completed: false,
      progress: 0,
    }

    setMilestones([...milestones, milestone])
    setNewTitle('')
    setNewDescription('')
    setShowAdd(false)

    toast({
      title: 'Milestone added',
      description: `"${newTitle}" has been added to your timeline.`,
    })
  }

  const toggleComplete = (milestoneId: string) => {
    setMilestones(
      milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              completed: !m.completed,
              completedAt: !m.completed ? new Date() : undefined,
              progress: !m.completed ? 100 : 0,
            }
          : m
      )
    )
  }

  const updateProgress = (milestoneId: string, progress: number) => {
    setMilestones(
      milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, progress, completed: progress === 100, completedAt: progress === 100 ? new Date() : undefined }
          : m
      )
    )
  }

  const completedCount = milestones.filter((m) => m.completed).length
  const totalProgress = Math.round((completedCount / milestones.length) * 100)

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Project Progress
          </CardTitle>
          <CardDescription>Track your research milestones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Ring */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - totalProgress / 100)}`}
                  className="text-blue-600"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute">
                <p className="text-3xl font-bold">{totalProgress}%</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {completedCount} of {milestones.length} milestones completed
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <p className="text-2xl font-bold text-green-700">{completedCount}</p>
              <p className="text-xs text-green-600">Completed</p>
            </div>
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-2xl font-bold text-blue-700">
                {milestones.length - completedCount}
              </p>
              <p className="text-xs text-blue-600">In Progress</p>
            </div>
          </div>

          <Button
            onClick={() => setShowAdd(!showAdd)}
            className="w-full"
            variant={showAdd ? 'outline' : 'default'}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showAdd ? 'Cancel' : 'Add Milestone'}
          </Button>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showAdd && (
            <div className="mb-6 p-4 border rounded-lg bg-blue-50 space-y-3">
              <Input
                placeholder="Milestone title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Input
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <div className="flex space-x-2">
                <Button onClick={addMilestone} size="sm">
                  Add
                </Button>
                <Button
                  onClick={() => {
                    setShowAdd(false)
                    setNewTitle('')
                    setNewDescription('')
                  }}
                  size="sm"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const isOverdue = !milestone.completed && milestone.dueDate < new Date()

              return (
                <div key={milestone.id} className="relative">
                  {/* Timeline line */}
                  {index !== milestones.length - 1 && (
                    <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  <div className="flex items-start space-x-4">
                    {/* Status Icon */}
                    <button
                      onClick={() => toggleComplete(milestone.id)}
                      className={`flex-shrink-0 mt-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                        milestone.completed
                          ? 'bg-green-500 border-green-500'
                          : 'bg-white border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {milestone.completed ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4
                            className={`font-semibold ${
                              milestone.completed ? 'text-gray-500 line-through' : ''
                            }`}
                          >
                            {milestone.title}
                          </h4>
                          {milestone.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p
                            className={`text-sm flex items-center ${
                              isOverdue ? 'text-red-600' : 'text-gray-600'
                            }`}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(milestone.dueDate)}
                          </p>
                          {milestone.completedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Completed {formatDate(milestone.completedAt)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {!milestone.completed && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{milestone.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all"
                              style={{ width: `${milestone.progress}%` }}
                            />
                          </div>
                          <div className="flex space-x-1 mt-2">
                            {[0, 25, 50, 75, 100].map((value) => (
                              <button
                                key={value}
                                onClick={() => updateProgress(milestone.id, value)}
                                className={`flex-1 py-1 text-xs rounded border ${
                                  milestone.progress === value
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white border-gray-300 hover:border-blue-400'
                                }`}
                              >
                                {value}%
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
