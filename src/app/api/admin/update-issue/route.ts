import { createClient } from '@/lib/supabase-server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { sendOfficialResponseEmail } from '@/lib/email'

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

    // Check if user is admin - fetch both admin_city and city for fallback
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, admin_city, city')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get request data
    const { issueId, status, officialResponse, respondedBy } = await request.json()

    if (!issueId) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      )
    }

    // Get the full issue details (we need this for email)
    const { data: issue } = await supabase
      .from('issues')
      .select('city, user_id, title, official_response')
      .eq('id', issueId)
      .single()

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      )
    }

    // Check city with fallback (admin_city first, then city)
    const adminCity = profile.admin_city || profile.city
    if (issue.city !== adminCity) {
      return NextResponse.json(
        { error: 'You can only update issues in your city' },
        { status: 403 }
      )
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    
    if (status) {
      updateData.status = status
    }

    if (officialResponse !== undefined) {
      updateData.official_response = officialResponse
      if (officialResponse) {
        updateData.official_response_date = new Date().toISOString()
        updateData.responded_by = respondedBy
      } else {
        // Clear response fields if response is empty
        updateData.official_response_date = null
        updateData.responded_by = null
      }
    }

    // Update the issue
    const { error: updateError } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', issueId)

    if (updateError) {
      console.error('Error updating issue:', updateError)
      return NextResponse.json(
        { error: 'Failed to update issue' },
        { status: 500 }
      )
    }

    // Send email notification if official response was added (and it's new or changed)
    if (officialResponse && officialResponse !== issue.official_response) {
      try {
        // Create admin client with service role key
        const supabaseAdmin = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )

        // Get the issue creator's info from auth.users
        const { data: { user: issueCreator }, error: userError } = await supabaseAdmin.auth.admin.getUserById(issue.user_id)

        if (!userError && issueCreator?.email) {
          // Get the creator's profile for their name
          const { data: creatorProfile } = await supabaseAdmin
            .from('profiles')
            .select('full_name')
            .eq('id', issue.user_id)
            .single()

          // Send the email
          await sendOfficialResponseEmail({
            to: issueCreator.email,
            recipientName: creatorProfile?.full_name || 'Community Member',
            issueTitle: issue.title,
            issueId: issueId,
            officialResponse: officialResponse,
            respondedBy: respondedBy || 'City Official',
            city: issue.city,
          })

          console.log('✅ Email notification sent to:', issueCreator.email)
        } else {
          console.log('⚠️ Could not get user email:', userError)
        }
      } catch (emailError) {
        // Don't fail the request if email fails
        console.error('❌ Error sending email notification:', emailError)
      }
    }

    // Revalidate relevant pages
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/issues')
    revalidatePath(`/admin/issue/${issueId}`)
    revalidatePath(`/issue/${issueId}`)

    return NextResponse.json({ 
      success: true,
      message: 'Issue updated successfully'
    })

  } catch (error) {
    console.error('Error in admin update API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}