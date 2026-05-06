'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { useAuth } from './AuthContext'

type Message = {
  id: string
  created_at: string
  content: string
  user_name: string
  user_id: string
  message_type: 'text' | 'image' | 'gif' | 'sticker'
  media_url?: string
}

type ChatContextType = {
  roomId: string | null
  messages: Message[]
  isSearching: boolean
  joinChat: () => Promise<void>
  leaveChat: () => Promise<void>
  sendMessage: (content: string, type?: 'text' | 'image' | 'gif' | 'sticker', mediaUrl?: string) => Promise<void>
  onlineUsers: any[]
}


const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const { user, profile } = useAuth()
  const supabase = createClient()

  // Subscribe to messages when roomId changes
  useEffect(() => {
    if (!roomId) return

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
    }

    fetchMessages()

    // Subscribe to new messages
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
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    // Presence setup
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
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('join', key, newPresences)
      })
      .on('presence', { event: 'leave' }, async ({ key, leftPresences }) => {
        console.log('leave', key, leftPresences)
        // If someone leaves, we could decrement member_count in DB here
        // But it's better to do it via a more robust method or just rely on the count of onlineUsers
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user?.id,
            user_name: profile?.display_name || 'Guest',
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(presenceChannel)
    }
  }, [roomId, user, profile, supabase])

  const joinChat = async () => {
    if (!user) return
    setIsSearching(true)

    try {
      const { data: selectedRoomId, error } = await supabase.rpc('join_available_room', {
        user_id: user.id
      })

      if (error) throw error
      if (selectedRoomId) {
        setRoomId(selectedRoomId)
      }
    } catch (error) {
      console.error('Error joining chat:', error)
    } finally {
      setIsSearching(false)
    }
  }


  const leaveChat = async () => {
    if (!roomId || !user) return

    try {
      // Decrement member_count
      const { data: room } = await supabase
        .from('rooms')
        .select('member_count')
        .eq('id', roomId)
        .single()

      if (room) {
        const newCount = Math.max(0, room.member_count - 1)
        await supabase
          .from('rooms')
          .update({ 
            member_count: newCount,
            status: newCount === 0 ? 'inactive' : 'active'
          })
          .eq('id', roomId)
      }


      setRoomId(null)
      setMessages([])
    } catch (error) {
      console.error('Error leaving chat:', error)
    }
  }

  const sendMessage = async (content: string, type: 'text' | 'image' | 'gif' | 'sticker' = 'text', mediaUrl?: string) => {
    if (!roomId || !user) return

    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      user_id: user.id,
      user_name: profile?.display_name || 'Guest',
      content: content,
      message_type: type,
      media_url: mediaUrl
    })

    if (error) throw error
  }


  return (
    <ChatContext.Provider value={{ roomId, messages, isSearching, joinChat, leaveChat, sendMessage, onlineUsers }}>
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
