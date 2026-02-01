'use client'

import { useEffect, useState } from 'react'
import { FolderPlus, Trash2, FolderOpen } from 'lucide-react'
import { useFileManagerStore } from '@/lib/stores/fileManagerStore'
import { FolderItem } from './FolderItem'
import { FileItem } from './FileItem'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface FileManagerSectionProps {
  projectId: string
}

export function FileManagerSection({ projectId }: FileManagerSectionProps) {
  const {
    nodes,
    selectedNodeId,
    setProjectId,
    setNodes,
    createFolder,
    deleteNode,
    isLoading,
  } = useFileManagerStore()
  
  const [showFolderDialog, setShowFolderDialog] = useState(false)
  const [folderName, setFolderName] = useState('')
  
  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null
  
  useEffect(() => {
    setProjectId(projectId)
    fetchFiles()
  }, [projectId])
  
  const fetchFiles = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/files`)
      if (res.ok) {
        const files = await res.json()
        setNodes(files)
      }
    } catch (error) {
      console.error('Failed to fetch files:', error)
    }
  }
  
  const handleCreateFolder = async () => {
    if (!folderName.trim()) return
    
    const parentId = selectedNode?.type === 'folder' ? selectedNode.id : null
    await createFolder(folderName.trim(), parentId)
    setFolderName('')
    setShowFolderDialog(false)
    // Refetch files to show the newly created folder
    await fetchFiles()
  }
  
  const handleDelete = async () => {
    if (!selectedNodeId) return
    
    const node = nodes[selectedNodeId]
    if (!node) return
    
    const children = Object.values(nodes).filter(n => n.parentId === selectedNodeId)
    const message = node.type === 'folder' && children.length > 0
      ? `Delete "${node.name}" and all ${children.length} item(s) inside?`
      : `Delete "${node.name}"?`
    
    if (confirm(message)) {
      await deleteNode(selectedNodeId)
      // Refetch files to update the display
      await fetchFiles()
    }
  }
  
  // Get root items
  const rootItems = Object.values(nodes).filter(node => !node.parentId)
  const rootFolders = rootItems.filter(n => n.type === 'folder').sort((a, b) => a.name.localeCompare(b.name))
  const rootFiles = rootItems.filter(n => n.type === 'file').sort((a, b) => a.name.localeCompare(b.name))
  
  return (
    <div className="border-t mt-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Files</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowFolderDialog(true)}
            className="p-1.5 hover:bg-gray-200 rounded"
            title="Create folder"
          >
            <FolderPlus className="h-4 w-4 text-gray-700" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedNodeId}
            title="Delete selected"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>
      
      {/* Tree View */}
      <div className="p-2 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8 text-sm text-gray-500">Loading...</div>
        ) : rootFolders.length === 0 && rootFiles.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No files yet</p>
            <p className="text-xs text-gray-400 mt-1">Create a folder to get started</p>
          </div>
        ) : (
          <>
            {rootFolders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder as any}
                depth={0}
              />
            ))}
            {rootFiles.map((file) => (
              <FileItem
                key={file.id}
                file={file as any}
                depth={0}
              />
            ))}
          </>
        )}
      </div>
      
      {/* Create Folder Dialog */}
      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
            <DialogDescription>
              {selectedNode?.type === 'folder'
                ? `Create a subfolder inside "${selectedNode.name}"`
                : 'Create a new folder'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
