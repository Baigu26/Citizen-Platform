'use client'

import { useState } from 'react'
import { Profile } from '@/lib/supabase'
import { createIssue } from '@/app/create-issue/actions'

type CreateIssueFormProps = {
  profile: Profile
}

export default function CreateIssueForm({ profile }: CreateIssueFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    const result = await createIssue(formData)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Posting as:</span> {profile.full_name}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Your name will be displayed as the author of this issue.
        </p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          placeholder="Briefly describe the issue"
          maxLength={200}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Provide detailed information about the issue, why it matters, and any suggested solutions..."
          rows={6}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          Be specific and provide context to help others understand the issue.
        </p>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          id="category"
          name="category"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white"
        >
          <option value="">Select a category (optional)</option>
          <option value="Safety">Safety</option>
          <option value="Transportation">Transportation</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Environment">Environment</option>
          <option value="Education">Education</option>
          <option value="Recreation">Recreation</option>
          <option value="Quality of Life">Quality of Life</option>
          <option value="Health">Health</option>
          <option value="Economy">Economy</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            defaultValue={profile.city || ''}
            placeholder="e.g., Boston"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-2">
            Zip Code
          </label>
          <input
            type="text"
            id="zip_code"
            name="zip_code"
            defaultValue={profile.zip_code || ''}
            placeholder="e.g., 02101"
            maxLength={5}
            pattern="[0-9]{5}"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Issue'}
          </button>
          <a
            href="/"
            className="text-gray-600 hover:text-gray-800 px-4 py-3 font-medium"
          >
            Cancel
          </a>
        </>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex gap-3">
          <div className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">ℹ️</div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Before posting:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Search to see if a similar issue already exists</li>
              <li>Be respectful and constructive in your description</li>
              <li>Include specific details (locations, dates, etc.)</li>
              <li>Your issue will be visible to the public and local officials</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  )
}