import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                // THESE ARE THE IMPORTANT ADDITIONS:
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              })
            })
          } catch (error) {
            // This can happen in Server Components
            // Just ignore it - middleware will handle it
          }
        },
      },
    }
  )
}

// Helper to get current user in server components
export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.log('❌ getCurrentUser failed:', error?.message || 'No user')
    return null
  }

  console.log('✅ getCurrentUser success:', user.id)

  // Get user profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.log('❌ Profile fetch failed:', profileError.message)
    return null
  }

  return {
    user: user,
    profile: profile
  }
}