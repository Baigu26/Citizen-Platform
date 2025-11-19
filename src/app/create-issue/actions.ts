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
  const why_it_matters = formData.get('why_it_matters') as string
  const category = formData.get('category') as string
  const city = formData.get('city') as string
  const zip_code = formData.get('zip_code') as string
  const imageFile = formData.get('image') as File | null

  // Validation
  if (!title?.trim()) {
    return { error: 'Title is required' }
  }

  if (!description?.trim()) {
    return { error: 'Description is required' }
  }

  if (!why_it_matters?.trim()) {
    return { error: 'Why it matters is required' }
  }

  if (!city?.trim()) {
    return { error: 'City is required' }
  }

  if (!category?.trim()) {
    return { error: 'Category is required' }
  }

  // Handle image upload if provided
  let imageUrl: string | null = null
  
  if (imageFile && imageFile.size > 0) {
    // Create unique filename
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('issue-image')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: 'Failed to upload image' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('issue-image')
      .getPublicUrl(filePath)

    imageUrl = publicUrl
  }

  // Combine description and why_it_matters for storage
  // You can either store them separately or combine them
  const fullDescription = `${description.trim()}\n\n**Why it matters:**\n${why_it_matters.trim()}`

  // Insert the issue
  const { data, error: insertError } = await supabase
    .from('issues')
    .insert([
      {
        title: title.trim(),
        description: fullDescription, // Combined for now
        why_it_matters: why_it_matters.trim(), // Store separately too
        category: category.trim(),
        city: city.trim(),
        zip_code: zip_code?.trim() || null,
        author_name: profile.full_name,
        user_id: user.id,
        status: 'Open',
        vote_count: 0,
        comment_count: 0,
        image_url: imageUrl,
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