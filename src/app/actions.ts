'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function deleteIssue(issueId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to delete an issue' }
  }

  // Check if user owns this issue
  const { data: issue } = await supabase
    .from('issues')
    .select('user_id')
    .eq('id', issueId)
    .single()

  if (!issue) {
    return { error: 'Issue not found' }
  }

  if (issue.user_id !== user.id) {
    return { error: 'You can only delete your own posts' }
  }

  // Delete the issue (this will cascade delete votes and comments due to foreign key constraints)
  const { error: deleteError } = await supabase
    .from('issues')
    .delete()
    .eq('id', issueId)

  if (deleteError) {
    console.error('Delete error:', deleteError)
    return { error: 'Failed to delete issue' }
  }

  // Revalidate and redirect
  revalidatePath('/landing')
  redirect('/landing')
}