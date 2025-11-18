import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const supabase = await createClient()

    // Search in titles and descriptions - ALL CITIES (public search)
    const { data: issues, error } = await supabase
      .from('issues')
      .select('id, title, city, category')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('vote_count', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Public search error:', error)
      return NextResponse.json({ suggestions: [] })
    }

    return NextResponse.json({ 
      suggestions: issues || [] 
    })
  } catch (error) {
    console.error('Public search API error:', error)
    return NextResponse.json({ suggestions: [] }, { status: 500 })
  }
}