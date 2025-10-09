'use client'

import { Profile } from '@/lib/supabase'
import { logout } from '@/app/actions'
import { useState, useTransition } from 'react'

type UserMenuProps = {
  profile: Profile
}

export default function UserMenu({ profile }: UserMenuProps) {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
    })
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-white font-medium">{profile.full_name}</p>
        <p className="text-cyan-100 text-sm">{profile.city}</p>
      </div>
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