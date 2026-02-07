import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    await prisma.file.delete({
      where: { id: params.fileId },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const body = await req.json()
    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.parentId !== undefined) updateData.parentId = body.parentId || null

    const updated = await prisma.file.update({
      where: { id: params.fileId },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update file' }, { status: 500 })
  }
}
