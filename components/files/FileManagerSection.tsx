'use client'

import { useEffect, useRef, useState } from 'react'
import { Tree, NodeRendererProps, CreateHandler, RenameHandler, DeleteHandler, MoveHandler, TreeApi } from 'react-arborist'
import { FolderPlus, FilePlus, FolderOpen, Folder, FileText, FileImage, FileSpreadsheet, Download, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import { useFileManagerStore, TreeNode } from '@/lib/stores/fileManagerStore'
import { AnimatedTooltip } from '@/components/ui/animated-tooltip'

interface FileManagerSectionProps {
  projectId: string
  isCollapsed?: boolean
}

// -- Icon helpers --
const FILE_ICON_MAP: Record<string, { icon: typeof FileText; color: string }> = {
  pdf: { icon: FileText, color: 'text-red-500' },
  doc: { icon: FileText, color: 'text-blue-500' },
  docx: { icon: FileText, color: 'text-blue-500' },
  txt: { icon: FileText, color: 'text-gray-500' },
  png: { icon: FileImage, color: 'text-purple-500' },
  jpg: { icon: FileImage, color: 'text-purple-500' },
  jpeg: { icon: FileImage, color: 'text-purple-500' },
  gif: { icon: FileImage, color: 'text-purple-500' },
  svg: { icon: FileImage, color: 'text-purple-500' },
  xlsx: { icon: FileSpreadsheet, color: 'text-green-500' },
  xls: { icon: FileSpreadsheet, color: 'text-green-500' },
  csv: { icon: FileSpreadsheet, color: 'text-green-500' },
}

function getFileIcon(ext: string) {
  const entry = FILE_ICON_MAP[ext?.toLowerCase()]
  if (entry) {
    const Icon = entry.icon
    return <Icon className={`h-4 w-4 flex-shrink-0 ${entry.color}`} />
  }
  return <FileText className="h-4 w-4 flex-shrink-0 text-gray-400" />
}

function formatSize(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// -- Types for react-arborist tree data --
type ArboristNode = {
  id: string
  name: string
  isFolder: boolean
  extension: string | null
  size: number | null
  url: string | null
  children?: ArboristNode[]
}

// Convert flat store nodes to nested tree for react-arborist
function buildTree(nodes: Record<string, TreeNode>): ArboristNode[] {
  const nodeList = Object.values(nodes)
  const map = new Map<string | null, ArboristNode[]>()

  for (const n of nodeList) {
    const pid = n.parentId || null
    if (!map.has(pid)) map.set(pid, [])
    map.get(pid)!.push({
      id: n.id,
      name: n.name,
      isFolder: n.type === 'folder',
      extension: n.type === 'file' ? n.extension : null,
      size: n.type === 'file' ? n.size : null,
      url: n.type === 'file' ? n.url : null,
    })
  }

  function attachChildren(parentId: string | null): ArboristNode[] {
    const items = map.get(parentId) || []
    items.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1
      if (!a.isFolder && b.isFolder) return 1
      return a.name.localeCompare(b.name)
    })
    for (const item of items) {
      if (item.isFolder) {
        item.children = attachChildren(item.id)
      }
    }
    return items
  }

  return attachChildren(null)
}

