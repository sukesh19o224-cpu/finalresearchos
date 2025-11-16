'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderOpen, PlusCircle, FileText, Database, Zap } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Analytics } from '@/components/dashboard/Analytics'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to ElctrDc</h1>
        <p className="text-gray-600">
          Your integrated electrochemistry research platform
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/dashboard/projects/new">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <PlusCircle className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>New Project</CardTitle>
              <CardDescription>
                Start a new research project
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/dashboard/projects">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <FolderOpen className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>All Projects</CardTitle>
              <CardDescription>
                View and manage projects
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow opacity-50">
          <CardHeader>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>
              Chat with your research AI
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Analytics Dashboard */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Research Analytics</h2>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Analytics />
          </div>
          <div>
            <ActivityFeed limit={15} />
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Projects</h2>
          <Link href="/dashboard/projects">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first research project
              </p>
              <Link href="/dashboard/projects/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {project._count?.pages || 0} pages
                      </div>
                      <div className="flex items-center">
                        <Database className="h-4 w-4 mr-1" />
                        {project._count?.datasets || 0} datasets
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Last accessed {formatDate(project.lastAccessed)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
