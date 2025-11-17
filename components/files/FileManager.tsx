'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Folder,
  FolderPlus,
  Trash2,
  Edit,
  MoreVertical,
  Home,
  FileText,
  Image as ImageIcon,
  FileCode,
  ArrowLeft,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  createdAt: Date
  children: FileNode[]
}

interface FileManagerProps {
  projectId: string
}

// Initialize with some sample folders
const createInitialStructure = (): FileNode[] => [
  {
    id: '1',
    name: 'Experiments',
    type: 'folder',
    createdAt: new Date(),
    children: [],
  },
  {
    id: '2',
    name: 'Analysis',
    type: 'folder',
    createdAt: new Date(),
    children: [],
  },
  {
    id: '3',
    name: 'Documentation',
    type: 'folder',
    createdAt: new Date(),
    children: [],
  },
]

export function FileManager({ projectId }: FileManagerProps) {
  const [fileSystem, setFileSystem] = useState<FileNode[]>(createInitialStructure())
  const [currentPath, setCurrentPath] = useState<number[]>([])
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const { toast } = useToast()

  // Get current folder based on path
  const getCurrentFolder = (): FileNode[] => {
    let current = fileSystem
    for (const index of currentPath) {
      if (current[index] && current[index].type === 'folder') {
        current = current[index].children
      }
    }
    return current
  }

  const getCurrentFolderName = (): string => {
    if (currentPath.length === 0) return 'Project Root'
    let current = fileSystem
    let name = ''
    for (const index of currentPath) {
      name = current[index].name
      current = current[index].children
    }
    return name
  }

  const createFolder = () => {
    if (!newFolderName.trim()) return

    const newFolder: FileNode = {
      id: Date.now().toString(),
      name: newFolderName,
      type: 'folder',
      createdAt: new Date(),
      children: [],
    }

    const newFileSystem = [...fileSystem]
    let current = newFileSystem
    for (const index of currentPath) {
      current = current[index].children
    }
    current.push(newFolder)

    setFileSystem(newFileSystem)
    setNewFolderName('')
    setIsCreatingFolder(false)

    toast({
      title: 'Folder created',
      description: `"${newFolderName}" has been created successfully.`,
    })
  }

  const deleteItem = (itemIndex: number) => {
    const items = getCurrentFolder()
    const itemName = items[itemIndex].name

    if (!confirm(`Delete "${itemName}"?`)) return

    const newFileSystem = [...fileSystem]
    let current = newFileSystem
    for (const index of currentPath) {
      current = current[index].children
    }
    current.splice(itemIndex, 1)

    setFileSystem(newFileSystem)

    toast({
      title: 'Deleted',
      description: `"${itemName}" has been deleted.`,
    })
  }

  const renameItem = (itemIndex: number) => {
    const items = getCurrentFolder()
    const currentName = items[itemIndex].name
    const newName = prompt(`Rename "${currentName}" to:`, currentName)

    if (!newName || newName === currentName) return

    const newFileSystem = [...fileSystem]
    let current = newFileSystem
    for (const index of currentPath) {
      current = current[index].children
    }
    current[itemIndex].name = newName

    setFileSystem(newFileSystem)

    toast({
      title: 'Renamed',
      description: `Renamed to "${newName}"`,
    })
  }

  const openFolder = (itemIndex: number) => {
    setCurrentPath([...currentPath, itemIndex])
  }

  const goBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1))
    }
  }

  const goToRoot = () => {
    setCurrentPath([])
  }

  const getFileIcon = (file: FileNode) => {
    if (file.type === 'folder') return Folder
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext || '')) return ImageIcon
    if (['js', 'ts', 'tsx', 'jsx', 'py', 'css'].includes(ext || '')) return FileCode
    return FileText
  }

  const currentItems = getCurrentFolder()

  return (
    <div className="relative h-[600px] border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="p-3 border-b flex items-center justify-between bg-gray-50">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={goBack}
            disabled={currentPath.length === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={goToRoot}
            disabled={currentPath.length === 0}
          >
            <Home className="h-4 w-4" />
          </Button>
          <div className="px-3 py-1 bg-white border rounded text-sm font-medium">
            {getCurrentFolderName()}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => setIsCreatingFolder(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {/* New Folder Input */}
      {isCreatingFolder && (
        <div className="p-3 border-b bg-blue-50">
          <div className="flex items-center space-x-2">
            <Folder className="h-5 w-5 text-blue-600" />
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') createFolder()
                if (e.key === 'Escape') {
                  setIsCreatingFolder(false)
                  setNewFolderName('')
                }
              }}
              autoFocus
              className="max-w-xs"
            />
            <Button size="sm" onClick={createFolder}>
              Create
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsCreatingFolder(false)
                setNewFolderName('')
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* File List */}
      <ScrollArea className="h-[calc(100%-120px)]">
        <div className="p-4">
          {currentItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Folder className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">This folder is empty</p>
              <p className="text-sm mt-1">Create a new folder to get started</p>
            </div>
          ) : (
            <div className="grid gap-1">
              {currentItems.map((item, index) => {
                const Icon = getFileIcon(item)
                return (
                  <div
                    key={item.id}
                    className="flex items-center p-3 rounded hover:bg-gray-100 cursor-pointer group"
                    onDoubleClick={() => {
                      if (item.type === 'folder') {
                        openFolder(index)
                      }
                    }}
                  >
                    <Icon
                      className={`h-6 w-6 mr-3 ${
                        item.type === 'folder' ? 'text-blue-500' : 'text-gray-600'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.type === 'folder' ? 'Folder' : 'File'} •{' '}
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {item.type === 'folder' && (
                          <DropdownMenuItem onClick={() => openFolder(index)}>
                            <Folder className="h-4 w-4 mr-2" />
                            Open
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => renameItem(index)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteItem(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-2 border-t bg-gray-50 text-xs text-gray-600">
        {currentItems.length} {currentItems.length === 1 ? 'item' : 'items'}
      </div>
    </div>
  )
}
