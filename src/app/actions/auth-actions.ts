'use server'

import { createClient } from '@/lib/supabase-server'
import { sendVerificationCode } from './send-verification-code'

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Request a verification code (using our custom system)
export async function requestOTP(email: string) {
  try {
    const supabase = await createClient()
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address' }
    }

    // Generate verification code
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Check if user exists in profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single()

    // If user doesn't exist, create a profile
    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          email,
          full_name: email.split('@')[0], // Default name from email
          created_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return { success: false, error: 'Failed to create user profile' }
      }
    }

    // Store verification code in database
    const { error: dbError } = await supabase
      .from('verification_codes')
      .insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
        used: false,
        attempts: 0
      })

    if (dbError) {
      console.error('Error storing verification code:', dbError)
      return { success: false, error: 'Failed to generate verification code' }
    }

    // Send verification code via email using Resend
    const emailResult = await sendVerificationCode(email, code)
    
    if (!emailResult.success) {
      return { success: false, error: 'Failed to send verification code. Please try again.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error requesting verification code:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function verifyOTP(email: string, code: string) {
  try {
    const supabase = await createClient()

    // Get the most recent unused verification code for this email
    const { data: verificationData, error: fetchError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !verificationData) {
      return { success: false, error: 'Invalid or expired verification code' }
    }

    // Check if code has expired
    if (new Date(verificationData.expires_at) < new Date()) {
      return { success: false, error: 'Verification code has expired. Please request a new one.' }
    }

    // Check if too many attempts
    if (verificationData.attempts >= 5) {
      return { success: false, error: 'Too many failed attempts. Please request a new code.' }
    }

    // Verify the code
    if (verificationData.code !== code) {
      // Increment attempts
      await supabase
        .from('verification_codes')
        .update({ attempts: verificationData.attempts + 1 })
        .eq('id', verificationData.id)

      return { success: false, error: 'Invalid verification code' }
    }

    // Mark code as used
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', verificationData.id)

    // Sign in the user using Supabase auth
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      }
    })

    if (signInError) {
      console.error('Error signing in:', signInError)
      // Continue anyway since we verified the code
    }

    return { success: true }
  } catch (error) {
    console.error('Error verifying code:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}