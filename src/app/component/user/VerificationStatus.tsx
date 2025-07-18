'use client'

import { getVerificationStatus } from '@/lib/verification'
import { useEffect, useState } from 'react'
 
export default function VerificationStatus() {
  const [status, setStatus] = useState<{
    status?: string
    verificationId?: string
    submittedAt?: string
    adminNotes?: string
    error?: string
  }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true)
        const result = await getVerificationStatus()
        if (result.error) {
          setStatus({ error: result.error })
        } else {
          setStatus(result)
        }
      } catch (err) {
        console.log(err);
        
        setStatus({ error: 'Failed to load verification status' })
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  if (loading) {
    return <div className="p-4 text-center">Loading verification status...</div>
  }

  if (status.error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        Error: {status.error}
      </div>
    )
  }

  if (!status.status || status.status === 'unverified') {
    return null // Don't show anything if not verified or no status
  }

  const statusMessages = {
    pending: {
      title: 'Verification Pending',
      message: 'Your verification is under review. Please wait for our team to process your request.',
      color: 'bg-yellow-50 text-yellow-800'
    },
    verified: {
      title: 'Verified',
      message: 'Your identity has been successfully verified.',
      color: 'bg-green-50 text-green-800'
    },
    rejected: {
      title: 'Verification Rejected',
      message: status.adminNotes || 'Your verification request was not approved.',
      color: 'bg-red-50 text-red-800'
    }
  }

  const currentStatus = statusMessages[status.status as keyof typeof statusMessages] || 
    statusMessages.pending

  return (
    <div className={`p-4 rounded-lg mb-6 ${currentStatus.color}`}>
      <h3 className="font-medium">{currentStatus.title}</h3>
      <p className="mt-1 text-sm">{currentStatus.message}</p>
      {status.submittedAt && (
        <p className="mt-2 text-xs opacity-75">
          Submitted on: {new Date(status.submittedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}