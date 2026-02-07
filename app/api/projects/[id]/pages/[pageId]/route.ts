import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Get single page with content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const userId = await getCurrentUser()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, pageId } = await params

    const project = await prisma.project.findFirst({
      where: { id, userId },
    })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const page = await prisma.page.findFirst({
      where: { id: pageId, projectId: id },
    })
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error('Error getting page:', error)
    return NextResponse.json({ error: 'Failed to get page' }, { status: 500 })
  }
}

// PATCH - Update page (title, icon, or content)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const userId = await getCurrentUser()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, pageId } = await params
    const body = await request.json()

    const project = await prisma.project.findFirst({
      where: { id, userId },
    })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const existingPage = await prisma.page.findFirst({
      where: { id: pageId, projectId: id },
    })
    if (!existingPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.icon !== undefined) updateData.icon = body.icon
    if (body.position !== undefined) updateData.position = body.position

    // If content is being saved, merge into properties
    if (body.content !== undefined) {
      const currentProps = (existingPage.properties as any) || {}
      updateData.properties = { ...currentProps, yooptaContent: body.content }
    }

    const page = await prisma.page.update({
      where: { id: pageId },
      data: updateData,
    })

    return NextResponse.json({ page })
  } catch (error) {
    console.error('Error updating page:', error)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

// DELETE - Delete page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const userId = await getCurrentUser()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, pageId } = await params

    const project = await prisma.project.findFirst({
      where: { id, userId },
    })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    await prisma.page.delete({
      where: { id: pageId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting page:', error)
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
