import CreateIssueForm from '@/components/CreateIssueForm'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function CreateIssuePage() {
  // Check if user is logged in
  const currentUser = await getCurrentUser()
  
  // If not logged in, redirect to login page
  if (!currentUser) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-cyan-600 text-white py-6 shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="text-cyan-100 hover:text-white mb-2 inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Issues
          </Link>
          <h1 className="text-3xl font-bold mt-2">Post New Issue</h1>
          <p className="text-cyan-100 mt-1">Share a concern or proposal for your community</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <CreateIssueForm profile={currentUser.profile} />
        </div>
      </main>
    </div>
  )
}