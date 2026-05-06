'use client'

import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import AuthScreen from './AuthScreen'
import ChatScreen from './ChatScreen'
import MatchmakingScreen from './MatchmakingScreen'
import Navbar from './Navbar'

export default function AppContent() {
  const { user, loading } = useAuth()
  const { roomId, isSearching, joinChat } = useChat()

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
          <div className="max-w-md w-full glass-card p-8 text-center space-y-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
              Ready to Chat?
            </h1>
            <p className="text-slate-400">
              Join a room and start talking to 5 random people instantly.
            </p>
            <button
              onClick={() => joinChat()}
              className="w-full py-4 bg-accent text-accent-foreground font-bold rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20"
            >
              Join Chat Room
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
