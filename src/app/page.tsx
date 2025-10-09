import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/supabase-server'
import { Issue } from '@/lib/supabase'
import CityFilter from '@/components/CityFilter'
import UserMenu from '@/components/UserMenu'
import Link from 'next/link'

type SearchParams = {
  city?: string
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const selectedCity = params.city || 'all'

  // Ger current user
  const currentUser = await getCurrentUser()

  // First, get all unique cities from the database
  const { data: citiesData } = await supabase
    .from('issues')
    .select('city')
  
  // Extract unique city names
  const uniqueCities = citiesData 
    ? Array.from(new Set(citiesData.map(item => item.city))).sort()
    : []

  // Build the query for issues
  let query = supabase
    .from('issues')
    .select('*')
    .order('vote_count', { ascending: false })

  // Apply city filter if not "all"
  if (selectedCity !== 'all') {
    query = query.eq('city', selectedCity)
  }

  // Execute the query
  const { data: issues, error } = await query

  // If there's an error fetching data, show an error message
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">
          <h2 className="text-2xl font-bold mb-2">Error loading issues</h2>
          <p>{error.message}</p>
        </div>
      </div>
    )
  }

  // If no issues found, show a message
  if (!issues || issues.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-cyan-600 text-white py-6 shadow-lg">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl font-bold">MassVoice</h1>
            <p className="text-cyan-100 mt-1">Your city, your voice</p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <CityFilter selectedCity={selectedCity} availableCities={uniqueCities} />
          
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600 text-center">
              <h2 className="text-2xl font-bold mb-2">No issues found</h2>
              <p>
                {selectedCity !== 'all' 
                  ? `No issues in ${selectedCity} yet. Be the first to post!`
                  : 'Be the first to post an issue!'}
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-cyan-600 text-white py-6 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">MassVoice</h1>
              <p className="text-cyan-100 mt-1">Your city, your voice</p>
            </div>
            
            {/* Show different UI based on auth state */}
            {currentUser ? (
              <UserMenu profile={currentUser.profile} />
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-cyan-100 hover:text-white font-medium"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-white text-cyan-600 hover:bg-cyan-50 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Local Issues</h2>
              <p className="text-gray-600">Browse community issues across Massachusetts</p>
            </div>
            <Link
              href="/create-issue"
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post New Issue
            </Link>
          </div>
          
          {/* City Filter Component */}
          <CityFilter selectedCity={selectedCity} availableCities={uniqueCities} />
        </div>

        {/* Issue Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {issues.length} issue{issues.length !== 1 ? 's' : ''}
          {selectedCity !== 'all' && ` in ${selectedCity}`}
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {issues.map((issue: Issue) => (
            <Link
              key={issue.id}
              href={`/issue/${issue.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Vote Count */}
                <div className="flex flex-col items-center min-w-[60px]">
                  <button className="text-gray-400 hover:text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span className="text-xl font-bold text-gray-700">{issue.vote_count}</span>
                  <button className="text-gray-400 hover:text-red-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Issue Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {issue.title}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {issue.description}
                      </p>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium text-cyan-600">{issue.city}</span>
                    
                    {issue.category && (
                      <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                        {issue.category}
                      </span>
                    )}
                    
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      issue.status === 'Open' ? 'bg-green-100 text-green-700' :
                      issue.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700' :
                      issue.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      issue.status === 'Completed' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {issue.status}
                    </span>

                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {issue.comment_count} comments
                    </span>

                    {issue.author_name && (
                      <span>by {issue.author_name}</span>
                    )}

                    <span>
                      {new Date(issue.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}