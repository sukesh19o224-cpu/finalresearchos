import { chatMemoryService } from './chat-memory'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

/**
 * Run maintenance tasks for project chat
 * - Prune old messages
 * - Refresh summary if needed
 */
export async function runChatMaintenance(projectId: string) {
  try {
    // Prune old messages (keep last 50)
    const pruned = await chatMemoryService.pruneOldMessages(projectId, 50)
    
    // Check if summary needs refresh
    const messageCount = await chatMemoryService.getMessageCount(projectId)
    const summary = await chatMemoryService.getProjectSummary(projectId)
    
    // Re-summarize if no summary exists or too many new messages
    if (!summary || messageCount - summary.messageCount > 20) {
      await summarizeConversation(projectId)
    }

    return { pruned, messageCount }
  } catch (error) {
    console.error('Chat maintenance error:', error)
    return { pruned: 0, messageCount: 0 }
  }
}

/**
 * Generate a summary of the conversation history
 */
export async function summarizeConversation(projectId: string) {
  try {
    // Get last 50 messages for summarization
    const messages = await chatMemoryService.getRecentMessages(projectId, 50)
    
    if (messages.length < 5) {
      return null // Not enough messages to summarize
    }

    // Reverse to chronological order
    messages.reverse()

    // Build conversation text
    const conversationText = messages.map((m: any) => 
      `${m.role}: ${m.content}`
    ).join('\n')

    // Call Groq to summarize
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{
          role: 'user',
          content: `Summarize this research conversation in 3-4 sentences, focusing on key findings, decisions, and next steps:\n\n${conversationText}`
        }],
        temperature: 0.3,
        max_tokens: 256
      })
    })

    if (!response.ok) {
      console.error('Summarization failed:', response.statusText)
      return null
    }

    const data = await response.json()
    const summaryText = data.choices[0]?.message?.content

    if (summaryText) {
      await chatMemoryService.updateSummary(
        projectId,
        summaryText,
        messages.length
      )
      return summaryText
    }

    return null
  } catch (error) {
    console.error('Summarization error:', error)
    return null
  }
}
