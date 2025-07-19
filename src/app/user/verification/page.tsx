/* eslint-disable @typescript-eslint/no-explicit-any */
// app/verification/page.tsx
"use client"

import { submitVerificationRequest } from '@/lib/profile'
import { useState } from 'react'
 
export default function VerificationPage() {
  const [documentType, setDocumentType] = useState<'passport' | 'driving_license' | 'id_card'>('passport')
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [status, setStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!frontImage) {
      setError('Please upload front image of your document')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Fake upload - just get file info
      const frontInfo = {
        name: frontImage.name,
        size: frontImage.size,
        type: frontImage.type
      }

      let backInfo = null
      if (backImage) {
        backInfo = {
          name: backImage.name,
          size: backImage.size,
          type: backImage.type
        }
      }

      // Submit verification request (without actual upload)
      const result = await submitVerificationRequest(
        documentType,
        frontInfo,
        backInfo
      )

      if (result.error) {
        throw new Error(result.error)
      }

      setSuccess(true)
      setStatus('pending')
    } catch (err: any) {
      console.error('Verification error:', err)
      setError(err.message || 'Failed to submit verification')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Identity Verification</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {status === 'unverified' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as 'passport' | 'driving_license' | 'id_card')}
              className="w-full p-2 border rounded"
              required
            >
              <option value="passport">Passport</option>
              <option value="driving_license">Driver&apos;s License</option>
              <option value="id_card">National ID Card</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Front Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Back Image (if applicable)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBackImage(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
            />
          </div>

          {success && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              Verification request submitted successfully! Our team will review your documents shortly.
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? 'Submitting...' : 'Submit Verification'}
          </button>
        </form>
      )}

      {status === 'pending' && (
        <div className="text-center p-6 bg-yellow-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Verification Pending</h2>
          <p className="text-gray-600">Your documents are under review. This process typically takes 1-2 business days.</p>
        </div>
      )}

      {status === 'verified' && (
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Identity Verified</h2>
          <p className="text-gray-600">Your account has been successfully verified.</p>
        </div>
      )}
    </div>
  )
}