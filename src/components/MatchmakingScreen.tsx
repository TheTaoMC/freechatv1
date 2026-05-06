'use client'

import { Search, Loader2 } from 'lucide-react'

export default function MatchmakingScreen() {
  return (
    <div className="max-w-md w-full glass-card p-12 text-center space-y-8 animate-pulse">
      <div className="relative inline-flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping"></div>
        <div className="relative bg-accent/10 p-6 rounded-full text-accent">
          <Search size={48} className="animate-bounce" />
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-3xl font-bold">Finding a Room...</h2>
        <p className="text-slate-400">Looking for 5 awesome people for you to chat with.</p>
      </div>
      <div className="flex items-center justify-center gap-2 text-accent font-medium">
        <Loader2 className="animate-spin" size={20} />
        <span>Matching you now</span>
      </div>
    </div>
  )
}
