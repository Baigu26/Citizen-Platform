'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type FilterState = {
  search: string
  status: string
  category: string
  city: string
  dateFrom: string
  dateTo: string
  minVotes: string
  maxVotes: string
  minComments: string
  maxComments: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export default function AdminSearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    category: searchParams.get('category') || 'all',
    city: searchParams.get('city') || 'all',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    minVotes: searchParams.get('minVotes') || '',
    maxVotes: searchParams.get('maxVotes') || '',
    minComments: searchParams.get('minComments') || '',
    maxComments: searchParams.get('maxComments') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Count active filters
  useEffect(() => {
    let count = 0
    if (filters.search) count++
    if (filters.status !== 'all') count++
    if (filters.category !== 'all') count++
    if (filters.city !== 'all') count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    if (filters.minVotes) count++
    if (filters.maxVotes) count++
    if (filters.minComments) count++
    if (filters.maxComments) count++
    setActiveFiltersCount(count)
  }, [filters])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value)
      }
    })

    router.push(`/admin/dashboard?${params.toString()}`)
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      category: 'all',
      city: 'all',
      dateFrom: '',
      dateTo: '',
      minVotes: '',
      maxVotes: '',
      minComments: '',
      maxComments: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    })
    router.push('/admin/dashboard')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      {/* Basic Search and Quick Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search issues by title or description..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Quick Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Environment & Sustainability">Environment & Sustainability</option>
              <option value="Housing & Zoning">Housing & Zoning</option>
              <option value="Transportation & Infrastructure">Transportation & Infrastructure</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Health & Human Services">Health & Human Services</option>
              <option value="Education & Youth">Education & Youth</option>
              <option value="Governance & Transparency">Governance & Transparency</option>
              <option value="Economic Development">Economic Development</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at">Date Created</option>
              <option value="updated_at">Last Updated</option>
              <option value="vote_count">Vote Count</option>
              <option value="comment_count">Comment Count</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg
            className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Advanced Filters
          {activeFiltersCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
              {activeFiltersCount} active
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear All
            </button>
          )}
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Cities</option>
                <option value="Boston">Boston</option>
                <option value="Cambridge">Cambridge</option>
                <option value="Brookline">Brookline</option>
                <option value="Worcester">Worcester</option>
                <option value="Quincy">Quincy</option>
                <option value="Braintree">Braintree</option>
                <option value="Somerville">Somerville</option>
                <option value="Lowell">Lowell</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Min Votes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Votes</label>
              <input
                type="number"
                placeholder="e.g., 10"
                value={filters.minVotes}
                onChange={(e) => handleFilterChange('minVotes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Max Votes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Votes</label>
              <input
                type="number"
                placeholder="e.g., 100"
                value={filters.maxVotes}
                onChange={(e) => handleFilterChange('maxVotes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Min Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Comments</label>
              <input
                type="number"
                placeholder="e.g., 5"
                value={filters.minComments}
                onChange={(e) => handleFilterChange('minComments', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Max Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Comments</label>
              <input
                type="number"
                placeholder="e.g., 50"
                value={filters.maxComments}
                onChange={(e) => handleFilterChange('maxComments', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                Search: &quot;{filters.search}&quot;
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange('status', 'all')}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category !== 'all' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                Category: {filters.category}
                <button
                  onClick={() => handleFilterChange('category', 'all')}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.city !== 'all' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                City: {filters.city}
                <button
                  onClick={() => handleFilterChange('city', 'all')}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}