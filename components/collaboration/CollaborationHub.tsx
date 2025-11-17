'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Eye,
  Edit,
  Crown,
  X,
  Check,
  Clock,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Collaborator {
  id: string
  name: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  status: 'active' | 'pending' | 'inactive'
  joinedAt?: string
  lastActive?: string
}

const roleIcons = {
  owner: Crown,
  editor: Edit,
  viewer: Eye,
}

const roleColors = {
  owner: 'bg-yellow-100 text-yellow-800',
  editor: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-800',
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-orange-100 text-orange-800',
  inactive: 'bg-gray-100 text-gray-800',
}

export function CollaborationHub({ projectId }: { projectId: string }) {
  // TODO: Fetch collaborators from API based on projectId
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer')
  const [isInviting, setIsInviting] = useState(false)

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'pending' as const,
    }

    setCollaborators([...collaborators, newCollaborator])
    setInviteEmail('')
    setIsInviting(false)
  }

  const updateRole = (id: string, newRole: 'owner' | 'editor' | 'viewer') => {
    setCollaborators(collaborators.map(c =>
      c.id === id ? { ...c, role: newRole } : c
    ))
  }

  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Collaborators
            </CardTitle>
            <CardDescription>
              {collaborators.length} member{collaborators.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Collaborator</DialogTitle>
                <DialogDescription>
                  Invite someone to collaborate on this project
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address</label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setInviteRole('editor')}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        inviteRole === 'editor'
                          ? 'border-blue-600 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Edit className="h-5 w-5" />
                        <span className="font-medium">Editor</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Can view, edit, and upload data
                      </p>
                    </button>

                    <button
                      onClick={() => setInviteRole('viewer')}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        inviteRole === 'viewer'
                          ? 'border-blue-600 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-5 w-5" />
                        <span className="font-medium">Viewer</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Can only view project data
                      </p>
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || isInviting}
                  className="w-full"
                >
                  {isInviting ? 'Sending invitation...' : 'Send Invitation'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {collaborators.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No collaborators yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Click "Invite" to add team members to this project
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {collaborators.map(collaborator => {
            const RoleIcon = roleIcons[collaborator.role]
            const isOwner = collaborator.role === 'owner'

            return (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                    {collaborator.name.charAt(0).toUpperCase()}
                  </Avatar>

                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {collaborator.name}
                      {isOwner && <Crown className="h-4 w-4 text-yellow-600" />}
                    </p>
                    <p className="text-sm text-gray-600">{collaborator.email}</p>
                    {collaborator.lastActive && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last active: {collaborator.lastActive}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={statusColors[collaborator.status]}>
                    {collaborator.status}
                  </Badge>

                  {!isOwner && (
                    <select
                      value={collaborator.role}
                      onChange={(e) => updateRole(collaborator.id, e.target.value as any)}
                      className="px-3 py-1.5 text-sm border rounded"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  )}

                  {!isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCollaborator(collaborator.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

          {/* Pending invitations */}
          {collaborators.some(c => c.status === 'pending') && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Invitations
              </h4>
              <div className="space-y-2">
                {collaborators
                  .filter(c => c.status === 'pending')
                  .map(collaborator => (
                    <div
                      key={collaborator.id}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{collaborator.email}</p>
                        <p className="text-xs text-gray-600">Invitation sent</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Resend
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        )}
      </CardContent>
    </Card>
  )
}
