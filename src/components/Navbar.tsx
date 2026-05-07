'use client'

import { useAuth } from '@/context/AuthContext'
import { LogOut, User, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { getAvatarUrl } from './AvatarPicker'

export default function Navbar() {
  const { profile, signOut } = useAuth()

  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-white/5 bg-white/2 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="bg-accent p-1.5 rounded-lg text-accent-foreground shadow-lg shadow-accent/20">
          <MessageCircle size={20} />
        </div>
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">RandomChat</span>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/profile" className="flex items-center gap-3 glass px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-all group">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent overflow-hidden border border-accent/20 group-hover:scale-110 transition-transform">
            <img 
              src={profile?.avatar_config ? getAvatarUrl(profile.avatar_config) : (profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.display_name || 'Guest'}`)} 
              alt={profile?.display_name} 
              className="w-full h-full object-contain" 
            />
          </div>
          <span className="text-sm font-medium pr-1 text-slate-200">{profile?.display_name || 'User'}</span>
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
