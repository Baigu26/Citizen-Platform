'use client'

import { Profile } from '@/lib/supabase'
import { logout } from '@/app/actions'
import { useTransition } from 'react'

type UserMenuProps = {
  profile: Profile | null
}

export default function UserMenu({ profile }: UserMenuProps) {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
    })
  }

  // If profile is null, show minimal UI with logout button
  if (!profile) {
    return (
      <div className="flex items-center gap-4">
        <p className="text-white font-medium">User</p>
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="bg-white text-cyan-600 hover:bg-cyan-50 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Logging out...' : 'Log Out'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-gray-900 font-medium">{profile.full_name || 'User'}</p>
        <p className="text-gray-600 text-sm">{profile.city || 'Unknown'}</p>
      </div>
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Logging out...' : 'Log Out'}
      </button>
    </div>
  )
}