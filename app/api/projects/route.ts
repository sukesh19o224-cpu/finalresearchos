import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  researchType: z.string().optional(),
})

// GET /api/projects - List all projects for current user
export async function GET() {
  try {
    const userId = await requireAuth()

    const projects = await prisma.project.findMany({
      where: {
        userId,
        status: 'active',
      },
      orderBy: {
        lastAccessed: 'desc',
      },
      include: {
        _count: {
          select: {
            pages: true,
            datasets: true,
            papers: true,
          },
        },
      },
    })

    return NextResponse.json({ projects })
  } catch (error: any) {
    console.error('Get projects error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to get projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth()
    const body = await request.json()

    const { title, description, researchType } = createProjectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        userId,
        title,
        description,
        researchType,
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error: any) {
    console.error('Create project error:', error)

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
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
