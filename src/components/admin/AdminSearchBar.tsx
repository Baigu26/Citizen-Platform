'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type AdminSearchBarProps = {
  adminCity: string
  initialSearch?: string
}

type Suggestion = {
  id: string
  title: string
  status: string
  category: string
  vote_count: number
}

export default function AdminSearchBar({ adminCity, initialSearch = '' }: AdminSearchBarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Update search query when initialSearch changes
  useEffect(() => {
    setSearchQuery(initialSearch)
  }, [initialSearch])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/admin/search?q=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(adminCity)}`
        )
        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, adminCity])

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    
    setShowSuggestions(false)
    const params = new URLSearchParams()
    params.set('search', searchQuery.trim())
    router.push(`/admin/issue?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        // Navigate to selected suggestion
        router.push(`/admin/issue/${suggestions[selectedIndex].id}`)
        setShowSuggestions(false)
      } else {
        // Do full search
        handleSearch()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const clearSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setSearchQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    // Don't navigate, just clear the input
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-green-100 text-green-700'
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-700'
      case 'Completed':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center gap-2">
        {/* Search Input - NO ICON */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={`Search issues in ${adminCity}...`}
            className="w-full px-4 py-3 pr-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
          />

          {/* Clear Button (X) - Fixed to not redirect */}
          {searchQuery && (
            <button
              onClick={clearSearch}
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
              title="Clear search"
            >
              <svg 
                className="h-5 w-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}
        </div>

        {/* Search Button - Now on the Right */}
        <button
          onClick={handleSearch}
          type="button"
          disabled={!searchQuery.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed font-medium whitespace-nowrap"
          title="Search"
        >
          Search
        </button>
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-3 py-2">
              Issues in {adminCity}
            </div>
            {suggestions.map((suggestion, index) => (
              <Link
                key={suggestion.id}
                href={`/admin/issue/${suggestion.id}`}
                onClick={() => setShowSuggestions(false)}
                className={`block px-3 py-3 rounded-md transition-colors ${
                  index === selectedIndex 
                    ? 'bg-blue-50 border-l-2 border-blue-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${getStatusColor(suggestion.status)}`}>
                        {suggestion.status}
                      </span>
                      {suggestion.category && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                          {suggestion.category}
                        </span>
                      )}
                      <span className="text-gray-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        {suggestion.vote_count}
                      </span>
                    </div>
                  </div>
                  <svg 
                    className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
          
          {/* View All Results Link */}
          {searchQuery.trim() && (
            <div className="border-t border-gray-200 p-2">
              <button
                onClick={handleSearch}
                type="button"
                className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium text-left"
              >
                View all results for &quot;{searchQuery}&quot; →
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {showSuggestions && !isLoading && searchQuery.trim().length >= 2 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
          <div className="text-center text-gray-500">
            <svg 
              className="w-12 h-12 mx-auto mb-2 text-gray-400" 
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
            <p className="font-medium text-gray-700">No issues found in {adminCity}</p>
            <p className="text-sm mt-1">Try different keywords</p>
          </div>
        </div>
      )}
    </div>
  )
}