'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavBarProps = {
  userMenu?: React.ReactNode
  showNewPostButton?: boolean
  isAdmin?: boolean
}

export default function NavBar({ userMenu, showNewPostButton = true, isAdmin = false }: NavBarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/landing" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">📢</span>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">PEOPLE&apos;S</div>
                <div className="text-xl font-bold text-gray-900">VOICE</div>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Community Issues..."
                  className="w-full px-4 py-3 pl-10 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Right Side - Auth Buttons or User Menu */}
            <div className="flex items-center gap-4">
              {userMenu ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {showNewPostButton && (
                    <Link
                      href="/create-issue"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
                    >
                      New Post
                    </Link>
                  )}
                  {userMenu}
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
                  >
                    Sign-Up
                  </Link>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-12 h-14">
            <Link
              href="/landing"
              className={`hover:text-blue-200 transition-colors font-medium ${
                isActive('/landing') ? 'border-b-2 border-white' : ''
              }`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`hover:text-blue-200 transition-colors font-medium ${
                isActive('/about') ? 'border-b-2 border-white' : ''
              }`}
            >
              About Us
            </Link>
            <Link
              href="/town-selection"
              className={`hover:text-blue-200 transition-colors font-medium ${
                isActive('/town-selection') ? 'border-b-2 border-white' : ''
              }`}
            >
              Town Selection
            </Link>
            <Link
              href="/trending"
              className={`hover:text-blue-200 transition-colors font-medium ${
                isActive('/trending') ? 'border-b-2 border-white' : ''
              }`}
            >
              Trending Posts
            </Link>
            <Link
              href="/settings"
              className={`hover:text-blue-200 transition-colors font-medium ${
                isActive('/settings') ? 'border-b-2 border-white' : ''
              }`}
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}