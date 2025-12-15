import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    req: NextRequest,
    { params }: { params: { noteId: string } }
) {
    try {
        const { noteId } = params

        // Fetch blocks for this page/note
        const dbBlocks = await prisma.block.findMany({
            where: { pageId: noteId },
            orderBy: { position: 'asc' }
        })

        // Transform to frontend format
        const blocks = dbBlocks.map(b => ({
            id: b.id,
            header: (b.content as any)?.header || 'Untitled',
            content: (b.content as any)?.html || '',
            order: b.position
        }))

        return NextResponse.json({ blocks })
    } catch (error) {
        console.error('Error loading blocks:', error)
        return NextResponse.json(
            { error: 'Failed to load blocks' },
            { status: 500 }
        )
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { noteId: string } }
) {
    try {
        const { blocks } = await req.json()
        const { noteId } = params

        // In a real app, we would validate user ownership here

        // Update the page (note) with new blocks
        // Since we are storing blocks as a related model, we might need to upsert them
        // Or if we decided to store them as JSON in the Page model (if schema allowed), but schema has Block model.
        // The schema has Block model related to Page.
        // Strategy: Delete existing blocks for this page and recreate them (simplest for reordering)
        // OR update existing ones.
        // Given the complexity of reordering and potential ID conflicts, a transaction delete-create is often easiest for "save whole list"
        // BUT we want to preserve IDs if possible.

        // For this implementation, let's assume we are updating the 'blocks' relation.
        // However, the Block model in schema has 'content Json'.
        // The frontend sends HTML content. We can wrap it in JSON.

        // Transaction:
        // 1. Delete all blocks for this page
        // 2. Create new blocks

        await prisma.$transaction(async (tx) => {
            await tx.block.deleteMany({
                where: { pageId: noteId }
            })

            if (blocks && blocks.length > 0) {
                await tx.block.createMany({
                    data: blocks.map((block: any) => ({
                        id: block.id, // Use frontend ID if UUID, or let DB generate? Frontend generates UUIDs.
                        pageId: noteId,
                        type: 'text', // Default type
                        position: block.order,
                        content: { html: block.content, header: block.header }
                    }))
                })
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Save blocks error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
