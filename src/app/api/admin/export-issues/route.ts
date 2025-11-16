import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get the current logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, admin_city')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { issueIds } = await request.json()

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return NextResponse.json(
        { error: 'Issue IDs are required' },
        { status: 400 }
      )
    }

    // Fetch issues
    let query = supabase
      .from('issues')
      .select('*')
      .in('id', issueIds)

    // If admin has a city restriction, filter
    if (profile.admin_city && profile.admin_city !== 'all') {
      query = query.eq('city', profile.admin_city)
    }

    const { data: issues, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching issues:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch issues' },
        { status: 500 }
      )
    }

    if (!issues || issues.length === 0) {
      return NextResponse.json(
        { error: 'No issues found' },
        { status: 404 }
      )
    }

    // Generate CSV
    const headers = [
      'ID',
      'Title',
      'Description',
      'Why It Matters',
      'Category',
      'City',
      'Zip Code',
      'Status',
      'Author',
      'Vote Count',
      'Comment Count',
      'Created At',
      'Updated At',
    ]

    const csvRows = [headers.join(',')]

    issues.forEach(issue => {
      const row = [
        issue.id,
        `"${(issue.title || '').replace(/"/g, '""')}"`,
        `"${(issue.description || '').replace(/"/g, '""')}"`,
        `"${(issue.why_it_matters || '').replace(/"/g, '""')}"`,
        `"${issue.category || ''}"`,
        `"${issue.city || ''}"`,
        `"${issue.zip_code || ''}"`,
        `"${issue.status || ''}"`,
        `"${issue.author_name || ''}"`,
        issue.vote_count || 0,
        issue.comment_count || 0,
        issue.created_at || '',
        issue.updated_at || '',
      ]
      csvRows.push(row.join(','))
    })

    const csv = csvRows.join('\n')

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="issues-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })

  } catch (error) {
    console.error('Error in export API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}