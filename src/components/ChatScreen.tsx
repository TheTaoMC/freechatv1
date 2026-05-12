'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/context/ChatContext'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/utils/supabase'
import { Send, Users, LogOut, MessageSquare, Image as ImageIcon, Smile, Gift, X, Loader2, Sticker as StickerIcon, Reply, Volume2, VolumeX, Copy, Check, Search } from 'lucide-react'
import EmojiPicker, { Theme } from 'emoji-picker-react'

const STICKERS = [
  { id: 'cat-1', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKMGpxx32LJAuS4/giphy.gif' },
  { id: 'cat-2', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l41lTfuxV5w5eP5W8/giphy.gif' },
  { id: 'cat-3', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKVUn7iM8FMEU24/giphy.gif' },
  { id: 'rabbit-1', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKRnK8X8fO9o6wE/giphy.gif' },
  { id: 'rabbit-2', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKMGpxx32LJAuS4/giphy.gif' },
  { id: 'cool-dog', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKovvW3T6u8yJSU/giphy.gif' },
  { id: 'heart-1', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKVUn7iM8FMEU24/giphy.gif' },
  { id: 'party', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXh0Z2N0Z3RndGZ0Z3RndGZ0Z3RndGZ0Z3RndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l41lTfuxV5w5eP5W8/giphy.gif' },
]

export default function ChatScreen() {
  const { messages, sendMessage, leaveChat, onlineUsers, roomId, typingUsers, setTypingStatus, addReaction, removeReaction } = useChat()
  const { user, profile } = useAuth()
  const [text, setText] = useState('')
  const [isEmojiOpen, setIsEmojiOpen] = useState(false)
  const [isStickerOpen, setIsStickerOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [replyingTo, setReplyingTo] = useState<{ id: number, content: string, name: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [isGiphyOpen, setIsGiphyOpen] = useState(false)
  const [giphySearch, setGiphySearch] = useState('')
  const [gifs, setGifs] = useState<any[]>([])

  const copyRoomId = () => {
    if (!roomId) return
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fetchGifs = async (query: string) => {
    try {
      const endpoint = query 
        ? `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${encodeURIComponent(query)}&limit=20`
        : `https://api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC&limit=20`
      
      const res = await fetch(endpoint)
      const { data } = await res.json()
      setGifs(data)
    } catch (err) {
      console.error('Error fetching gifs:', err)
    }
  }

  useEffect(() => {
    if (isGiphyOpen) {
      fetchGifs(giphySearch)
    }
  }, [isGiphyOpen, giphySearch])
  
  const toggleSound = () => {
    const newState = !isSoundEnabled
    setIsSoundEnabled(newState)
    localStorage.setItem('chat_sound_enabled', String(newState))
  }
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const supabase = createClient()

  // Request Notification Permission & Initialize Sound
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
    
    // Load sound setting from localStorage
    const savedSound = localStorage.getItem('chat_sound_enabled')
    if (savedSound !== null) {
      setIsSoundEnabled(savedSound === 'true')
    }

    // Initialize sound with the custom file
    audioRef.current = new Audio('/notification.mp3')
  }, [])

  // Show notification for new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      const isNotMe = lastMsg.user_id !== user?.id

      if (isNotMe) {
        // Play sound if enabled
        if (isSoundEnabled) {
          audioRef.current?.play().catch(() => {})
        }

        // Show Browser Notification if tab is hidden
        if (document.hidden && Notification.permission === "granted") {
          new Notification(`${lastMsg.user_name} says:`, {
            body: lastMsg.message_type === 'text' ? lastMsg.content : `Sent a ${lastMsg.message_type}`,
            icon: '/favicon.ico'
          })
        }
      }
    }
  }, [messages, user?.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (text.trim()) {
      setTypingStatus(true)
    }
  }, [text])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const content = text
    const reply = replyingTo
    
    setText('')
    setIsEmojiOpen(false)
    setReplyingTo(null)
    
    await sendMessage(content, 'text', undefined, reply || undefined)
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

      await sendMessage('Sent an image', 'image', publicUrl, replyingTo || undefined)
      setReplyingTo(null)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleStickerSend = async (url: string) => {
    await sendMessage('Sent a sticker', 'sticker', url, replyingTo || undefined)
    setReplyingTo(null)
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
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm md:text-base">Group Chat</h3>
              {roomId && (
                <button 
                  onClick={copyRoomId}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Click to copy Room ID"
                >
                  {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                  <span className="font-mono hidden md:inline">{roomId.slice(0, 8)}...</span>
                  <span className="font-mono md:hidden">ID</span>
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              {onlineUsers.length} people online
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg transition-all ${isSoundEnabled ? 'text-accent hover:bg-accent/10' : 'text-slate-500 hover:bg-white/5'}`}
            title={isSoundEnabled ? 'Disable Sound' : 'Enable Sound'}
          >
            {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          
          <button
            onClick={leaveChat}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut size={16} />
            Leave
          </button>
        </div>
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
                className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} group/msg`}
              >
                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden flex-shrink-0 border border-white/10 shadow-lg">
                  {(() => {
                    const onlineUser = onlineUsers.find(u => u.user_id === msg.user_id)
                    const avatarUrl = onlineUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user_name}`
                    return <img src={avatarUrl} alt={msg.user_name} className="w-full h-full object-contain" />
                  })()}
                </div>

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-[10px] font-bold text-slate-500 mb-1 ml-1 uppercase tracking-widest">
                      {msg.user_name}
                    </span>
                  )}
                  
                  <div className={`relative flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                    <div
                      className={`max-w-full relative shadow-sm ${
                        msg.message_type === 'text' 
                          ? (isMe ? 'bg-accent text-accent-foreground rounded-2xl rounded-tr-none px-4 py-2' : 'bg-white/10 text-white rounded-2xl rounded-tl-none px-4 py-2')
                          : 'p-1'
                      }`}
                    >
                      {/* Quick Reactions Picker on Hover */}
                      <div className={`absolute -top-10 ${isMe ? 'right-0' : 'left-0'} opacity-0 group-hover/msg:opacity-100 transition-all z-20 flex gap-1 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-2xl mb-1 pointer-events-none group-hover/msg:pointer-events-auto`}>
                        {['❤️', '😂', '😮', '😢', '🔥', '👍'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(Number(msg.id), emoji)}
                            className="hover:scale-150 transition-transform p-1 text-base duration-200 active:scale-95"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      {/* Reply Preview in Bubble */}
                      {msg.reply_to_id && (
                        <div className={`text-[10px] mb-1 p-2 rounded-lg bg-black/20 border-l-2 border-accent/50 ${isMe ? 'text-accent-foreground/80' : 'text-slate-300'}`}>
                          <p className="font-bold opacity-70">{msg.reply_to_name}</p>
                          <p className="truncate max-w-[200px]">{msg.reply_to_content}</p>
                        </div>
                      )}

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

                      {/* Reactions Display */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {Object.entries(
                            msg.reactions.reduce((acc: Record<string, number>, curr) => {
                              acc[curr.emoji] = (acc[curr.emoji] || 0) + 1
                              return acc
                            }, {})
                          ).map(([emoji, count]) => {
                            const hasReacted = msg.reactions?.some(r => r.user_id === user?.id && r.emoji === emoji)
                            return (
                              <button
                                key={emoji}
                                onClick={() => hasReacted ? removeReaction(Number(msg.id), emoji) : addReaction(Number(msg.id), emoji)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] transition-all ${
                                  hasReacted ? 'bg-accent/30 border-accent/50 text-accent shadow-sm' : 'bg-white/5 border-white/10 text-slate-400'
                                } border hover:scale-110 active:scale-95`}
                              >
                                <span>{emoji}</span>
                                <span className="font-bold">{count}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Reply Button on Hover */}
                    <button
                      onClick={() => {
                        setReplyingTo({ id: Number(msg.id), content: msg.content, name: msg.user_name })
                        textInputRef.current?.focus()
                      }}
                      className={`p-1.5 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover/msg:opacity-100`}
                      title="Reply"
                    >
                      <Reply size={14} />
                    </button>
                  </div>

                  <div className={`flex items-center gap-2 mt-1 mx-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    {isMe && (
                      <div className="flex items-center gap-1">
                        {(() => {
                          const readers = onlineUsers.filter(u => u.user_id !== user?.id && u.last_read_id >= msg.id).length
                          if (readers > 0) {
                            return (
                              <span className="text-[10px] text-accent font-medium flex items-center gap-0.5 animate-in fade-in">
                                Read {readers > 1 ? `by ${readers}` : ''}
                              </span>
                            )
                          }
                          return <span className="text-[10px] text-slate-600">Sent</span>
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-white/5 relative">
        {/* Typing Indicator UI */}
        {Object.keys(typingUsers).length > 0 && (
          <div className="absolute -top-7 left-6 px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300">
            <p className="text-[10px] text-accent font-medium italic flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-accent rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
              {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length > 1 ? 'are' : 'is'} typing...
            </p>
          </div>
        )}

        {/* Reply Bar */}
        {replyingTo && (
          <div className="mb-2 p-2 px-4 bg-accent/10 border-l-4 border-accent rounded-r-xl flex items-center justify-between animate-in slide-in-from-bottom-2">
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-accent">Replying to {replyingTo.name}</p>
              <p className="text-xs text-slate-400 truncate pr-4">{replyingTo.content}</p>
            </div>
            <button 
              onClick={() => setReplyingTo(null)}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

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

        {/* Giphy Picker */}
        {isGiphyOpen && (
          <div className="absolute bottom-full left-4 mb-2 z-50 w-80 h-[450px] glass-card p-4 flex flex-col shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm">Search GIFs</h4>
              <button 
                onClick={() => setIsGiphyOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="relative mb-4">
              <input 
                type="text"
                value={giphySearch}
                onChange={(e) => setGiphySearch(e.target.value)}
                placeholder="Search Giphy..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pl-9 text-xs focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pr-1 custom-scrollbar">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => {
                    sendMessage('Sent a GIF', 'gif', gif.images.fixed_height.url, replyingTo || undefined)
                    setIsGiphyOpen(false)
                    setReplyingTo(null)
                  }}
                  className="relative aspect-square overflow-hidden rounded-lg hover:ring-2 hover:ring-accent transition-all group"
                >
                  <img 
                    src={gif.images.fixed_height.url} 
                    alt={gif.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
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
              setIsGiphyOpen(!isGiphyOpen)
              setIsStickerOpen(false)
              setIsEmojiOpen(false)
            }}
            className={`p-2.5 rounded-xl transition-all ${isGiphyOpen ? 'text-accent bg-accent/10' : 'text-slate-400 hover:text-accent hover:bg-white/5'}`}
            title="GIFs"
          >
            <Gift size={20} />
          </button>
          
          <button
            onClick={() => {
              setIsStickerOpen(!isStickerOpen)
              setIsEmojiOpen(false)
              setIsGiphyOpen(false)
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
              setIsGiphyOpen(false)
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
                ref={textInputRef}
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
