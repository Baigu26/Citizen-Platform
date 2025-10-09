'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createIssue(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to create an issue' }
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: 'Profile not found' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const city = formData.get('city') as string
  const zip_code = formData.get('zip_code') as string

  // Validation
  if (!title?.trim()) {
    return { error: 'Title is required' }
  }

  if (!description?.trim()) {
    return { error: 'Description is required' }
  }

  if (!city?.trim()) {
    return { error: 'City is required' }
  }

  // Insert the issue
  const { data, error: insertError } = await supabase
    .from('issues')
    .insert([
      {
        title: title.trim(),
        description: description.trim(),
        category: category?.trim() || null,
        city: city.trim(),
        zip_code: zip_code?.trim() || null,
        author_name: profile.full_name,
        user_id: user.id,
        status: 'Open',
        vote_count: 0,
        comment_count: 0,
      }
    ])
    .select()
    .single()

  if (insertError) {
    console.error('Insert error:', insertError)
    return { error: insertError.message }
  }

  revalidatePath('/')
  redirect(`/issue/${data.id}`)
}