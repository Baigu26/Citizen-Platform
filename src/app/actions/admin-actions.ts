'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function adminSignup(formData: {
  email: string
  password: string
  full_name: string
  admin_city: string
  title: string
}) {
  try {
    console.log('=== ADMIN SIGNUP START ===')
    console.log('Email:', formData.email)
    console.log('City:', formData.admin_city)

    const supabase = await createClient()
    console.log('Supabase client created')

    // Create user
    console.log('Attempting to sign up user...')
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
          city: formData.admin_city,
          is_admin: true,
          admin_city: formData.admin_city,
          title: formData.title,
        }
      }
    })

    console.log('Signup response:', { 
      hasData: !!authData, 
      hasUser: !!authData?.user,
      hasError: !!signUpError,
      errorMessage: signUpError?.message,
      errorStatus: signUpError?.status
    })

    if (signUpError) {
      console.error('Signup error details:', signUpError)
      return { error: signUpError.message }
    }

    if (!authData.user) {
      console.error('No user data returned')
      return { error: 'Failed to create user - no user data returned' }
    }

    console.log('User created successfully:', authData.user.id)

    // Wait for profile to be created by trigger
    console.log('Waiting for profile creation...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Update profile to ensure admin status
    console.log('Updating profile to admin...')
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_admin: true,
        admin_city: formData.admin_city,
        city: formData.admin_city,
      })
      .eq('id', authData.user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Don't fail - just log it
    } else {
      console.log('Profile updated successfully')
    }

    console.log('=== ADMIN SIGNUP SUCCESS ===')

    // Revalidate to ensure fresh data
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('=== ADMIN SIGNUP FAILED ===')
    console.error('Unexpected error:', error)
    return { error: 'Failed to create admin account: ' + (error instanceof Error ? error.message : 'Unknown error') }
  }
}

export async function adminLogin(email: string, password: string) {
  try {
    console.log('=== ADMIN LOGIN START ===')
    console.log('Email:', email)

    const supabase = await createClient()

    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      console.error('Login error:', loginError)
      return { error: loginError.message }
    }

    if (!authData.user) {
      console.error('No user data after login')
      return { error: 'Login failed' }
    }

    console.log('User logged in:', authData.user.id)

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, admin_city')
      .eq('id', authData.user.id)
      .single()

    if (!profile?.is_admin) {
      console.log('User is not admin, logging out')
      await supabase.auth.signOut()
      return { error: 'This account is not authorized as a city official' }
    }

    console.log('Admin verified, city:', profile.admin_city)
    console.log('=== ADMIN LOGIN SUCCESS ===')

    // Revalidate the entire app layout to ensure fresh session
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('=== ADMIN LOGIN FAILED ===')
    console.error('Login error:', error)
    return { error: 'Login failed' }
  }
}