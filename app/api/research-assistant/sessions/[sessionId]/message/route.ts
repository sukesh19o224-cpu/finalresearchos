import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(
    req: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { sessionId } = params
        const { role, content } = await req.json()

        console.log('Received message:', { sessionId, role, content })

        // Check if GROQ_API_KEY is set
        if (!GROQ_API_KEY) {
            console.error('GROQ_API_KEY is not set')
            return NextResponse.json({ 
                error: 'AI service not configured. Please set GROQ_API_KEY.' 
            }, { status: 500 })
        }

        // 1. Fetch current session
        const session = await prisma.aIConversation.findUnique({
            where: { id: sessionId }
        })

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        const currentMessages = session.messages as any[] || []

        // 2. Add user message
        const userMessage = {
            id: Date.now().toString(),
            role,
            content,
            createdAt: new Date().toISOString()
        }

        const updatedMessages = [...currentMessages, userMessage]

        // 3. Save user message to DB
        await prisma.aIConversation.update({
            where: { id: sessionId },
            data: { messages: updatedMessages }
        })

        // 4. Call LLM
        const systemMessage = `You are an expert research assistant. Help the user with their scientific research.`

        // Format messages for Groq
        const apiMessages = [
            { role: 'system', content: systemMessage },
            ...updatedMessages.map(m => ({ role: m.role, content: m.content }))
        ]

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: apiMessages,
                temperature: 0.7,
                max_tokens: 1024,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Groq API error:', response.status, errorText)
            throw new Error(`Failed to get AI response: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        const aiContent = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

        // 5. Add AI message
        const aiMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiContent,
            createdAt: new Date().toISOString()
        }

        const finalMessages = [...updatedMessages, aiMessage]

        // 6. Save AI message to DB
        await prisma.aIConversation.update({
            where: { id: sessionId },
            data: { messages: finalMessages }
        })

        return NextResponse.json(aiMessage)

    } catch (error) {
        console.error('Send message error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json({ 
            error: errorMessage,
            details: error instanceof Error ? error.stack : undefined 
        }, { status: 500 })
    }
}
