import Link from 'next/link'
import { getCurrentUser } from '@/lib/supabase-server'
import { supabase } from '@/lib/supabase'
import UserMenu from '@/components/UserMenu'
import Image from 'next/image'

export default async function TownSelectionPage() {
  const currentUser = await getCurrentUser()

  // Get all cities and their post counts
  const { data: citiesData } = await supabase
    .from('issues')
    .select('city')

  // Count posts per city
  const cityCounts: Record<string, number> = {}
  citiesData?.forEach(item => {
    cityCounts[item.city] = (cityCounts[item.city] || 0) + 1
  })

  // Define major Massachusetts cities with images
  // Define major Massachusetts cities with images
  const cities = [
  { name: 'Boston', image: '/StateHouse.jpg', posts: cityCounts['Boston'] || 0 },
  { name: 'Brookline', image: '/Brookline.jpg', posts: cityCounts['Brookline'] || 0 },
  { name: 'Cambridge', image: '/Cambridge.jpg', posts: cityCounts['Cambridge'] || 0 },
  { name: 'Worcester', image: '/Worcester.jpg', posts: cityCounts['Worcester'] || 0 },
  { name: 'Quincy', image: '/Newton.jpg', posts: cityCounts['Quincy'] || 0 },
  { name: 'Braintree', image: '/Braintree.jpg', posts: cityCounts['Braintree'] || 0 },
  { name: 'Somerville', image: '/Brookline.jpg', posts: cityCounts['Somerville'] || 0 },
  { name: 'Lowell', image: '/Lowell.jpg', posts: cityCounts['Lowell'] || 0 },
  ].sort((a, b) => b.posts - a.posts) // Sort by post count

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/landing" className="flex items-center gap-3">
              <img 
                src="/Logo.png" 
                alt="People's Voice Logo" 
                className="w-12 h-12 object-contain"
              />
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
                  className="w-full px-4 py-3 pl-10 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              {currentUser ? (
                <>
                  <Link
                    href="/create-issue"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
                  >
                    New Post
                  </Link>
                  <UserMenu profile={currentUser.profile} />
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
            <Link href="/landing" className="hover:text-blue-200 transition-colors font-medium">
              Home
            </Link>
            <Link href="/about" className="hover:text-blue-200 transition-colors font-medium">
              About Us
            </Link>
            <Link href="/town-selection" className="hover:text-blue-200 transition-colors font-medium border-b-2 border-white">
              Town Selection
            </Link>
            <Link href="/trending" className="hover:text-blue-200 transition-colors font-medium">
              Trending Posts
            </Link>
            <Link href="/settings" className="hover:text-blue-200 transition-colors font-medium">
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Town Selection</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Sort By:</span>
            <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option value="posts">Posts</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="recent">Recent Activity</option>
            </select>
          </div>
        </div>

        {/* City Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <Link
              key={city.name}
              href={`/?city=${city.name}`}
              className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* City Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>

              {/* City Info */}
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {city.name}
                </h3>
                <p className="text-gray-600">
                  {city.posts.toLocaleString()} Post{city.posts !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Cities Link */}
        <div className="mt-12 text-center">
          <Link
            href="/all-cities"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg"
          >
            View All Massachusetts Cities
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-gray-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-300">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-gray-300">
                Cookie Policy
              </Link>
              <Link href="/contact" className="hover:text-gray-300">
                Contact Us
              </Link>
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-sm">Follow Us</span>
              <Link href="#" className="hover:text-gray-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Link>
              <Link href="#" className="hover:text-gray-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
              <Link href="#" className="hover:text-gray-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400">
            © 2025 The Peoples Voice. All Rights Reserved. Unauthorized use or reproduction is strictly prohibited.
          </div>
        </div>
      </footer>
    </div>
  )
}