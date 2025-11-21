'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'

type SearchBarProps = {
  initialSearch?: string
}

type Suggestion = {
  id: string
  title: string
  city: string
  category: string
}

export default function SearchBar({ initialSearch = '' }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
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
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
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
  }, [searchQuery])

  const handleSearch = (e?: React.FormEvent) => {
    // Prevent default form submission if this is a form event
    if (e) {
      e.preventDefault()
    }
    
    if (!searchQuery.trim()) return
    
    setShowSuggestions(false)
    
    // Determine which page to navigate to based on current pathname
    let targetPath = '/landing' // default
    if (pathname?.includes('/trending')) {
      targetPath = '/trending'
    } else if (pathname?.includes('/landing')) {
      targetPath = '/landing'
    }
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('search', searchQuery.trim())
    router.push(`${targetPath}?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent default form submission
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        // Navigate to selected suggestion
        router.push(`/issue/${suggestions[selectedIndex].id}`)
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

  const clearSearch = () => {
    setSearchQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    
    // Navigate to current page without search params
    let targetPath = '/landing'
    if (pathname?.includes('/trending')) {
      targetPath = '/trending'
    } else if (pathname?.includes('/landing')) {
      targetPath = '/landing'
    }
    router.push(targetPath)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Wrap in form for proper Enter key handling */}
      <form onSubmit={handleSearch} className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          ) : (
            <svg 
              className="h-5 w-5 text-gray-400" 
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
          )}
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search Community Issues..."
          className="w-full px-4 py-3 pl-10 pr-24 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-16 flex items-center text-gray-400 hover:text-gray-600"
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

        {/* Search Button - type="submit" for form submission */}
        <button
          type="submit"
          disabled={!searchQuery.trim()}
          className="absolute inset-y-0 right-2 flex items-center px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md transition-colors disabled:cursor-not-allowed"
          title="Search"
        >
          Search
        </button>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-3 py-2">
              Suggestions
            </div>
            {suggestions.map((suggestion, index) => (
              <Link
                key={suggestion.id}
                href={`/issue/${suggestion.id}`}
                onClick={() => setShowSuggestions(false)}
                className={`block px-3 py-3 rounded-md transition-colors ${
                  index === selectedIndex 
                    ? 'bg-blue-50 border-l-2 border-blue-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {suggestion.city}
                      </span>
                      {suggestion.category && (
                        <>
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                            {suggestion.category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <svg 
                    className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" 
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
                type="button"
                onClick={() => handleSearch()}
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
            <p className="font-medium text-gray-700">No results found</p>
            <p className="text-sm mt-1">Try different keywords</p>
          </div>
        </div>
      )}
    </div>
  )
}