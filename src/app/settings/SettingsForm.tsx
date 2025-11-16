'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Profile = {
  id: string
  full_name: string
  email: string
  city: string
  zip_code?: string
  email_notifications?: boolean
  status_notifications?: boolean
  comment_notifications?: boolean
}

export default function SettingsForm({ profile }: { profile: Profile }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'account' | 'privacy'>('profile')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: profile.full_name || '',
    city: profile.city || '',
    zip_code: profile.zip_code || '',
  })

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    email_notifications: profile.email_notifications ?? true,
    status_notifications: profile.status_notifications ?? true,
    comment_notifications: profile.comment_notifications ?? true,
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Save profile changes
  const handleSaveProfile = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Check if user is still authenticated
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' })
        setSaving(false)
        setTimeout(() => {
          window.location.href = '/login?redirect=/settings'
        }, 2000)
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          city: profileData.city,
          zip_code: profileData.zip_code,
        })
        .eq('id', profile.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  // Save notification preferences
  const handleSaveNotifications = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Check session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' })
        setSaving(false)
        setTimeout(() => {
          window.location.href = '/login?redirect=/settings'
        }, 2000)
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update(notifications)
        .eq('id', profile.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Notification preferences saved!' })
    } catch (error) {
      console.error('Error updating notifications:', error)
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save preferences. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  // Change password
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters!' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      // Check session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' })
        setSaving(false)
        setTimeout(() => {
          window.location.href = '/login?redirect=/settings'
        }, 2000)
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Error changing password:', error)
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to change password.' })
    } finally {
      setSaving(false)
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone. All your posts and comments will be deleted.'
    )

    if (!confirmed) return

    const doubleConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    )

    if (doubleConfirm !== 'DELETE') {
      setMessage({ type: 'error', text: 'Account deletion cancelled.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      // Delete user's data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id)

      if (profileError) throw profileError

      // Sign out
      await supabase.auth.signOut()

      // Redirect to home
      window.location.href = '/landing'
    } catch (error) {
      console.error('Error deleting account:', error)
      setMessage({ type: 'error', text: 'Failed to delete account. Please contact support.' })
      setSaving(false)
    }
  }

  // Download user data
  const handleDownloadData = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Check session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' })
        setSaving(false)
        setTimeout(() => {
          window.location.href = '/login?redirect=/settings'
        }, 2000)
        return
      }

      // Fetch user's issues
      const { data: issues } = await supabase
        .from('issues')
        .select('*')
        .eq('user_id', profile.id)

      // Fetch user's comments
      const { data: comments } = await supabase
        .from('comments')
        .select('*')
        .eq('user_id', profile.id)

      // Fetch user's votes
      const { data: votes } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', profile.id)

      // Compile all data
      const userData = {
        profile: {
          email: profile.email,
          full_name: profile.full_name,
          city: profile.city,
          zip_code: profile.zip_code,
        },
        issues: issues || [],
        comments: comments || [],
        votes: votes || [],
        exported_at: new Date().toISOString(),
      }

      // Create downloadable file
      const dataStr = JSON.stringify(userData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `peoples-voice-data-${new Date().toISOString().split('T')[0]}.json`
      link.click()

      setMessage({ type: 'success', text: 'Your data has been downloaded!' })
    } catch (error) {
      console.error('Error downloading data:', error)
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to download data. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'notifications'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'account'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'privacy'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Privacy & Data
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Information</h2>
                <p className="text-gray-600">Update your personal information and location.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select your city</option>
                    <option value="Boston">Boston</option>
                    <option value="Cambridge">Cambridge</option>
                    <option value="Brookline">Brookline</option>
                    <option value="Worcester">Worcester</option>
                    <option value="Quincy">Quincy</option>
                    <option value="Braintree">Braintree</option>
                    <option value="Somerville">Somerville</option>
                    <option value="Lowell">Lowell</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Zip Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={profileData.zip_code}
                    onChange={(e) => setProfileData({ ...profileData, zip_code: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="02101"
                    maxLength={5}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Notifications</h2>
                <p className="text-gray-600">Choose what updates you want to receive.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">All Email Notifications</h3>
                    <p className="text-sm text-gray-600">
                      Receive email updates about your activity
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.email_notifications}
                      onChange={(e) =>
                        setNotifications({ ...notifications, email_notifications: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Status Updates</h3>
                    <p className="text-sm text-gray-600">
                      When an issue you posted or follow changes status
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.status_notifications}
                      onChange={(e) =>
                        setNotifications({ ...notifications, status_notifications: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Comment Replies</h3>
                    <p className="text-sm text-gray-600">
                      When someone replies to your comment
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.comment_notifications}
                      onChange={(e) =>
                        setNotifications({ ...notifications, comment_notifications: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Notification Preferences'}
              </button>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-8">
              {/* Change Password Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h2>
                  <p className="text-gray-600">Update your password to keep your account secure.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>

              {/* Delete Account Section */}
              <div className="border-t border-gray-200 pt-8">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Delete Account</h2>
                    <p className="text-gray-600">
                      Permanently delete your account and all associated data. This action cannot be
                      undone.
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-800 mb-2">⚠️ Warning</h3>
                    <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                      <li>All your posts will be permanently deleted</li>
                      <li>All your comments will be permanently deleted</li>
                      <li>Your voting history will be removed</li>
                      <li>This action cannot be undone</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={saving}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Deleting Account...' : 'Delete My Account'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Data Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Data & Privacy</h2>
                <p className="text-gray-600">
                  Learn what data we collect and download your information.
                </p>
              </div>

              {/* What We Collect */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-blue-900 mb-4">📊 What We Collect</h3>
                <ul className="space-y-2 text-blue-800">
                  <li>✓ Email address (for login and notifications)</li>
                  <li>✓ Full name (displayed on posts and comments)</li>
                  <li>✓ City and zip code (for issue filtering)</li>
                  <li>✓ Posts, comments, and votes (public civic engagement)</li>
                  <li>✓ Notification preferences (your settings)</li>
                </ul>
              </div>

              {/* Who Can See */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-bold text-green-900 mb-4">👁️ Who Can See Your Data</h3>
                <ul className="space-y-2 text-green-800">
                  <li>✓ <strong>Other users:</strong> Your name, city, posts, and comments</li>
                  <li>✓ <strong>City officials:</strong> Your posts in their city</li>
                  <li>✓ <strong>Platform admins:</strong> All data (for moderation)</li>
                  <li>✗ <strong>Third parties:</strong> We NEVER sell your data</li>
                </ul>
              </div>

              {/* Your Rights */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-bold text-purple-900 mb-4">⚖️ Your Rights</h3>
                <ul className="space-y-2 text-purple-800">
                  <li>✓ Download all your data (button below)</li>
                  <li>✓ Edit your profile information (Profile tab)</li>
                  <li>✓ Control notification settings (Notifications tab)</li>
                  <li>✓ Delete your account (Account tab)</li>
                  <li>✓ Opt out of emails anytime</li>
                </ul>
              </div>

              {/* Download Data Button */}
              <button
                onClick={handleDownloadData}
                disabled={saving}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                {saving ? 'Preparing Download...' : 'Download My Data (JSON)'}
              </button>

              <p className="text-sm text-gray-600 text-center">
                Need help? Contact us at{' '}
                <a href="mailto:privacy@peoplesvoice.com" className="text-blue-600 hover:underline">
                  privacy@peoplesvoice.com
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}