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

    const { action, issueIds, status, category } = await request.json()

    // Validate input
    if (!action || !issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'update-status':
        if (!status) {
          return NextResponse.json(
            { error: 'Status is required' },
            { status: 400 }
          )
        }

        // If admin has a city restriction, filter issues
        if (profile.admin_city && profile.admin_city !== 'all') {
          const { data: issues } = await supabase
            .from('issues')
            .select('id, city')
            .in('id', issueIds)

          const validIssueIds = issues
            ?.filter(issue => issue.city === profile.admin_city)
            .map(issue => issue.id) || []

          if (validIssueIds.length === 0) {
            return NextResponse.json(
              { error: 'No issues found in your jurisdiction' },
              { status: 403 }
            )
          }

          result = await supabase
            .from('issues')
            .update({ 
              status,
              updated_at: new Date().toISOString()
            })
            .in('id', validIssueIds)
        } else {
          result = await supabase
            .from('issues')
            .update({ 
              status,
              updated_at: new Date().toISOString()
            })
            .in('id', issueIds)
        }
        break

      case 'update-category':
        if (!category) {
          return NextResponse.json(
            { error: 'Category is required' },
            { status: 400 }
          )
        }

        // If admin has a city restriction, filter issues
        if (profile.admin_city && profile.admin_city !== 'all') {
          const { data: issues } = await supabase
            .from('issues')
            .select('id, city')
            .in('id', issueIds)

          const validIssueIds = issues
            ?.filter(issue => issue.city === profile.admin_city)
            .map(issue => issue.id) || []

          if (validIssueIds.length === 0) {
            return NextResponse.json(
              { error: 'No issues found in your jurisdiction' },
              { status: 403 }
            )
          }

          result = await supabase
            .from('issues')
            .update({ 
              category,
              updated_at: new Date().toISOString()
            })
            .in('id', validIssueIds)
        } else {
          result = await supabase
            .from('issues')
            .update({ 
              category,
              updated_at: new Date().toISOString()
            })
            .in('id', issueIds)
        }
        break

      case 'delete':
        // If admin has a city restriction, filter issues
        if (profile.admin_city && profile.admin_city !== 'all') {
          const { data: issues } = await supabase
            .from('issues')
            .select('id, city')
            .in('id', issueIds)

          const validIssueIds = issues
            ?.filter(issue => issue.city === profile.admin_city)
            .map(issue => issue.id) || []

          if (validIssueIds.length === 0) {
            return NextResponse.json(
              { error: 'No issues found in your jurisdiction' },
              { status: 403 }
            )
          }

          result = await supabase
            .from('issues')
            .delete()
            .in('id', validIssueIds)
        } else {
          result = await supabase
            .from('issues')
            .delete()
            .in('id', issueIds)
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    if (result.error) {
      console.error('Error performing bulk action:', result.error)
      return NextResponse.json(
        { error: 'Failed to perform bulk action' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: `Successfully performed ${action} on ${issueIds.length} issue(s)`
    })

  } catch (error) {
    console.error('Error in bulk action API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}