import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parserRegistry } from '@/lib/parsers/parser-registry'
import { writeFile } from 'fs/promises'
import { join } from 'path'

// Route segment config for large file uploads
export const maxDuration = 60 // Maximum duration in seconds

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth()
    const projectId = params.id

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Parse the file
    const parsedData = await parserRegistry.parseFile(file)

    // For now, save file to public/uploads (in production, use Vercel Blob or S3)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const fileName = `${Date.now()}-${file.name}`
    const filePath = join(uploadDir, fileName)

    await writeFile(filePath, buffer)
    const fileUrl = `/uploads/${fileName}`

    // Save to database
    const dataset = await prisma.dataset.create({
      data: {
        projectId,
        name: file.name,
        technique: parsedData.technique,
        instrument: parsedData.instrument,
        fileFormat: file.name.split('.').pop() || 'unknown',
        originalFilename: file.name,
        fileUrl,
        parsedData: parsedData as any,
        metadata: parsedData.metadata as any,
        rowCount: parsedData.data.rows.length,
        columnCount: parsedData.data.columns.length,
        fileSize: BigInt(file.size),
      },
    })

    return NextResponse.json({
      dataset: {
        ...dataset,
        fileSize: dataset.fileSize?.toString() || null, // Convert BigInt to string for JSON
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Upload error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}
