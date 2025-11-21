import Link from 'next/link'
import { getCurrentUser } from '@/lib/supabase-server'
import UserMenu from '@/components/UserMenu'
import { supabase } from '@/lib/supabase'
import { Issue } from '@/lib/supabase'
import SearchBar from '@/components/SearchBar'

type PageProps = {
  searchParams: Promise<{
    search?: string
    category?: string
  }>
}

export default async function TrendingPage({ searchParams }: PageProps) {
  const currentUser = await getCurrentUser()
  const { search, category } = await searchParams

  // DEBUG: Log what we're receiving
  console.log('=== TRENDING PAGE DEBUG ===')
  console.log('Search param:', search)
  console.log('Category param:', category)
  console.log('Category type:', typeof category)

  // Build query for trending issues
  let query = supabase
    .from('issues')
    .select('*')
    .order('vote_count', { ascending: false })
    .order('created_at', { ascending: false })

  // Apply search filter
  if (search) {
    console.log('Applying search filter for:', search)
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Apply category filter
  if (category && category !== 'all') {
    console.log('Applying category filter for:', category)
    query = query.eq('category', category)
  }

  // Get results
  const { data: issues, error } = await query.limit(30)
  
  console.log('Issues returned:', issues?.length)
  console.log('Error:', error)
  
  // If we have issues, log their categories
  if (issues && issues.length > 0) {
    console.log('Sample issue categories:', issues.slice(0, 3).map(i => i.category))
  }

  // Get ALL categories from database for comparison
  const { data: allIssues } = await supabase
    .from('issues')
    .select('category')
    .limit(10)
  
  console.log('All categories in DB:', [...new Set(allIssues?.map(i => i.category))])
  console.log('=== END DEBUG ===')

  // Helper functions
  const getDescriptionOnly = (fullDescription: string) => {
    const parts = fullDescription.split('\n\n**Why it matters:**\n')
    return parts[0]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
      case 'Open':
        return 'bg-green-500'
      case 'Under Review':
        return 'bg-yellow-500'
      case 'In Progress':
        return 'bg-blue-500'
      case 'Closed':
      case 'Completed':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <Link href="/landing" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <img 
                src="/Logo1.png" 
                alt="People's Voice Logo" 
                className="w-25 h-25 sm:w-25 sm:h-25 lg:w-25 lg:h-25 object-contain"
              />
              <div className="hidden sm:block">
                <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">PEOPLE&apos;S</div>
                <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">VOICE</div>
              </div>
            </Link>

            <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
              <SearchBar initialSearch={search || ''} />
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {currentUser ? (
                <>
                  <Link
                    href="/create-issue"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg font-semibold transition-colors text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">New Post</span>
                    <span className="sm:hidden">Post</span>
                  </Link>
                  <div className="hidden sm:block">
                    <UserMenu profile={currentUser.profile} />
                  </div>
                  <Link
                    href="/settings"
                    className="sm:hidden w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold"
                  >
                    {currentUser.profile.full_name?.charAt(0) || 'U'}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg font-semibold transition-colors text-sm sm:text-base"
                  >
                    Sign-Up
                  </Link>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 font-medium text-sm sm:text-base px-2 sm:px-0"
                  >
                    <span className="hidden sm:inline">Sign In</span>
                    <span className="sm:hidden">Login</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden pb-4">
            <SearchBar initialSearch={search || ''} />
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="bg-blue-900 text-white overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-start lg:justify-center gap-6 lg:gap-12 h-12 lg:h-14 min-w-max lg:min-w-0">
            <Link href="/landing" className="hover:text-blue-200 transition-colors font-medium text-sm lg:text-base whitespace-nowrap">
              Home
            </Link>
            <Link href="/about" className="hover:text-blue-200 transition-colors font-medium text-sm lg:text-base whitespace-nowrap">
              About
            </Link>
            <Link href="/town-selection" className="hover:text-blue-200 transition-colors font-medium text-sm lg:text-base whitespace-nowrap">
              Towns
            </Link>
            <Link href="/trending" className="hover:text-blue-200 transition-colors font-medium text-sm lg:text-base whitespace-nowrap border-b-2 border-white">
              Trending
            </Link>
            <Link href="/settings" className="hover:text-blue-200 transition-colors font-medium text-sm lg:text-base whitespace-nowrap">
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trending Issues
          </h1>

          {/* Filter Status Bar */}
          {(search || (category && category !== 'all')) && (
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-gray-700">
                  {issues?.length || 0} results
                </span>
                {search && (
                  <span className="text-gray-600">
                    for &quot;{search}&quot;
                  </span>
                )}
                {category && category !== 'all' && (
                  <span className="text-gray-600">
                    in {category}
                  </span>
                )}
              </div>
              <Link
                href="/trending"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </Link>
            </div>
          )}

          {/* Category Filter Tabs */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 sm:gap-3 min-w-max sm:min-w-0">
              <Link
                href="/trending"
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                  !category || category === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All Categories
              </Link>
              <Link
                href="/trending?category=Transportation+%26+Infrastructure"
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                  category === 'Transportation & Infrastructure'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Transportation
              </Link>
              <Link
                href="/trending?category=Environment+%26+Sustainability"
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                  category === 'Environment & Sustainability'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Environment
              </Link>
              <Link
                href="/trending?category=Housing+%26+Zoning"
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                  category === 'Housing & Zoning'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Housing
              </Link>
              <Link
                href="/trending?category=Education+%26+Youth"
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                  category === 'Education & Youth'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Education
              </Link>
              <Link
                href="/trending?category=Public+Safety"
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                  category === 'Public Safety'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Public Safety
              </Link>
            </div>
          </div>
        </div>

        {/* Issues Grid */}
        {issues && issues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {issues.map((issue: Issue) => (
              <Link
                key={issue.id}
                href={`/issue/${issue.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-4 sm:p-6"
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 line-clamp-2 flex-1">
                    {issue.title}
                  </h3>
                  <span
                    className={`${getStatusColor(
                      issue.status
                    )} text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full flex-shrink-0`}
                  >
                    {issue.status}
                  </span>
                </div>

                <p className="text-blue-600 font-semibold text-sm mb-2">
                  {issue.city}
                </p>

                <p className="text-gray-600 text-sm line-clamp-3 mb-3 sm:mb-4">
                  {getDescriptionOnly(issue.description)}
                </p>

                <div className="flex items-center justify-between text-xs sm:text-sm pt-3 sm:pt-4 border-t border-gray-200 gap-2">
                  <div className="flex items-center gap-1 text-blue-600 font-semibold">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="whitespace-nowrap">{issue.vote_count}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span className="whitespace-nowrap">{issue.comment_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters
            </p>
            <Link
              href="/trending"
              className="inline-block text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 sm:py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center gap-6">
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-gray-300">Cookie Policy</Link>
              <Link href="/contact" className="hover:text-gray-300">Contact Us</Link>
              <Link href="/admin/login" className="hover:text-gray-300">City Official Login</Link>
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-xs sm:text-sm">Follow Us</span>
              <Link href="https://www.instagram.com/thepeoplesvoicema/" className="hover:text-gray-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
              <Link href="https://www.tiktok.com/@peoplesvoicema?_r=1&_t=ZP-91UYgFyksM2" className="hover:text-gray-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-400">
            © 2025 The Peoples Voice. All Rights Reserved. Unauthorized use or reproduction is strictly prohibited.
          </div>
        </div>
      </footer>
    </div>
  )
}