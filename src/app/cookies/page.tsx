import Link from 'next/link'

export default function CookiePolicyPage() {
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
                className="w-25 h-25 object-contain"
              />
              <div className="hidden sm:block">
                <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">PEOPLE&apos;S</div>
                <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">VOICE</div>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-6 lg:gap-12 h-12 lg:h-14">
            <Link href="/landing" className="hover:text-blue-200 transition-colors font-medium text-sm lg:text-base">Home</Link>
            <Link href="/about" className="hover:text-blue-200 transition-colors font-medium text-sm lg:text-base">About</Link>
            <Link href="/town-selection" className="hover:text-blue-200 transition-colors font-medium text-sm lg:text-base">Towns</Link>
            <Link href="/trending" className="hover:text-blue-200 transition-colors font-medium text-sm lg:text-base">Trending</Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: December 2, 2025</p>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Cookies</h2>
              <p>People&apos;s Voice uses cookies for the following purposes:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Essential Cookies:</strong> Required for the platform to function properly, including authentication and session management</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences, such as your selected city</li>
                <li><strong>Security Cookies:</strong> Help protect your account and detect fraudulent activity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Types of Cookies We Use</h2>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-semibold">Cookie Name</th>
                      <th className="text-left py-2 font-semibold">Purpose</th>
                      <th className="text-left py-2 font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2">sb-*</td>
                      <td className="py-2">Authentication & session</td>
                      <td className="py-2">7 days</td>
                    </tr>
                    <tr>
                      <td className="py-2">user-preferences</td>
                      <td className="py-2">User settings</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Third-Party Cookies</h2>
              <p>
                We do not use third-party advertising cookies. Our platform may use analytics services to help us understand how users interact with our site, but we prioritize your privacy and minimize data collection.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Managing Cookies</h2>
              <p>
                You can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>View what cookies are stored on your device</li>
                <li>Delete individual or all cookies</li>
                <li>Block cookies from specific or all websites</li>
                <li>Set preferences for certain types of cookies</li>
              </ul>
              <p className="mt-3">
                Please note that disabling essential cookies may affect the functionality of People&apos;s Voice, including your ability to log in.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
              <p>
                If you have questions about our use of cookies, please contact us at{' '}
                <a href="mailto:azan.baig001@umb.edu" className="text-blue-600 hover:text-blue-700">
                  azan.baig001@umb.edu
                </a>
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/landing" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 sm:py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs sm:text-sm text-gray-400">
          © 2025 The Peoples Voice. All Rights Reserved.
        </div>
      </footer>
    </div>
  )
}