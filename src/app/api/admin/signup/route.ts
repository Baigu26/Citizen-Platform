import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { email, password, full_name, admin_city, title } = await request.json()

    // Validation
    if (!email || !password || !full_name || !admin_city) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Create admin user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: full_name.trim(),
          city: admin_city,
          is_admin: true,
          admin_city: admin_city,
          title: title?.trim() || '',
        }
      }
    })

    if (signUpError) {
      console.error('Signup error:', signUpError)
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No user data returned' },
        { status: 500 }
      )
    }

    // Update profile to set admin status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_admin: true,
        admin_city: admin_city,
        city: admin_city,
      })
      .eq('id', authData.user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Don't fail completely - user is created, they just need to update profile manually
    }

    return NextResponse.json({ 
      success: true,
      message: 'Admin account created successfully'
    })

  } catch (error) {
    console.error('Error in admin signup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}