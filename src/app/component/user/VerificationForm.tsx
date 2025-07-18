'use client'

import { useState } from 'react'
 import { useRouter } from 'next/navigation'
import { submitVerificationRequest } from '@/lib/verification'
import { uploadFile } from '@/lib/storage'
 
export default function VerificationForm() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [idFile, setIdFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        setError('Please upload a JPEG, PNG, or PDF file')
        return
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      
      setIdFile(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!idFile) {
      setError('ID document is required')
      return
    }

    setIsSubmitting(true)

    try {
      // Upload ID document
      const idDocumentUrl = await uploadFile(idFile, 'verification-documents')
      
      // Submit verification request
      const result = await submitVerificationRequest(idDocumentUrl, phoneNumber)
      
      if (result.error) {
        throw new Error(result.error)
      }

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }


  if (success) {
    return (
      <div className="p-6 max-w-md mx-auto bg-green-50 rounded-lg">
        <h3 className="text-lg font-medium text-green-800">Verification Submitted</h3>
        <p className="mt-2 text-green-700">
          Your verification request has been submitted successfully. 
          Our team will review your documents and notify you once processed.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Identity Verification</h2>
      <p className="text-gray-600 mb-6">
        To comply with regulations, we need to verify your identity. 
        Please upload a government-issued ID and provide your phone number.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Government Issued ID
          </label>
          <input
  type="file"
  accept="image/*,.pdf"
  onChange={handleFileChange}  // Use the function here
  className="block w-full text-sm text-gray-500
    file:mr-4 file:py-2 file:px-4
    file:rounded-md file:border-0
    file:text-sm file:font-semibold
    file:bg-blue-50 file:text-blue-700
    hover:file:bg-blue-100"
  required
/>
          <p className="mt-1 text-xs text-gray-500">
            Upload a clear photo or scan of your passport, driver&apos;s license, or national ID card.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Verification'}
        </button>
      </form>
    </div>
  )
}