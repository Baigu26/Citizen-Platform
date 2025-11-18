'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions'
import { useTransition } from 'react'

type AdminNavProps = {
  currentUser: {
    user: { id: string; email?: string }
    profile: {
      id: string
      full_name: string | null
      admin_city: string | null
      is_admin: boolean
    }
  }
}

export default function AdminNav({ currentUser }: AdminNavProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      await logout()
    })
  }

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <img 
                src="/Logo.png" 
                alt="People's Voice Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <div className="text-lg font-bold text-gray-900">ADMIN PORTAL</div>
                <div className="text-xs text-gray-500">{currentUser.profile.admin_city}</div>
              </div>
            </Link>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser.profile.full_name}
                </p>
                <p className="text-xs text-gray-500">City Official</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isPending}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isPending ? 'Logging out...' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-8 h-12">
            <Link
              href="/admin/dashboard"
              className={`hover:text-blue-200 transition-colors font-medium ${
                isActive('/admin/dashboard') ? 'border-b-2 border-white' : ''
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/issue"
              className={`hover:text-blue-200 transition-colors font-medium ${
                isActive('/admin/issues') || pathname.startsWith('/admin/issue') ? 'border-b-2 border-white' : ''
              }`}
            >
              All Issues
            </Link>
            <Link
              href="/landing"
              className="hover:text-blue-200 transition-colors font-medium"
            >
              View Public Site
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}