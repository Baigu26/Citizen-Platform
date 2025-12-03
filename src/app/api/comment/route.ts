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
      .select('full_name, is_admin, admin_city')
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

    // Check if user is admin and set appropriate display name
    const isAdmin = profile.is_admin || false
    const displayName = isAdmin 
      ? `Administrator - ${profile.admin_city}` 
      : (profile.full_name || 'Anonymous')

    // Insert the comment
    const { data: comment, error: insertError } = await supabase
      .from('comments')
      .insert({
        issue_id: issueId,
        user_id: user.id,
        content: content.trim(),
        author_name: displayName,
        parent_comment_id: parentCommentId || null,
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

    // --- CREATE NOTIFICATIONS ---
    
    // Get the issue to find the author
    const { data: issue } = await supabase
      .from('issues')
      .select('user_id, title')
      .eq('id', issueId)
      .single()

    if (issue) {
      const notifications = []

      if (parentCommentId) {
        // This is a reply to a comment
        // Get the parent comment to find who to notify
        const { data: parentComment } = await supabase
          .from('comments')
          .select('user_id, author_name')
          .eq('id', parentCommentId)
          .single()

        // Notify the parent comment author (if not the same user)
        if (parentComment && parentComment.user_id !== user.id) {
          notifications.push({
            user_id: parentComment.user_id,
            type: 'reply',
            message: `${displayName} replied to your comment`,
            issue_id: issueId,
            comment_id: comment.id,
            triggered_by_user_id: user.id,
            triggered_by_name: displayName,
          })
        }

        // Also notify the issue author if they're not the parent comment author and not the commenter
        if (issue.user_id && 
            issue.user_id !== user.id && 
            issue.user_id !== parentComment?.user_id) {
          notifications.push({
            user_id: issue.user_id,
            type: 'comment',
            message: `${displayName} commented on your issue "${issue.title}"`,
            issue_id: issueId,
            comment_id: comment.id,
            triggered_by_user_id: user.id,
            triggered_by_name: displayName,
          })
        }

        // Get all other users who have replied to the same parent comment (thread participants)
        const { data: threadComments } = await supabase
          .from('comments')
          .select('user_id')
          .eq('parent_comment_id', parentCommentId)
          .neq('user_id', user.id)

        if (threadComments) {
          const notifiedUserIds = new Set([
            user.id,
            parentComment?.user_id,
            issue.user_id
          ].filter(Boolean))

          const uniqueThreadUsers = [...new Set(threadComments.map(c => c.user_id))]
            .filter(uid => !notifiedUserIds.has(uid))

          for (const threadUserId of uniqueThreadUsers) {
            notifications.push({
              user_id: threadUserId,
              type: 'reply',
              message: `${displayName} also replied in a thread you're part of`,
              issue_id: issueId,
              comment_id: comment.id,
              triggered_by_user_id: user.id,
              triggered_by_name: displayName,
            })
          }
        }

      } else {
        // This is a top-level comment on the issue
        // Notify the issue author (if not the same user)
        if (issue.user_id && issue.user_id !== user.id) {
          const notificationType = isAdmin ? 'official_response' : 'comment'
          const message = isAdmin
            ? `A city official commented on your issue "${issue.title}"`
            : `${displayName} commented on your issue "${issue.title}"`

          notifications.push({
            user_id: issue.user_id,
            type: notificationType,
            message,
            issue_id: issueId,
            comment_id: comment.id,
            triggered_by_user_id: user.id,
            triggered_by_name: displayName,
          })
        }
      }

      // Insert all notifications
      if (notifications.length > 0) {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert(notifications)

        if (notifError) {
          console.error('Error creating notifications:', notifError)
          // Don't fail the request, just log the error
        }
      }
    }

    // Revalidate the issue page to show new comment
    revalidatePath(`/issue/${issueId}`)
    revalidatePath(`/admin/issue/${issueId}`)

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
      .eq('user_id', user.id)

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
      revalidatePath(`/admin/issue/${issueId}`)
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