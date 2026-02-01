import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { name, parentId } = body
    
    console.log('Creating folder:', { name, parentId, projectId: params.id })
    
    const folderData: any = {
      name,
      type: 'folder',
      projectId: params.id,
    }
    
    if (parentId) {
      folderData.parentId = parentId
    }
    
    const folder = await prisma.file.create({
      data: folderData,
    })
    
    console.log('Folder created:', folder)
    
    return NextResponse.json(folder, { status: 201 })
  } catch (error) {
    console.error('Failed to create folder - Full error:', error)
    return NextResponse.json({ 
      error: 'Failed to create folder', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
