'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/utils/supabase'
import Navbar from '@/components/Navbar'
import { User, Check, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, profile, loading } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      setMessage('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Failed to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 flex flex-col items-center">
        <div className="max-w-md w-full space-y-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Chat
          </Link>

          <div className="glass-card p-8 space-y-8">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center text-accent overflow-hidden border-2 border-accent/20">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} />
                  )}
                </div>
              </div>
              <h2 className="mt-4 text-2xl font-bold">Profile Settings</h2>
              <p className="text-slate-400 text-sm">Manage your account and display name.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  placeholder="Your display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Account Type</label>
                <div className="px-4 py-3 bg-white/2 border border-white/5 rounded-xl text-slate-500 text-sm">
                  {user?.is_anonymous ? 'Guest Account' : 'Google Account'}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-accent text-accent-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Check size={20} />
                )}
                Save Changes
              </button>

              {message && (
                <p className={`text-center text-sm font-medium ${message.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
