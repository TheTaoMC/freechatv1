'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { LogIn, UserCircle } from 'lucide-react'

export default function AuthScreen() {
  const { signInWithGoogle, signInAnonymously } = useAuth()
  const [guestName, setGuestName] = useState('')
  const [isGuestMode, setIsGuestMode] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-10 space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/10 mb-6 text-accent">
            <UserCircle size={48} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome to RandomChat</h2>
          <p className="mt-2 text-slate-400">Join a room and start talking instantly.</p>
        </div>

        {!isGuestMode ? (
          <div className="space-y-4">
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 glass hover:bg-white/10 transition-colors font-medium rounded-xl border border-white/20"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1e293b] px-2 text-slate-500">Or</span>
              </div>
            </div>
            <button
              onClick={() => setIsGuestMode(true)}
              className="w-full py-3 px-4 glass hover:bg-white/10 transition-colors font-medium rounded-xl border border-white/20"
            >
              Enter as Guest
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (guestName.trim()) signInAnonymously(guestName)
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Display Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-accent text-accent-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-accent/20"
            >
              Start Chatting
            </button>
            <button
              type="button"
              onClick={() => setIsGuestMode(false)}
              className="w-full text-sm text-slate-400 hover:text-white transition-colors"
            >
              Back to Login Options
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500">
          By continuing, you agree to our terms and conditions.
        </p>
      </div>
    </div>
  )
}
