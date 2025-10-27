import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get the current logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to vote' },
        { status: 401 }
      )
    }

    // Get the vote data from the request
    const { issueId, voteType } = await request.json()

    // Validate the data
    if (!issueId) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      )
    }

    if (voteType !== null && voteType !== 'up' && voteType !== 'down') {
      return NextResponse.json(
        { error: 'Vote type must be "up", "down", or null' },
        { status: 400 }
      )
    }

    // Check if user already voted on this issue
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('issue_id', issueId)
      .single()

    if (voteType === null) {
      // Remove vote if voteType is null
      if (existingVote) {
        await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_id', issueId)
      }
    } else if (existingVote) {
      // Update existing vote
      await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('user_id', user.id)
        .eq('issue_id', issueId)
    } else {
      // Insert new vote
      await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          issue_id: issueId,
          vote_type: voteType,
        })
    }

    // Calculate the new vote count for this issue
    const { data: upvotes } = await supabase
      .from('votes')
      .select('id', { count: 'exact' })
      .eq('issue_id', issueId)
      .eq('vote_type', 'up')

    const { data: downvotes } = await supabase
      .from('votes')
      .select('id', { count: 'exact' })
      .eq('issue_id', issueId)
      .eq('vote_type', 'down')

    const upvoteCount = upvotes?.length || 0
    const downvoteCount = downvotes?.length || 0
    const totalVoteCount = upvoteCount - downvoteCount

    // Update the vote_count in the issues table
    await supabase
      .from('issues')
      .update({ vote_count: totalVoteCount })
      .eq('id', issueId)

    return NextResponse.json({ 
      success: true, 
      voteCount: totalVoteCount 
    })

  } catch (error) {
    console.error('Error in vote API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}