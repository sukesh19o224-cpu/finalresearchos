'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ProjectAIChatContextType {
  isOpen: boolean
  projectId: string | null
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
  setProjectId: (id: string) => void
}

const ProjectAIChatContext = createContext<ProjectAIChatContextType | undefined>(undefined)

export function ProjectAIChatProvider({ 
  children,
  projectId: initialProjectId 
}: { 
  children: ReactNode
  projectId?: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(initialProjectId || null)

  const openSidebar = () => setIsOpen(true)
  const closeSidebar = () => setIsOpen(false)
  const toggleSidebar = () => setIsOpen(prev => !prev)

  return (
    <ProjectAIChatContext.Provider
      value={{
        isOpen,
        projectId,
        openSidebar,
        closeSidebar,
        toggleSidebar,
        setProjectId,
      }}
    >
      {children}
    </ProjectAIChatContext.Provider>
  )
}

export function useProjectAIChat() {
  const context = useContext(ProjectAIChatContext)
  if (context === undefined) {
    throw new Error('useProjectAIChat must be used within a ProjectAIChatProvider')
  }
  return context
}
