import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/projects/[id]/files - List files in a folder
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth()
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: params.id, userId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // For now, return mock data since we don't have File model in database yet
    // In production, you'd query from a ProjectFile model
    const mockFiles = [
      {
        id: 'folder-1',
        name: 'Experiments',
        type: 'folder',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentId: null,
        children: [],
      },
      {
        id: 'folder-2',
        name: 'Analysis',
        type: 'folder',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentId: null,
        children: [],
      },
      {
        id: 'file-1',
        name: 'README.md',
        type: 'file',
        size: 1024,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentId: null,
      },
    ]

    return NextResponse.json({
      files: mockFiles,
      folders: mockFiles.filter(f => f.type === 'folder'),
    })
  } catch (error: any) {
    console.error('Get files error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to get files' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/files - Create folder or upload file
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth()
    const body = await request.json()

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: params.id, userId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // For now, return success
    // In production, you'd create in ProjectFile model
    const mockFile = {
      id: `item-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ file: mockFile }, { status: 201 })
  } catch (error: any) {
    console.error('Create file error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to create file/folder' },
      { status: 500 }
    )
  }
}