// -- Custom node renderer --
function FileNode({ node, style, dragHandle }: NodeRendererProps<ArboristNode>) {
  const data = node.data
  const isFolder = data.isFolder
  const { projectId, addFile } = useFileManagerStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !projectId) return

    const formData = new FormData()
    formData.append('folderId', node.id)
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/files/upload`, {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const uploadedFiles = await res.json()
        uploadedFiles.forEach((file: any) => addFile(file))
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div
      ref={dragHandle}
      style={style}
      className={`group flex items-center gap-1.5 px-2 py-0.5 rounded-md cursor-pointer text-sm select-none ${
        node.isSelected
          ? 'bg-blue-100 text-blue-900'
          : node.willReceiveDrop
          ? 'bg-blue-50 ring-1 ring-blue-300'
          : 'hover:bg-gray-100'
      }${node.isDragging ? ' opacity-40' : ''}`}
      onClick={(e) => node.handleClick(e)}
      onDoubleClick={() => {
        if (node.isEditing) return
        node.edit()
      }}
    >
      {/* Expand/collapse arrow for folders, spacer for files */}
      {isFolder ? (
        <button
          onClick={(e) => {
            e.stopPropagation()
            node.toggle()
          }}
          className="flex-shrink-0 p-0.5 hover:bg-gray-200 rounded"
        >
          {node.isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
          )}
        </button>
      ) : (
        <span className="w-[18px] flex-shrink-0" />
      )}

      {/* Icon */}
      {isFolder ? (
        node.isOpen ? (
          <FolderOpen className="h-4 w-4 flex-shrink-0 text-blue-500" />
        ) : (
          <Folder className="h-4 w-4 flex-shrink-0 text-blue-500" />
        )
      ) : (
        getFileIcon(data.extension || '')
      )}

      {/* Name / Edit input */}
      {node.isEditing ? (
        <input
          autoFocus
          defaultValue={data.name}
          className="flex-1 text-sm bg-white border border-blue-400 rounded px-1.5 py-0.5 outline-none min-w-0"
          onFocus={(e) => e.target.select()}
          onBlur={() => node.reset()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') node.reset()
            if (e.key === 'Enter') node.submit(e.currentTarget.value)
          }}
        />
      ) : (
        <>
          <span className="flex-1 truncate">{data.name}</span>

          {/* File size */}
          {!isFolder && data.size ? (
            <span className="text-[10px] text-gray-400 flex-shrink-0 group-hover:hidden">
              {formatSize(data.size)}
            </span>
          ) : null}

          {/* Hover actions */}
          <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
            {isFolder && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUploadClick(e)
                  }}
                  className="p-0.5 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600"
                  title="Upload files to this folder"
                >
                  <FilePlus className="h-3.5 w-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </>
            )}
            {!isFolder && data.url && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(data.url!, '_blank')
                }}
                className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                title="Download"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                node.tree.delete([node.id])
              }}
              className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// -- Main component --
export function FileManagerSection({ projectId, isCollapsed = false }: FileManagerSectionProps) {
  const {
    nodes,
    setProjectId,
    setNodes,
    addFile,
    isLoading,
  } = useFileManagerStore()

  const treeRef = useRef<TreeApi<ArboristNode> | null>(null)
  const rootFileInputRef = useRef<HTMLInputElement>(null)
  const treeContainerRef = useRef<HTMLDivElement>(null)
  const [treeWidth, setTreeWidth] = useState(240)
  const [dndRoot, setDndRoot] = useState<globalThis.Node | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Set dndRootElement to document.body so DnD works inside fixed sidebar
    setDndRoot(document.body)
  }, [])

  // Measure tree container width
  useEffect(() => {
    const el = treeContainerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTreeWidth(Math.floor(entry.contentRect.width))
      }
    })
    observer.observe(el)
    setTreeWidth(el.clientWidth)
    return () => observer.disconnect()
  }, [])

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

  const handleRootUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/files/upload`, {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const uploadedFiles = await res.json()
        uploadedFiles.forEach((file: any) => addFile(file))
      }
    } catch (error) {
      console.error('Root upload failed:', error)
    } finally {
      setUploading(false)
      if (rootFileInputRef.current) rootFileInputRef.current.value = ''
    }
  }

  const treeData = buildTree(nodes)

  const onCreate: CreateHandler<ArboristNode> = async ({ parentId, type }) => {
    const isFolder = type === 'internal'
    const name = isFolder ? 'New Folder' : 'New File'

    try {
      if (isFolder) {
        const res = await fetch(`/api/projects/${projectId}/files/folders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, parentId }),
        })
        if (res.ok) {
          const folder = await res.json()
          useFileManagerStore.getState().addFile(folder)
          if (parentId && treeRef.current) {
            treeRef.current.open(parentId)
          }
          return { id: folder.id, name: folder.name, isFolder: true, extension: null, size: null, url: null, children: [] }
        }
      }
    } catch (error) {
      console.error('Failed to create:', error)
    }
    return null
  }

  const onRename: RenameHandler<ArboristNode> = async ({ id, name }) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/files/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        useFileManagerStore.getState().updateNode(id, { name })
      }
    } catch (error) {
      console.error('Failed to rename:', error)
    }
  }

  const onMove: MoveHandler<ArboristNode> = async ({ dragIds, parentId }) => {
    for (const id of dragIds) {
      try {
        const res = await fetch(`/api/projects/${projectId}/files/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parentId: parentId || null }),
        })
        if (res.ok) {
          useFileManagerStore.getState().updateNode(id, { parentId: parentId || null } as any)
        }
      } catch (error) {
        console.error('Failed to move:', error)
      }
    }
    // Refetch to get the correct tree structure after move
    await fetchFiles()
  }

  const onDelete: DeleteHandler<ArboristNode> = async ({ ids }) => {
    for (const id of ids) {
      const node = nodes[id]
      if (!node) continue
      const children = Object.values(nodes).filter(n => n.parentId === id)
      const msg = node.type === 'folder' && children.length > 0
        ? `Delete "${node.name}" and all ${children.length} item(s) inside?`
        : `Delete "${node.name}"?`
      if (!confirm(msg)) continue
      await useFileManagerStore.getState().deleteNode(id)
    }
  }

  const handleCreateFolder = async () => {
    const tree = treeRef.current
    // If tree is not rendered (empty state), create folder directly via API
    if (!tree) {
      try {
        const res = await fetch(`/api/projects/${projectId}/files/folders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'New Folder', parentId: null }),
        })
        if (res.ok) {
          const folder = await res.json()
          useFileManagerStore.getState().addFile(folder)
        }
      } catch (error) {
        console.error('Failed to create folder:', error)
      }
      return
    }
    const selected = tree.selectedNodes[0]
    const parentId = selected?.data.isFolder ? selected.id : selected?.parent?.id || null
    tree.create({ type: 'internal', parentId, index: 0 })
  }

  // Collapsed view - just show an icon with tooltip
  if (isCollapsed) {
    const fileCount = Object.keys(nodes).length
    return (
      <div className="mb-2">
        <AnimatedTooltip 
          content={
            <div className="min-w-[200px]">
              <div className="font-semibold mb-1">Files</div>
              <div className="text-xs text-gray-300">
                {fileCount} {fileCount === 1 ? 'item' : 'items'}
              </div>
            </div>
          }
        >
          <button
            className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Files"
          >
            <FolderOpen className="h-5 w-5 text-blue-500" />
          </button>
        </AnimatedTooltip>
      </div>
    )
  }

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Files
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => rootFileInputRef.current?.click()}
            className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            title="Upload files"
            disabled={uploading}
          >
            <FilePlus className="h-4 w-4" />
          </button>
          <button
            onClick={handleCreateFolder}
            className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            title="New folder"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
          <input
            ref={rootFileInputRef}
            type="file"
            multiple
            onChange={handleRootUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Upload indicator */}
      {uploading && (
        <div className="text-xs text-blue-500 mb-2 text-center">Uploading...</div>
      )}

      {/* Tree */}
      {isLoading ? (
        <div className="text-center py-6 text-sm text-gray-400">Loading...</div>
      ) : treeData.length === 0 ? (
        <div className="text-center py-6">
          <FolderOpen className="h-10 w-10 text-gray-200 mx-auto mb-2" />
          <p className="text-xs text-gray-400">No files yet</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              onClick={() => rootFileInputRef.current?.click()}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              Upload files
            </button>
            <span className="text-xs text-gray-300">|</span>
            <button
              onClick={handleCreateFolder}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              Create a folder
            </button>
          </div>
        </div>
      ) : (
        <div ref={treeContainerRef} className="w-full">
        <Tree<ArboristNode>
          ref={treeRef}
          data={treeData}
          onCreate={onCreate}
          onRename={onRename}
          onMove={onMove}
          onDelete={onDelete}
          openByDefault={false}
          width={treeWidth}
          height={400}
          indent={16}
          rowHeight={30}
          className="react-arborist-tree"
          dndRootElement={dndRoot}
        >
          {FileNode}
        </Tree>
        </div>
      )}
    </div>
  )
}
