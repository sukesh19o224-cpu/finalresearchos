import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  researchType: z.string().optional(),
  status: z.enum(['active', 'archived', 'deleted']).optional(),
})

// GET /api/projects/[id] - Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth()

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        pages: {
          orderBy: { position: 'asc' },
        },
        datasets: {
          orderBy: { uploadedAt: 'desc' },
        },
        papers: {
          orderBy: { uploadedAt: 'desc' },
        },
        visualizations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Update last accessed
    await prisma.project.update({
      where: { id: params.id },
      data: { lastAccessed: new Date() },
    })

    return NextResponse.json({ project })
  } catch (error: any) {
    console.error('Get project error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to get project' },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/[id] - Update project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth()
    const body = await request.json()

    const updates = updateProjectSchema.parse(body)

    // Verify ownership
    const existingProject = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: updates,
    })

    return NextResponse.json({ project })
  } catch (error: any) {
    console.error('Update project error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth()

    // Verify ownership
    const existingProject = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Soft delete by setting status
    await prisma.project.update({
      where: { id: params.id },
      data: { status: 'deleted' },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete project error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
