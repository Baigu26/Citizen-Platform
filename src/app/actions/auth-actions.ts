'use server'

import { createClient } from '@/lib/supabase-server'

// Request a verification code using Supabase's built-in OTP
export async function requestOTP(email: string) {
  try {
    const supabase = await createClient()
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address' }
    }

    // Check if user exists in profiles table, create if not
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single()

    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          email,
          full_name: email.split('@')[0],
          created_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    // Use Supabase's built-in OTP
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      }
    })

    if (error) {
      console.error('Error sending OTP:', error)
      return { success: false, error: 'Failed to send verification code' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error requesting OTP:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function verifyOTP(email: string, token: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })

    if (error) {
      console.error('Error verifying OTP:', error)
      return { success: false, error: 'Invalid verification code' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}