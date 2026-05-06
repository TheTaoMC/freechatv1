'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/context/ChatContext'
import { useAuth } from '@/context/AuthContext'
import { Send, Users, LogOut, MessageSquare } from 'lucide-react'

export default function ChatScreen() {
  const { messages, sendMessage, leaveChat, onlineUsers } = useChat()
  const { user } = useAuth()
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const content = text
    setText('')
    await sendMessage(content)
  }

  return (
    <div className="w-full max-w-4xl h-[80vh] glass-card flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-bold">Group Chat</h3>
            <p className="text-xs text-slate-400">
              {onlineUsers.length} people online
            </p>
          </div>
        </div>
        <button
          onClick={leaveChat}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut size={16} />
          Leave
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="p-4 bg-white/5 rounded-full">
              <MessageSquare size={32} />
            </div>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.user_id === user?.id
            return (
              <div
                key={msg.id || i}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-xs font-medium text-slate-400 mb-1 ml-1">
                    {msg.user_name}
                  </span>
                )}
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    isMe
                      ? 'bg-accent text-accent-foreground rounded-tr-none'
                      : 'bg-white/10 text-white rounded-tl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 mx-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSend}
        className="p-4 border-t border-white/10 bg-white/5"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="absolute right-2 p-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}
