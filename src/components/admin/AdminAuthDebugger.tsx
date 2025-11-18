'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminAuthDebugger() {
  const [authState, setAuthState] = useState<any>(null)
  const [sessionChanges, setSessionChanges] = useState<string[]>([])

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('🔍 Initial Session Check:', { session, error })
      setAuthState({
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        expiresAt: session?.expires_at,
        error: error?.message
      })
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth State Change:', event, session)
      
      const timestamp = new Date().toLocaleTimeString()
      setSessionChanges(prev => [...prev, `${timestamp}: ${event}`])
      
      setAuthState({
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        expiresAt: session?.expires_at,
        lastEvent: event
      })

      if (event === 'SIGNED_OUT') {
        console.error('⚠️ UNEXPECTED LOGOUT DETECTED!')
        console.trace('Logout stack trace')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg max-w-md z-50 text-xs font-mono">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm">🔧 Auth Debugger</h3>
        <button
          onClick={() => {
            const element = document.querySelector('.fixed.bottom-4.right-4') as HTMLElement
            if (element) element.style.display = 'none'
          }}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-gray-400">Status:</span>{' '}
          <span className={authState?.hasSession ? 'text-green-400' : 'text-red-400'}>
            {authState?.hasSession ? '✓ Authenticated' : '✗ Not Authenticated'}
          </span>
        </div>

        {authState?.userId && (
          <div>
            <span className="text-gray-400">User ID:</span>{' '}
            <span className="text-blue-400">{authState.userId.slice(0, 8)}...</span>
          </div>
        )}

        {authState?.email && (
          <div>
            <span className="text-gray-400">Email:</span>{' '}
            <span>{authState.email}</span>
          </div>
        )}

        {authState?.lastEvent && (
          <div>
            <span className="text-gray-400">Last Event:</span>{' '}
            <span className="text-yellow-400">{authState.lastEvent}</span>
          </div>
        )}

        {authState?.error && (
          <div>
            <span className="text-red-400">Error:</span>{' '}
            <span>{authState.error}</span>
          </div>
        )}

        {sessionChanges.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-gray-400 mb-1">Session Changes:</div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {sessionChanges.slice(-5).map((change, i) => (
                <div key={i} className="text-xs text-gray-300">
                  {change}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={async () => {
            const { data: { session } } = await supabase.auth.getSession()
            console.log('📊 Full Session Data:', session)
            alert('Check console for full session data')
          }}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
        >
          Log Full Session
        </button>
      </div>
    </div>
  )
}