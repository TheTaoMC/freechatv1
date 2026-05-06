'use client'

import { useAuth } from '@/context/AuthContext'
import { LogOut, User, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function Navbar() {
  const { profile, signOut } = useAuth()

  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-white/5 bg-white/2">
      <div className="flex items-center gap-2">
        <div className="bg-accent p-1.5 rounded-lg text-accent-foreground">
          <MessageCircle size={20} />
        </div>
        <span className="font-bold text-xl tracking-tight">RandomChat</span>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/profile" className="flex items-center gap-3 glass px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 transition-all">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
            ) : (
              <User size={18} />
            )}
          </div>
          <span className="text-sm font-medium pr-1">{profile?.display_name || 'User'}</span>
        </Link>
        
        <button
          onClick={signOut}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  )
}
