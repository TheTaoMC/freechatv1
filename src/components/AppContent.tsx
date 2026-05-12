'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import AuthScreen from './AuthScreen'
import ChatScreen from './ChatScreen'
import MatchmakingScreen from './MatchmakingScreen'
import Navbar from './Navbar'

export default function AppContent() {
  const { user, loading } = useAuth()
  const { roomId, isSearching, joinChat, createPrivateRoom, joinPrivateRoom } = useChat()
  const [targetRoomId, setTargetRoomId] = useState('')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {isSearching ? (
          <MatchmakingScreen />
        ) : roomId ? (
          <ChatScreen />
        ) : (
          <div className="max-w-md w-full glass-card p-8 text-center space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
                Ready to Chat?
              </h1>
              <p className="text-slate-400">
                Join a room and meet awesome people.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => joinChat()}
                className="w-full py-4 bg-accent text-accent-foreground font-bold rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20"
              >
                Join Random Room
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#020617] px-2 text-slate-500">Private Rooms</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => createPrivateRoom()}
                  className="w-full py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all"
                >
                  Create New Room
                </button>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={targetRoomId}
                    onChange={(e) => setTargetRoomId(e.target.value)}
                    placeholder="Enter Room ID..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                  />
                  <button
                    onClick={() => {
                      if (targetRoomId.trim()) joinPrivateRoom(targetRoomId.trim())
                    }}
                    className="px-4 py-2 bg-accent/20 text-accent hover:bg-accent/30 rounded-xl transition-all text-sm font-bold"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
