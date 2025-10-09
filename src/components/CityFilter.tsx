'use client'

import { useRouter } from 'next/navigation'

type CityFilterProps = {
  selectedCity: string
  availableCities: string[]
}

export default function CityFilter({ selectedCity, availableCities }: CityFilterProps) {
  const router = useRouter()

  const handleCityChange = (city: string) => {
    if (city === 'all') {
      router.push('/')
    } else {
      router.push(`/?city=${city}`)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="city-filter" className="text-sm font-medium text-gray-700">
        Filter by city:
      </label>
      <select
        id="city-filter"
        value={selectedCity}
        onChange={(e) => handleCityChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
      >
        <option value="all">All Cities ({availableCities.length})</option>
        {availableCities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </div>
  )
}