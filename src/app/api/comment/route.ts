import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get the current logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to comment' },
        { status: 401 }
      )
    }

    // Get user profile for author name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get the comment data from the request
    const { issueId, content, parentCommentId } = await request.json()

    // Validate the data
    if (!issueId) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      )
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be less than 2000 characters' },
        { status: 400 }
      )
    }

    // Insert the comment
    const { data: comment, error: insertError } = await supabase
      .from('comments')
      .insert({
        issue_id: issueId,
        user_id: user.id,
        parent_comment_id: parentCommentId || null,
        content: content.trim(),
        author_name: profile.full_name || 'Anonymous',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting comment:', insertError)
      return NextResponse.json(
        { error: 'Failed to post comment' },
        { status: 500 }
      )
    }

    // Revalidate the issue page to show new comment
    revalidatePath(`/issue/${issueId}`)

    return NextResponse.json({ 
      success: true, 
      comment 
    })

  } catch (error) {
    console.error('Error in comment API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get the current logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete comments' },
        { status: 401 }
      )
    }

    // Get the comment ID from the request
    const { commentId, issueId } = await request.json()

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // Delete the comment (RLS policies ensure user can only delete their own)
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id) // Extra safety check

    if (deleteError) {
      console.error('Error deleting comment:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      )
    }

    // Revalidate the issue page
    if (issueId) {
      revalidatePath(`/issue/${issueId}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in delete comment API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}