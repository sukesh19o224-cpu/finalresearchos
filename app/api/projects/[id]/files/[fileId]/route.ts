import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// PATCH /api/projects/[id]/files/[fileId] - Rename file/folder
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
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
    // In production, you'd update in ProjectFile model
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update file error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to update file/folder' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id]/files/[fileId] - Delete file/folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const userId = await requireAuth()

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: params.id, userId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // For now, return success
    // In production, you'd delete from ProjectFile model
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete file error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to delete file/folder' },
      { status: 500 }
    )
  }
}
