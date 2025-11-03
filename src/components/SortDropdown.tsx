'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type SortDropdownProps = {
  currentSort: string
}

export default function SortDropdown({ currentSort }: SortDropdownProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (sortValue: string) => {
    // Build new URL with sort parameter
    const params = new URLSearchParams(searchParams.toString())
    
    if (sortValue === 'top') {
      params.delete('sort') // 'top' is default, so remove param
    } else {
      params.set('sort', sortValue)
    }
    
    // Update URL
    const newUrl = params.toString() ? `/?${params.toString()}` : '/'
    router.push(newUrl)
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="sort-filter" className="text-sm font-medium text-gray-700">
        Sort by:
      </label>
      <select
        id="sort-filter"
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
      >
        <option value="top">Most Votes</option>
        <option value="recent">Newest First</option>
        <option value="discussed">Most Comments</option>
      </select>
    </div>
  )
}