'use client'

import { useState, useEffect, useCallback } from 'react'
import { Profile } from '@/lib/supabase'
import { createIssue } from '@/app/create-issue/actions'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'
import { findSimilarIssues } from '@/utils/similarity'
import DuplicateWarningModal from './DuplicateWarningModal'

type CreateIssueFormProps = {
  profile: Profile
}

// Type for similar issues
type SimilarIssue = {
  id: string
  title: string
  description: string
  vote_count: number
  comment_count: number
  city: string
  category: string
  created_at: string
}

// Type for the draft data we save to localStorage
type DraftData = {
  title: string
  description: string
  why_it_matters: string
  category: string
  city: string
  zip_code: string
  timestamp: number
}

const DRAFT_KEY = 'issue_draft' // Key for localStorage

// List of major Massachusetts cities
const MA_CITIES = [
  'Boston',
  'Worcester',
  'Springfield',
  'Cambridge',
  'Lowell',
  'Brockton',
  'Quincy',
  'Lynn',
  'New Bedford',
  'Fall River',
  'Newton',
  'Somerville',
  'Framingham',
  'Lawrence',
  'Waltham',
  'Haverhill',
  'Malden',
  'Brookline',
  'Plymouth',
  'Medford',
  'Taunton',
  'Chicopee',
  'Weymouth',
  'Revere',
  'Peabody',
  'Methuen',
  'Barnstable',
  'Pittsfield',
  'Attleboro',
  'Arlington',
  'Everett',
  'Salem',
  'Westfield',
  'Leominster',
  'Fitchburg',
  'Beverly',
  'Holyoke',
  'Marlborough',
  'Woburn',
  'Chelsea',
  'Amherst',
  'Braintree',
  'Shrewsbury',
  'Dartmouth',
  'Billerica',
  'Randolph',
  'Tewksbury',
  'Natick',
  'Northampton',
  'Gloucester',
  'Franklin',
  'Watertown',
  'Needham',
  'Chelmsford',
  'Agawam',
  'Andover',
  'West Springfield',
  'Wellesley',
  'Melrose',
  'Milford',
  'Milton',
  'Dracut',
  'Southbridge',
  'Stoughton',
  'Lexington',
  'Burlington',
  'Easton',
  'Mansfield',
  'Westford',
  'Winchester',
  'Norwood',
  'Reading',
  'Belmont',
  'Dedham',
  'Wilmington',
  'Grafton',
  'Middleborough',
  'Gardner',
  'Danvers',
  'Auburn',
  'Wakefield',
  'Ludlow',
  'Saugus',
  'Canton',
  'Newburyport',
  'Falmouth',
  'Winthrop',
  'Stoneham',
  'Marshfield',
  'Acton',
  'Somerset',
  'Longmeadow',
  'North Andover',
  'Fairhaven',
  'Bridgewater',
  'Scituate',
  'Yarmouth',
].sort()

