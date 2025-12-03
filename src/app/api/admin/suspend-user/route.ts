import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('is_admin, admin_city, full_name')
      .eq('id', user.id)
      .single()

    if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { userId, reason, action } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get the target user's profile to verify they're in admin's city
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('city')
      .eq('id', userId)
      .single()

    if (targetProfile?.city !== adminProfile.admin_city) {
      return NextResponse.json(
        { error: 'You can only manage users in your city' },
        { status: 403 }
      )
    }

    if (action === 'suspend') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspended_at: new Date().toISOString(),
          suspended_reason: reason || 'Violation of community guidelines',
          suspended_by: user.id,
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error suspending user:', updateError)
        return NextResponse.json({ error: 'Failed to suspend user' }, { status: 500 })
      }
    } else if (action === 'unsuspend') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspended_at: null,
          suspended_reason: null,
          suspended_by: null,
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error unsuspending user:', updateError)
        return NextResponse.json({ error: 'Failed to unsuspend user' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in suspend user API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}