'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, MessageSquare, Share2, UserPlus, Mail, Clock, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface Collaborator {
  id: string
  name: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  avatarUrl?: string
  lastActive: Date
  status: 'online' | 'offline'
}

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: Date
  resolved: boolean
}

interface CollaborationPanelProps {
  projectId: string
}

export function CollaborationPanel({ projectId }: CollaborationPanelProps) {
  const [collaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'You',
      email: 'you@research.edu',
      role: 'owner',
      lastActive: new Date(),
      status: 'online',
    },
  ])

  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const { toast } = useToast()

  const addComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      userId: '1',
      userName: 'You',
      content: newComment,
      createdAt: new Date(),
      resolved: false,
    }

    setComments([comment, ...comments])
    setNewComment('')

    toast({
      title: 'Comment added',
      description: 'Your comment has been posted.',
    })
  }

  const inviteCollaborator = () => {
    if (!inviteEmail.trim()) return

    toast({
      title: 'Invitation sent',
      description: `An invitation has been sent to ${inviteEmail}`,
    })

    setInviteEmail('')
  }

  const toggleResolve = (commentId: string) => {
    setComments(
      comments.map((c) =>
        c.id === commentId ? { ...c, resolved: !c.resolved } : c
      )
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Collaboration
        </CardTitle>
        <CardDescription>
          Work together with your team in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="team">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-4">
            {/* Invite Section */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Invite Collaborators</p>
              <div className="flex space-x-2">
                <Input
                  placeholder="colleague@university.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && inviteCollaborator()}
                />
                <Button onClick={inviteCollaborator}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Team Members ({collaborators.length})</p>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {collaborators.map((collab) => (
                    <div
                      key={collab.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {collab.name.charAt(0)}
                          </div>
                          {collab.status === 'online' && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{collab.name}</p>
                          <p className="text-xs text-gray-500">{collab.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {collab.role}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {collab.status === 'online' ? 'Active now' : formatDate(collab.lastActive)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Share Link */}
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Copy Share Link
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {/* Add Comment */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Add Comment</p>
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addComment()}
                />
                <Button onClick={addComment}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No comments yet</p>
                    <p className="text-xs mt-1">Start a discussion with your team</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3 border rounded-lg ${
                        comment.resolved ? 'bg-gray-50 opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                            {comment.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{comment.userName}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleResolve(comment.id)}
                        >
                          {comment.resolved ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      {comment.resolved && (
                        <p className="text-xs text-green-600 mt-2">✓ Resolved</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
