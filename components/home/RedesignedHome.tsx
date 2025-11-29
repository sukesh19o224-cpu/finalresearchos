'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  FolderOpen,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import { ResearchAIChat } from '@/components/ai/ResearchAIChat'

// Redesigned Home Page - Only 3 main actions
export function RedesignedHome() {
  const router = useRouter()
  const [showAIChat, setShowAIChat] = useState(false)

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">ResearchOS Research Platform</h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered electrochemistry research management
        </p>
      </div>

      {/* 3 Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
        {/* Create New Project */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-8 text-center" onClick={() => router.push('/projects/new')}>
            <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <Plus className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Create New Project</h2>
            <p className="text-gray-600 text-sm">
              Start from templates or create custom project
            </p>
          </CardContent>
        </Card>

        {/* All Projects */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-8 text-center" onClick={() => router.push('/projects')}>
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
              <FolderOpen className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">All Projects</h2>
            <p className="text-gray-600 text-sm">
              View and manage all your research projects
            </p>
          </CardContent>
        </Card>

        {/* Chat With AI */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-8 text-center" onClick={() => setShowAIChat(true)}>
            <div className="h-20 w-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
              <MessageSquare className="h-10 w-10 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Chat With Your Research AI</h2>
            <p className="text-gray-600 text-sm flex items-center justify-center gap-1">
              <Sparkles className="h-4 w-4" />
              Powered by Groq Llama 3.1 8B
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Chat Modal */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Research AI Assistant</h2>
              <Button variant="ghost" onClick={() => setShowAIChat(false)}>
                Close
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ResearchAIChat fullScreen />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
