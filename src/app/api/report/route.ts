import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to report content' },
        { status: 401 }
      )
    }

    const { issueId, reason, description } = await request.json()

    if (!issueId || !reason) {
      return NextResponse.json(
        { error: 'Issue ID and reason are required' },
        { status: 400 }
      )
    }

    // Check if user already reported this issue
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('issue_id', issueId)
      .eq('reporter_user_id', user.id)
      .single()

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this issue' },
        { status: 400 }
      )
    }

    // Create the report
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        issue_id: issueId,
        reporter_user_id: user.id,
        reason,
        description: description || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating report:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit report' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, report })

  } catch (error) {
    console.error('Error in report API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}