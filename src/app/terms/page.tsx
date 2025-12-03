import Link from 'next/link'

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: December 2, 2025</p>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using People&apos;s Voice, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
              <p>
                People&apos;s Voice is a civic engagement platform that allows Massachusetts residents to propose policy changes, vote on local issues, and communicate with city officials. Our service is provided free of charge to promote democratic participation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
              <p>To use certain features of our platform, you must create an account. You agree to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. User Conduct</h2>
              <p>When using People&apos;s Voice, you agree not to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Post false, misleading, or defamatory content</li>
                <li>Harass, threaten, or intimidate other users</li>
                <li>Impersonate any person or entity</li>
                <li>Post spam or unauthorized commercial content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Content Ownership</h2>
              <p>
                You retain ownership of content you post on People&apos;s Voice. By posting content, you grant us a non-exclusive, royalty-free license to use, display, and distribute your content in connection with our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Moderation</h2>
              <p>
                We reserve the right to remove any content that violates these terms or is otherwise objectionable. City administrators may also moderate content within their jurisdictions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Disclaimer of Warranties</h2>
              <p>
                People&apos;s Voice is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that our service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, People&apos;s Voice shall not be liable for any indirect, incidental, or consequential damages arising from your use of our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to Terms</h2>
              <p>
                We may update these Terms of Service from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Us</h2>
              <p>
                If you have questions about these Terms of Service, please contact us at{' '}
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