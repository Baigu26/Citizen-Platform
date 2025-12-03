import { getCurrentUser, createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import ReportsList from '@/components/admin/ReportsList'

export default async function AdminReportsPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/admin/login')
  }

  if (!currentUser.profile.is_admin) {
    redirect('/landing')
  }

  const supabase = await createClient()
  const adminCity = currentUser.profile.admin_city || currentUser.profile.city

  // Get pending reports count
  const { count: pendingCount } = await supabase
    .from('reports')
    .select('*, issues!inner(city)', { count: 'exact', head: true })
    .eq('status', 'pending')
    .eq('issues.city', adminCity)

  // Get all reports for admin's city
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      *,
      issues:issue_id (
        id,
        title,
        description,
        city,
        user_id,
        author_name,
        status
      )
    `)
    .order('created_at', { ascending: false })

  // Filter to admin's city
  const cityReports = reports?.filter(r => r.issues?.city === adminCity) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav currentUser={currentUser} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Reports</h1>
            <p className="text-gray-600 mt-1">
              Review and manage reported content in {adminCity}
            </p>
          </div>
          {pendingCount && pendingCount > 0 && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">
              {pendingCount} pending {pendingCount === 1 ? 'report' : 'reports'}
            </div>
          )}
        </div>

        {/* Back Link */}
        <Link 
          href="/admin/dashboard" 
          className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Reports List */}
        <ReportsList 
          initialReports={cityReports} 
          adminId={currentUser.user.id}
          adminCity={adminCity}
        />
      </main>
    </div>
  )
}