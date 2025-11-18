import { createClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    console.log('Admin search API called')
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const city = searchParams.get('city')

    console.log('Search params:', { query, city })

    if (!query || query.trim().length < 2) {
      console.log('Query too short or missing')
      return NextResponse.json({ suggestions: [] })
    }

    // Verify the user is an admin
    let currentUser
    try {
      currentUser = await getCurrentUser()
      console.log('Current user:', currentUser ? 'Found' : 'Not found')
    } catch (error) {
      console.error('Error getting current user:', error)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    if (!currentUser || !currentUser.profile.is_admin) {
      console.log('User not authorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchCity = city || currentUser.profile.admin_city
    console.log('Searching in city:', searchCity)

    const supabase = await createClient()

    // Clean the search query
    const cleanQuery = query.trim()
    console.log('Clean query:', cleanQuery)

    // Search in titles and descriptions, filtered by city
    const { data: issues, error } = await supabase
      .from('issues')
      .select('id, title, status, category, vote_count')
      .eq('city', searchCity)
      .or(`title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
      .order('vote_count', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Supabase search error:', error)
      return NextResponse.json({ 
        suggestions: [],
        error: error.message 
      }, { status: 500 })
    }

    console.log('Search results:', issues?.length || 0, 'issues found')

    return NextResponse.json({ 
      suggestions: issues || [] 
    })
  } catch (error) {
    console.error('Admin search API error:', error)
    return NextResponse.json({ 
      suggestions: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}