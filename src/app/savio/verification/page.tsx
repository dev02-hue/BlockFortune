/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { approveVerification, getPendingVerifications, rejectVerification } from '@/lib/profile'
import { useState, useEffect } from 'react'
 
export default function AdminVerificationPanel() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadRequests = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await getPendingVerifications()
      if (fetchError) throw new Error(fetchError)
      setPendingRequests(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load verification requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (userId: string) => {
    setError(null)
    setSuccess(null)
    try {
      if (!userId) throw new Error('No user ID provided')
      
      const { error: approveError } = await approveVerification(userId)
      if (approveError) throw new Error(approveError)
      
      setSuccess(`User verification approved successfully`)
      await loadRequests()
    } catch (err: any) {
      setError(err.message || 'Failed to approve verification')
    }
  }

  const handleReject = async (userId: string) => {
    setError(null)
    setSuccess(null)
    const reason = prompt('Please enter rejection reason:')
    if (!reason || reason.trim().length < 5) {
      setError('Rejection reason must be at least 5 characters')
      return
    }

    try {
      if (!userId) throw new Error('No user ID provided')
      
      const { error: rejectError } = await rejectVerification(userId, reason)
      if (rejectError) throw new Error(rejectError)
      
      setSuccess(`User verification rejected successfully`)
      await loadRequests()
    } catch (err: any) {
      setError(err.message || 'Failed to reject verification')
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Verification Requests</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading verification requests...</div>
      ) : pendingRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No pending verification requests</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Requested At</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4">
                    {request.first_name} {request.last_name}
                  </td>
                  <td className="px-6 py-4">{request.email}</td>
                  <td className="px-6 py-4">
                    {new Date(request.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}