export default function CreateIssueForm({ profile }: CreateIssueFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // Duplicate detection state
  const [similarIssues, setSimilarIssues] = useState<SimilarIssue[]>([])
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(false)
  
  // Form values for controlled inputs (so we can save drafts)
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    why_it_matters: '',
    category: '',
    city: profile.city || '',
    zip_code: profile.zip_code || ''
  })

  // Load draft from localStorage when component mounts
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (savedDraft) {
      try {
        const draft: DraftData = JSON.parse(savedDraft)
        // Only load if draft is less than 7 days old
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        if (draft.timestamp > sevenDaysAgo) {
          setFormValues(draft)
          console.log('Draft loaded from localStorage')
        } else {
          // Clear old draft
          localStorage.removeItem(DRAFT_KEY)
        }
      } catch (e) {
        console.error('Error loading draft:', e)
        localStorage.removeItem(DRAFT_KEY)
      }
    }
  }, [])

  // Save draft to localStorage whenever form values change
  useEffect(() => {
    // Only save if there's actual content
    if (formValues.title.trim() || formValues.description.trim() || formValues.why_it_matters.trim()) {
      const draft: DraftData = {
        ...formValues,
        timestamp: Date.now()
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }
  }, [formValues])

  // Check for similar issues when title changes
  const checkForDuplicates = useCallback(async (title: string) => {
    if (title.trim().length < 10) {
      setSimilarIssues([])
      return
    }

    console.log('🔍 Checking for duplicates...', { title, city: formValues.city || profile.city })

    try {
      const supabase = createClient()
      
      // Get recent issues from the same city
      const { data: issues, error } = await supabase
        .from('issues')
        .select('id, title, description, vote_count, comment_count, city, category, created_at')
        .eq('city', formValues.city || profile.city)
        .order('created_at', { ascending: false })
        .limit(100) // Check last 100 issues

      console.log('📊 Fetched issues:', issues?.length || 0, 'issues')

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }

      if (issues && issues.length > 0) {
        // Find similar issues using our similarity algorithm
        const similar = findSimilarIssues(title, issues, 0.5)
        console.log('🎯 Similar issues found:', similar.length)
        if (similar.length > 0) {
          console.log('Similar issues:', similar.map(i => i.title))
        }
        setSimilarIssues(similar)
      } else {
        console.log('📭 No issues in database')
        setSimilarIssues([])
      }
    } catch (error) {
      console.error('💥 Error checking for duplicates:', error)
    }
  }, [formValues.city, profile.city])

  // Debounced duplicate check (wait 500ms after user stops typing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkForDuplicates(formValues.title)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formValues.title, checkForDuplicates])

  // Handle form value changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormValues(prev => ({ ...prev, [name]: value }))
  }

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        e.target.value = ''
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('File must be an image')
        e.target.value = ''
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    } else {
      setImagePreview(null)
    }
  }

  async function handleSubmit(formData: FormData) {
    // If there are similar issues and we haven't confirmed to continue
    if (similarIssues.length > 0 && !pendingSubmit) {
      setShowDuplicateModal(true)
      return
    }

    setIsSubmitting(true)
    setError(null)

    // Clear draft IMMEDIATELY when submitting (before the API call)
    // This ensures it's cleared before any redirect happens
    localStorage.removeItem(DRAFT_KEY)

    const result = await createIssue(formData)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
      setPendingSubmit(false)
      // Note: If there's an error, the form fields still have the data
      // The user can fix the error and resubmit
    }
    // On success, the action will redirect automatically
  }

  // Continue with submission after user confirms
  const handleContinueSubmit = () => {
    setPendingSubmit(true)
    setShowDuplicateModal(false)
    // Trigger form submission
    const form = document.getElementById('issue-form') as HTMLFormElement
    if (form) {
      form.requestSubmit()
    }
  }

  return (
    <>
      <form 
        id="issue-form"
        action={handleSubmit} 
        className="space-y-6"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Show info about draft if one exists */}
        {formValues.title && !isSubmitting && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              💾 Your draft is being saved automatically
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Posting as:</span> {profile.full_name}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Your name will be displayed as the author of this proposal.
          </p>
        </div>

        {/* 311 Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-yellow-600 flex-shrink-0 mt-0.5">⚠️</div>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Need to report an issue like potholes, trash pickup, or noise complaints?</p>
              <p>
                Those are handled through 311 →{' '}
                <a 
                  href="https://www.mass.gov/info-details/find-your-local-311-service" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-900 underline font-medium hover:text-yellow-700"
                >
                  Find your local 311 service
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Title field with duplicate warning */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formValues.title}
            onChange={handleInputChange}
            placeholder='Example: "Ban single-use plastic bags" or "Require crosswalk lights near schools"'
            maxLength={200}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Give your idea a short, clear title.
          </p>
          
          {/* Show inline warning if similar issues found */}
          {similarIssues.length > 0 && formValues.title.length > 10 && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Found {similarIssues.length} similar {similarIssues.length === 1 ? 'proposal' : 'proposals'}. 
                We'll show {similarIssues.length === 1 ? 'it' : 'them'} before you post.
              </p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What would you like to change? <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formValues.description}
            onChange={handleInputChange}
            placeholder="What rule, law, or regulation would you like to create or change? Focus on the policy itself. What should the city government require, allow, or improve?"
            rows={4}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Describe the policy, law, or regulation you want to create or change.
          </p>
        </div>

        <div>
          <label htmlFor="why_it_matters" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Why it matters <span className="text-red-500">*</span>
          </label>
          <textarea
            id="why_it_matters"
            name="why_it_matters"
            value={formValues.why_it_matters}
            onChange={handleInputChange}
            placeholder="Why should this law exist? What problem or opportunity does it address?"
            rows={4}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Explain the reasoning and impact of your proposal.
          </p>
        </div>

        {/* Image Upload Section */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Photo (Optional)
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
          </p>
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <Image
                src={imagePreview}
                alt="Preview"
                width={400}
                height={300}
                className="rounded-lg max-w-md h-auto border border-gray-300"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formValues.category}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="">Select a category</option>
            <option value="Environment & Sustainability">Environment & Sustainability</option>
            <option value="Housing & Zoning">Housing & Zoning</option>
            <option value="Transportation & Infrastructure">Transportation & Infrastructure</option>
            <option value="Public Safety">Public Safety</option>
            <option value="Health & Human Services">Health & Human Services</option>
            <option value="Education & Youth">Education & Youth</option>
            <option value="Governance & Transparency">Governance & Transparency</option>
            <option value="Economic Development">Economic Development</option>
          </select>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Not sure? Pick the one that fits best — our review team can reclassify later.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City Dropdown */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <select
              id="city"
              name="city"
              value={formValues.city}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            >
              <option value="">Select a city</option>
              {MA_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Zip Code
            </label>
            <input
              type="text"
              id="zip_code"
              name="zip_code"
              value={formValues.zip_code}
              onChange={handleInputChange}
              placeholder="e.g., 02101"
              maxLength={5}
              pattern="[0-9]{5}"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isSubmitting ? 'Submitting Proposal...' : 'Submit Proposal'}
            </button>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 px-4 py-3 font-medium"
            >
              Cancel
            </Link>
          </>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex gap-3">
            <div className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Before submitting:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Search to see if a similar proposal already exists</li>
                <li>Be respectful and constructive in your description</li>
                <li>Focus on the policy change, not individual complaints</li>
                <li>Your proposal will be visible to the public and local officials</li>
              </ul>
            </div>
          </div>
        </div>
      </form>

      {/* Duplicate warning modal */}
      <DuplicateWarningModal
        isOpen={showDuplicateModal}
        duplicates={similarIssues}
        onClose={() => {
          setShowDuplicateModal(false)
          setPendingSubmit(false)
        }}
        onContinue={handleContinueSubmit}
      />
    </>
  )
}