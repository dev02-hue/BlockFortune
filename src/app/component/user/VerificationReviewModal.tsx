'use client'

import { useState } from 'react'
import { adminApproveVerification, adminRejectVerification } from '@/lib/verification'
import Image from 'next/image';


interface Verification {
  id: string
  phone_number: string
  id_document_url: string
  created_at: string
  blockfortuneprofile?: {
    first_name: string
    last_name: string
    email: string
    username: string
  }
}

interface VerificationReviewModalProps {
  verification: Verification
  onClose: () => void
  onUpdate: () => void
}

export default function VerificationReviewModal({
  verification,
  onClose,
  onUpdate
}: VerificationReviewModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (action === 'reject' && !notes.trim()) {
      setError('Notes are required when rejecting')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      let result
      if (action === 'approve') {
        result = await adminApproveVerification(verification.id, notes)
      } else {
        result = await adminRejectVerification(verification.id, notes)
      }

      if (result?.error) {
        throw new Error(result.error)
      }

      onUpdate()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900">
              Verify {verification.blockfortuneprofile?.first_name}&apos;s Identity
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">User Information</h4>
              <div className="mt-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-sm">
                    {verification.blockfortuneprofile?.first_name} {verification.blockfortuneprofile?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="text-sm">{verification.blockfortuneprofile?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm">{verification.blockfortuneprofile?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm">{verification.phone_number}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">ID Document</h4>
              <div className="mt-2">
              <Image
  src={verification.id_document_url}
  alt="ID Document"
  width={500} // or your preferred width
  height={300} // or your preferred height
  className="max-w-full h-auto border border-gray-200 rounded object-contain"
/>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">Admin Notes</h4>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                placeholder="Add any notes for the user (required for rejection)"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setAction('reject')
                  handleSubmit()
                }}
                disabled={isSubmitting}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
              >
                {isSubmitting && action === 'reject' ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAction('approve')
                  handleSubmit()
                }}
                disabled={isSubmitting}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
              >
                {isSubmitting && action === 'approve' ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}