'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/context/ChatContext'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/utils/supabase'
import { Send, Users, LogOut, MessageSquare, Image as ImageIcon, Smile, Gift, X, Loader2, Sticker as StickerIcon } from 'lucide-react'
import EmojiPicker, { Theme } from 'emoji-picker-react'

const STICKERS = [
  { id: 'cat-1', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKMGpxx32LJAuS4/giphy.gif' },
  { id: 'cat-2', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l41lTfuxV5w5eP5W8/giphy.gif' },
  { id: 'cat-3', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKVUn7iM8FMEU24/giphy.gif' },
  { id: 'rabbit-1', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKRnK8X8fO9o6wE/giphy.gif' },
  { id: 'rabbit-2', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKMGpxx32LJAuS4/giphy.gif' },
  { id: 'cool-dog', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKovvW3T6u8yJSU/giphy.gif' },
  { id: 'heart-1', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKVUn7iM8FMEU24/giphy.gif' },
  { id: 'party', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l41lTfuxV5w5eP5W8/giphy.gif' },
]

export default function ChatScreen() {
  const { messages, sendMessage, leaveChat, onlineUsers, roomId } = useChat()
  const { user, profile } = useAuth()
  const [text, setText] = useState('')
  const [isEmojiOpen, setIsEmojiOpen] = useState(false)
  const [isStickerOpen, setIsStickerOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

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
    setIsEmojiOpen(false)
    await sendMessage(content)
  }

  const onEmojiClick = (emojiData: any) => {
    setText((prev) => prev + emojiData.emoji)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !roomId || !user) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${roomId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(fileName)

      await sendMessage('Sent an image', 'image', publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Make sure you created the "chat-media" bucket in Supabase and set it to Public.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleStickerSend = async (url: string) => {
    await sendMessage('Sent a sticker', 'sticker', url)
    setIsStickerOpen(false)
  }

  return (
    <div className="w-full max-w-4xl h-[85vh] glass-card flex flex-col overflow-hidden relative">
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
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
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
                  className={`max-w-[70%] group relative ${
                    msg.message_type === 'text' 
                      ? (isMe ? 'bg-accent text-accent-foreground rounded-2xl rounded-tr-none px-4 py-2' : 'bg-white/10 text-white rounded-2xl rounded-tl-none px-4 py-2')
                      : 'p-1'
                  }`}
                >
                  {msg.message_type === 'text' && (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                  
                  {msg.message_type === 'image' && (
                    <div className="rounded-xl overflow-hidden shadow-xl border border-white/10">
                      <img 
                        src={msg.media_url} 
                        alt="Shared image" 
                        className="max-w-full max-h-[300px] object-contain bg-black/20"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {(msg.message_type === 'gif' || msg.message_type === 'sticker') && (
                    <div className="rounded-xl overflow-hidden">
                      <img 
                        src={msg.media_url} 
                        alt="Sticker" 
                        className="max-w-full max-h-[180px] object-contain transition-transform hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                  )}
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
      <div className="p-4 border-t border-white/10 bg-white/5 relative">
        {/* Emoji Picker */}
        {isEmojiOpen && (
          <div className="absolute bottom-full right-4 mb-2 z-50">
            <div className="relative">
               <button 
                onClick={() => setIsEmojiOpen(false)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 z-[60] shadow-lg hover:bg-red-600 transition-colors"
               >
                 <X size={14} />
               </button>
               <EmojiPicker 
                onEmojiClick={onEmojiClick}
                theme={Theme.DARK}
                lazyLoadEmojis={true}
                searchDisabled={true}
                skinTonesDisabled={true}
               />
            </div>
          </div>
        )}

        {/* Sticker Picker */}
        {isStickerOpen && (
          <div className="absolute bottom-full left-4 mb-2 z-50 w-72 h-80 glass-card p-4 flex flex-col shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm">Stickers</h4>
              <button 
                onClick={() => setIsStickerOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pr-1">
              {STICKERS.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => handleStickerSend(sticker.url)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all transform hover:scale-110 active:scale-95"
                >
                  <img src={sticker.url} alt={sticker.id} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2.5 text-slate-400 hover:text-accent hover:bg-white/5 rounded-xl transition-all"
            title="Upload Image"
          >
            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
          </button>

          <button
            onClick={() => {
              setIsStickerOpen(!isStickerOpen)
              setIsEmojiOpen(false)
            }}
            className={`p-2.5 rounded-xl transition-all ${isStickerOpen ? 'text-accent bg-accent/10' : 'text-slate-400 hover:text-accent hover:bg-white/5'}`}
            title="Stickers"
          >
            <StickerIcon size={20} />
          </button>

          <button
            onClick={() => {
              setIsEmojiOpen(!isEmojiOpen)
              setIsStickerOpen(false)
            }}
            className={`p-2.5 rounded-xl transition-all ${isEmojiOpen ? 'text-accent bg-accent/10' : 'text-slate-400 hover:text-accent hover:bg-white/5'}`}
            title="Emoji"
          >
            <Smile size={20} />
          </button>


          <form 
            onSubmit={handleSend}
            className="flex-1 flex items-center gap-2"
          >
            <div className="relative flex-1">
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
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
