'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase'
import { useAuth } from './AuthContext'
import { getAvatarUrl } from '@/components/AvatarPicker'


type Reaction = {
  id: string
  message_id: number
  user_id: string
  emoji: string
}

type Message = {
  id: string
  created_at: string
  content: string
  user_name: string
  user_id: string
  message_type: 'text' | 'image' | 'gif' | 'sticker'
  media_url?: string
  reply_to_id?: number
  reply_to_content?: string
  reply_to_name?: string
  reactions?: Reaction[]
}

type ChatContextType = {
  roomId: string | null
  messages: Message[]
  isSearching: boolean
  joinChat: () => Promise<void>
  leaveChat: () => Promise<void>
  sendMessage: (content: string, type?: 'text' | 'image' | 'gif' | 'sticker', mediaUrl?: string, replyTo?: { id: number, content: string, name: string }) => Promise<void>
  onlineUsers: any[]
  typingUsers: Record<string, string>
  setTypingStatus: (isTyping: boolean) => void
  createPrivateRoom: () => Promise<void>
  joinPrivateRoom: (id: string) => Promise<void>
  addReaction: (messageId: number, emoji: string) => Promise<void>
  removeReaction: (messageId: number, emoji: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({})
  const [isSearching, setIsSearching] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const { user, profile } = useAuth()
  const supabase = createClient()
  const channelRef = useRef<any>(null)
  const typingTimeoutRef = useRef<any>(null)

  const setTypingStatus = (isTyping: boolean) => {
    if (!roomId || !user || !channelRef.current) return

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, userName: profile?.display_name || 'Guest', isTyping }
    })

    if (isTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(false)
      }, 3000)
    }
  }

  useEffect(() => {
    if (!roomId) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, reactions:message_reactions(*)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
    }

    fetchMessages()

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, { ...payload.new, reactions: [] } as any as Message])
        }
      )
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setTypingUsers((prev) => {
          const next = { ...prev }
          if (payload.isTyping) {
            next[payload.userId] = payload.userName
          } else {
            delete next[payload.userId]
          }
          return next
        })
      })
      .subscribe()
    
    channelRef.current = channel

    const reactionChannel = supabase
      .channel(`reactions:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        () => {
          fetchMessages()
        }
      )
      .subscribe()

    const presenceChannel = supabase.channel(`presence:${roomId}`, {
        config: {
            presence: {
                key: user?.id,
            },
        },
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const users = Object.values(state).flat()
        setOnlineUsers(users)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user?.id,
            user_name: profile?.display_name || 'Guest',
            avatar_url: profile?.avatar_config ? getAvatarUrl(profile.avatar_config) : profile?.avatar_url,
            online_at: new Date().toISOString(),
            last_read_id: messages.length > 0 ? messages[messages.length - 1].id : null
          })
        }
      })

    if (profile && presenceChannel) {
      presenceChannel.track({
        user_id: user?.id,
        user_name: profile?.display_name || 'Guest',
        avatar_url: profile?.avatar_config ? getAvatarUrl(profile.avatar_config) : profile?.avatar_url,
        online_at: new Date().toISOString(),
        last_read_id: messages.length > 0 ? messages[messages.length - 1].id : null
      })
    }
    
    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(reactionChannel)
      supabase.removeChannel(presenceChannel)
    }
  }, [roomId, user, profile, supabase])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomId) {
        const currentCount = onlineUsers.length
        const newCount = Math.max(0, currentCount - 1)
        supabase
          .from('rooms')
          .update({ 
            member_count: newCount,
            status: newCount === 0 ? 'inactive' : 'active'
          })
          .eq('id', roomId)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [roomId, onlineUsers, supabase])

  const joinChat = async () => {
    if (!user) return
    setIsSearching(true)
    try {
      const { data: selectedRoomId, error } = await supabase.rpc('join_available_room', {
        user_id: user.id
      })
      if (error) throw error
      if (selectedRoomId) setRoomId(selectedRoomId)
    } catch (error) {
      console.error('Error joining chat:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const leaveChat = async () => {
    if (!roomId || !user) return
    try {
      const currentCount = onlineUsers.length
      const newCount = Math.max(0, currentCount - 1)
      await supabase
        .from('rooms')
        .update({ 
          member_count: newCount,
          status: newCount === 0 ? 'inactive' : 'active'
        })
        .eq('id', roomId)
      setRoomId(null)
      setMessages([])
    } catch (error) {
      console.error('Error leaving chat:', error)
    }
  }

  const sendMessage = async (content: string, type: 'text' | 'image' | 'gif' | 'sticker' = 'text', mediaUrl?: string, replyTo?: { id: number, content: string, name: string }) => {
    if (!roomId || !user) return
    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      user_id: user.id,
      user_name: profile?.display_name || 'Guest',
      content: content,
      message_type: type,
      media_url: mediaUrl,
      reply_to_id: replyTo?.id,
      reply_to_content: replyTo?.content,
      reply_to_name: replyTo?.name
    })
    if (error) throw error
  }

  const createPrivateRoom = async () => {
    if (!user) return
    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          member_count: 1,
          status: 'active',
          is_private: true,
          created_by: user.id
        })
        .select()
        .single()
      if (error) throw error
      if (data) setRoomId(data.id)
    } catch (error) {
      console.error('Error creating private room:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const joinPrivateRoom = async (id: string) => {
    if (!user) return
    setIsSearching(true)
    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .single()
      if (roomError || !room) throw new Error('Room not found')
      if (room.member_count >= 5) throw new Error('Room is full')
      await supabase
        .from('rooms')
        .update({ member_count: room.member_count + 1 })
        .eq('id', id)
      setRoomId(id)
    } catch (error) {
      console.error('Error joining private room:', error)
      alert((error as any).message)
    } finally {
      setIsSearching(false)
    }
  }

  const addReaction = async (messageId: number, emoji: string) => {
    if (!user) return
    await supabase.from('message_reactions').upsert({
      message_id: messageId,
      user_id: user.id,
      emoji: emoji
    })
  }

  const removeReaction = async (messageId: number, emoji: string) => {
    if (!user) return
    await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
  }

  return (
    <ChatContext.Provider value={{ 
      roomId, messages, isSearching, joinChat, leaveChat, sendMessage, 
      onlineUsers, typingUsers, setTypingStatus,
      createPrivateRoom, joinPrivateRoom, addReaction, removeReaction 
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
