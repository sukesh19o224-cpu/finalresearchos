import { prisma } from '@/lib/prisma'

export interface ChatMessageInput {
  projectId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens?: number
  metadata?: any
}

export const chatMemoryService = {
  /**
   * Save a new chat message to the database
   */
  async saveMessage(input: ChatMessageInput) {
    return await prisma.chatMessage.create({
      data: {
        projectId: input.projectId,
        role: input.role,
        content: input.content,
        tokens: input.tokens,
        metadata: input.metadata
      }
    })
  },

  /**
   * Get recent messages for a project (for context window)
   * Returns messages in descending order (newest first)
   */
  async getRecentMessages(projectId: string, limit: number = 20) {
    return await prisma.chatMessage.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        role: true,
        content: true,
        createdAt: true,
        tokens: true
      }
    })
  },

  /**
   * Get all messages for a project (for history display)
   */
  async getAllMessages(projectId: string, limit: number = 100) {
    return await prisma.chatMessage.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true
      }
    })
  },

  /**
   * Get or retrieve the conversation summary for a project
   */
  async getProjectSummary(projectId: string) {
    return await prisma.chatSummary.findUnique({
      where: { projectId }
    })
  },

  /**
   * Update or create conversation summary
   */
  async updateSummary(projectId: string, summary: string, messageCount: number) {
    return await prisma.chatSummary.upsert({
      where: { projectId },
      create: {
        projectId,
        summary,
        messageCount,
        lastSummarizedAt: new Date()
      },
      update: {
        summary,
        messageCount,
        lastSummarizedAt: new Date()
      }
    })
  },

  /**
   * Get total message count for a project
   */
  async getMessageCount(projectId: string) {
    return await prisma.chatMessage.count({
      where: { projectId }
    })
  },

  /**
   * Delete old messages, keeping only the most recent N
   */
  async pruneOldMessages(projectId: string, keepLast: number = 50) {
    const messages = await prisma.chatMessage.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      skip: keepLast,
      select: { id: true }
    })

    if (messages.length > 0) {
      await prisma.chatMessage.deleteMany({
        where: {
          id: { in: messages.map((m: any) => m.id) }
        }
      })
    }

    return messages.length
  },

  /**
   * Clear all chat messages for a project
   */
  async clearProjectChat(projectId: string) {
    await prisma.chatMessage.deleteMany({
      where: { projectId }
    })

    await prisma.chatSummary.delete({
      where: { projectId }
    }).catch(() => {}) // Ignore if doesn't exist

    return true
  }
}
