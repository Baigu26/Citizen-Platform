'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type SearchBarProps = {
  initialSearch?: string
}

export default function SearchBar({ initialSearch = '' }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(initialSearch)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    
    // Build new URL with search parameter
    const params = new URLSearchParams(searchParams.toString())
    
    if (value.trim()) {
      params.set('search', value.trim())
    } else {
      params.delete('search')
    }
    
    // Keep city filter if it exists
    const city = searchParams.get('city')
    if (city && city !== 'all') {
      params.set('city', city)
    }
    
    // Keep sort if it exists
    const sort = searchParams.get('sort')
    if (sort) {
      params.set('sort', sort)
    }
    
    // Update URL
    const newUrl = params.toString() ? `/?${params.toString()}` : '/'
    router.push(newUrl)
  }

  const clearSearch = () => {
    setSearchQuery('')
    handleSearch('')
  }

  return (
    <div className="relative">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search issues..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-gray-900 placeholder:text-gray-400"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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

      {/* Search hint */}
      {searchQuery && (
        <p className="text-xs text-gray-500 mt-1">
          Searching in titles and descriptions
        </p>
      )}
    </div>
  )
}