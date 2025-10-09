import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our database tables
export type Issue = {
  id: string
  title: string
  description: string
  category: string | null
  city: string
  zip_code: string | null
  status: string
  image_url: string | null
  author_name: string | null
  vote_count: number
  comment_count: number
  created_at: string
  user_id: string | null
}

export type Profile = {
  id: string
  email: string | null
  full_name: string | null
  city: string | null
  zip_code: string | null
  created_at: string
}

// Helper function to get current user session
export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    return null
  }

  // Get user profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return {
    user: session.user,
    profile: profile
  }
}