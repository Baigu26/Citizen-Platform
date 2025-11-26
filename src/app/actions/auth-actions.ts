'use server'

import { createClient } from '@/lib/supabase-server'

// Request OTP for LOGIN - only for existing users
export async function requestLoginOTP(email: string) {
  try {
    const supabase = await createClient()
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address' }
    }

    // Check if user exists in profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (!existingProfile) {
      return { 
        success: false, 
        error: 'No account found with this email. Please sign up first.',
        noAccount: true 
      }
    }

    // User exists, send OTP (don't create new user)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't create new users on login
        emailRedirectTo: undefined,
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

// Request OTP for SIGNUP - creates new users
export async function requestOTP(email: string) {
  try {
    const supabase = await createClient()
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address' }
    }

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return { 
        success: false, 
        error: 'An account with this email already exists. Please sign in instead.',
        hasAccount: true 
      }
    }

    // Send OTP and create user
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: undefined,
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

// Verify OTP for LOGIN - just verifies, doesn't create profile
export async function verifyLoginOTP(email: string, token: string) {
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

// Verify OTP for SIGNUP - creates/updates profile with full details
export async function verifyOTP(email: string, token: string, profileData?: {
  full_name: string
  city: string
  zip_code?: string
}) {
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

    // After successful verification, create the profile with full details
    if (data.user && profileData) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          full_name: profileData.full_name,
          city: profileData.city,
          zip_code: profileData.zip_code || null,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}