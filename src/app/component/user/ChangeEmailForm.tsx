// components/ChangeEmailForm.tsx
'use client'

import { changeAuthEmail } from '@/lib/auth'
import { useState } from 'react'
 
export default function ChangeEmailForm() {
  const [formData, setFormData] = useState({
    newEmail: '',
    confirmNewEmail: '',
    password: ''
  })
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const result = await changeAuthEmail(formData)

    if (result.error) {
      setMessage({ text: result.error, type: 'error' })
    } else {
      setMessage({ 
        text: result.message || 'Email changed successfully!', 
        type: 'success' 
      })
      setFormData({
        newEmail: '',
        confirmNewEmail: '',
        password: ''
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Change Email Address</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newEmail" className="block text-sm font-medium text-black">
            New Email
          </label>
          <input
            type="email"
            id="newEmail"
            name="newEmail"
            value={formData.newEmail}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-black focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="confirmNewEmail" className="block text-sm font-medium text-black">
            Confirm New Email
          </label>
          <input
            type="email"
            id="confirmNewEmail"
            name="confirmNewEmail"
            value={formData.confirmNewEmail}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-black focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-black">
            Current Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 text-black focus:border-blue-500"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Processing...' : 'Change Email'}
          </button>
        </div>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Note: Changing your email will require verification of the new address. 
        Your profile email in BlockFortune will remain unchanged.
      </p>
    </div>
  )
}