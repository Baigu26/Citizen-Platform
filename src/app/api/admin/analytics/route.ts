import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
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

    const adminCity = profile.admin_city

    // Get all issues for admin's city
    const { data: issues } = await supabase
      .from('issues')
      .select('*')
      .eq('city', adminCity)

    if (!issues) {
      return NextResponse.json(
        { error: 'Failed to fetch issues' },
        { status: 500 }
      )
    }

    // Calculate analytics
    const analytics = {
      // Total counts
      totalIssues: issues.length,
      openIssues: issues.filter(i => i.status === 'Open').length,
      underReviewIssues: issues.filter(i => i.status === 'Under Review').length,
      inProgressIssues: issues.filter(i => i.status === 'In Progress').length,
      completedIssues: issues.filter(i => i.status === 'Completed').length,
      closedIssues: issues.filter(i => i.status === 'Closed').length,

      // Response metrics
      totalResponses: issues.filter(i => i.official_response).length,
      responseRate: issues.length > 0 
        ? ((issues.filter(i => i.official_response).length / issues.length) * 100).toFixed(1)
        : '0.0',

      // Engagement metrics
      totalVotes: issues.reduce((sum, i) => sum + (i.vote_count || 0), 0),
      totalComments: issues.reduce((sum, i) => sum + (i.comment_count || 0), 0),
      avgVotesPerIssue: issues.length > 0
        ? (issues.reduce((sum, i) => sum + (i.vote_count || 0), 0) / issues.length).toFixed(1)
        : '0.0',
      avgCommentsPerIssue: issues.length > 0
        ? (issues.reduce((sum, i) => sum + (i.comment_count || 0), 0) / issues.length).toFixed(1)
        : '0.0',

      // Category breakdown
      categoryBreakdown: issues.reduce((acc, issue) => {
        const cat = issue.category || 'Uncategorized'
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      }, {} as Record<string, number>),

      // Status breakdown
      statusBreakdown: {
        'Open': issues.filter(i => i.status === 'Open').length,
        'Under Review': issues.filter(i => i.status === 'Under Review').length,
        'In Progress': issues.filter(i => i.status === 'In Progress').length,
        'Completed': issues.filter(i => i.status === 'Completed').length,
        'Closed': issues.filter(i => i.status === 'Closed').length,
      },

      // Top issues by votes
      topIssuesByVotes: issues
        .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
        .slice(0, 5)
        .map(i => ({
          id: i.id,
          title: i.title,
          votes: i.vote_count,
          status: i.status,
        })),

      // Recent issues (last 7 days)
      recentIssuesCount: issues.filter(i => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(i.created_at) > weekAgo
      }).length,

      // Issues by day (last 30 days)
      issuesByDay: generateIssuesByDay(issues),
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Error in analytics API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate issues by day
function generateIssuesByDay(issues: {created_at: string}[]) {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split('T')[0]
  })

  const issuesByDay = last30Days.map(date => {
    const count = issues.filter(i => 
      i.created_at.split('T')[0] === date
    ).length
    return { date, count }
  })

  return issuesByDay
}