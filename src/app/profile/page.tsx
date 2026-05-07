'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/utils/supabase'
import Navbar from '@/components/Navbar'
import { Check, Loader2, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import AvatarPicker, { getAvatarUrl, AVATAR_OPTIONS } from '@/components/AvatarPicker'

export default function ProfilePage() {
  const { user, profile, loading } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [avatarConfig, setAvatarConfig] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setAvatarConfig(profile.avatar_config || {
        top: 'shortHairShortFlat',
        accessories: 'blank',
        hairColor: '2c1b18',
        facialHair: 'blank',
        clothing: 'blazerShirt',
        eyes: 'default',
        eyebrows: 'default',
        mouth: 'default',
        skin: 'light'
      })
    }
  }, [profile])

  const handleRandomize = () => {
    const newConfig: any = {}
    Object.keys(AVATAR_OPTIONS).forEach((key) => {
      const options = (AVATAR_OPTIONS as any)[key]
      newConfig[key] = options[Math.floor(Math.random() * options.length)]
    })
    setAvatarConfig(newConfig)
  }

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
          avatar_config: avatarConfig,
          avatar_url: getAvatarUrl(avatarConfig), // Sync old avatar_url field for compatibility
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      setMessage('Profile updated successfully!')
      // Refresh will happen via AuthContext state change or manual refresh
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Failed to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || !avatarConfig) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-accent" size={32} />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 flex flex-col items-center">
        <div className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          <div className="space-y-6">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Back to Chat
            </Link>

            <div className="glass-card p-8 text-center space-y-6">
              <div className="relative inline-block group">
                <div className="w-48 h-48 rounded-full bg-accent/10 flex items-center justify-center text-accent overflow-hidden border-4 border-accent/20 shadow-2xl transition-transform group-hover:scale-105">
                  <img src={getAvatarUrl(avatarConfig)} alt="Avatar Preview" className="w-full h-full object-contain" />
                </div>
                <button 
                  onClick={handleRandomize}
                  className="absolute bottom-2 right-2 p-3 bg-accent text-accent-foreground rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                  title="Randomize"
                >
                  <RefreshCw size={20} />
                </button>
              </div>

              <div>
                <h2 className="text-2xl font-bold">Profile Settings</h2>
                <p className="text-slate-400 text-sm">Customize your name and appearance.</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="text-left">
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-bold"
                    placeholder="Your display name"
                  />
                </div>

                <div className="text-left">
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Account Type</label>
                  <div className="px-4 py-3 bg-white/2 border border-white/5 rounded-xl text-slate-400 text-sm">
                    {user?.is_anonymous ? 'Guest Account' : 'Google Account'}
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-4 bg-accent text-accent-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-accent/20"
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
              </div>
            </div>
          </div>

          {/* Avatar Customizer */}
          <div className="glass-card p-8">
             <AvatarPicker config={avatarConfig} onChange={setAvatarConfig} />
          </div>

        </div>
      </main>
    </div>
  )
}
