import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get recent projects
    const recentProjects = await prisma.project.findMany({
      where: { userId, status: 'active' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    })

    // Get recent datasets
    const recentDatasets = await prisma.dataset.findMany({
      where: {
        project: {
          userId,
          status: 'active',
        },
      },
      select: {
        id: true,
        name: true,
        technique: true,
        uploadedAt: true,
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
      take: limit,
    })

    // Get recent visualizations
    const recentVisualizations = await prisma.visualization.findMany({
      where: {
        project: {
          userId,
          status: 'active',
        },
      },
      select: {
        id: true,
        name: true,
        plotType: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Get recent pages
    const recentPages = await prisma.page.findMany({
      where: {
        project: {
          userId,
          status: 'active',
        },
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    })

    // Combine and format activities
    const activities: any[] = []

    recentProjects.forEach((project) => {
      activities.push({
        id: `project-created-${project.id}`,
        type: 'project_created',
        title: 'Created project',
        description: project.title,
        timestamp: project.createdAt,
        projectId: project.id,
        projectTitle: project.title,
      })
    })

    recentDatasets.forEach((dataset) => {
      activities.push({
        id: `dataset-uploaded-${dataset.id}`,
        type: 'dataset_uploaded',
        title: 'Uploaded dataset',
        description: `${dataset.name} (${dataset.technique})`,
        timestamp: dataset.uploadedAt,
        projectId: dataset.project.id,
        projectTitle: dataset.project.title,
      })
    })

    recentVisualizations.forEach((viz) => {
      activities.push({
        id: `visualization-created-${viz.id}`,
        type: 'visualization_created',
        title: 'Created visualization',
        description: `${viz.name} (${viz.plotType})`,
        timestamp: viz.createdAt,
        projectId: viz.project.id,
        projectTitle: viz.project.title,
      })
    })

    recentPages.forEach((page) => {
      activities.push({
        id: `page-created-${page.id}`,
        type: 'page_created',
        title: 'Created note',
        description: page.title,
        timestamp: page.createdAt,
        projectId: page.project.id,
        projectTitle: page.project.title,
      })
    })

    // Sort by timestamp descending and take limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({ activities: sortedActivities })
  } catch (error: any) {
    console.error('Activity feed error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
