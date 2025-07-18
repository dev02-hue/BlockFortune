/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import VerificationReviewModal from '@/app/component/user/VerificationReviewModal'
import { getPendingVerifications } from '@/lib/verification'
import { useEffect, useState } from 'react'
 
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

export default function AdminVerificationDashboard() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null)

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        setLoading(true)
        const result = await getPendingVerifications()
        if (result.error) {
          setError(result.error)
        } else {
          setVerifications(
            (result.verifications || []).map((verification: any) => ({
              id: verification.id,
              phone_number: verification.phone_number,
              id_document_url: verification.id_document_url,
              created_at: verification.created_at,
              blockfortuneprofile: verification.blockfortuneprofile?.[0] || undefined,
            }))
          )
        }
      } catch (err) {
        console.error('Error fetching verifications:', err)
        setError('Failed to load verifications')
      } finally {
        setLoading(false)
      }
    }

    fetchVerifications()
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    const result = await getPendingVerifications()
    if (!result.error) {
      setVerifications(
        (result.verifications || []).map((verification: any) => ({
          id: verification.id,
          phone_number: verification.phone_number,
          id_document_url: verification.id_document_url,
          created_at: verification.created_at,
          blockfortuneprofile: verification.blockfortuneprofile?.[0]
            ? {
                first_name: verification.blockfortuneprofile[0].first_name,
                last_name: verification.blockfortuneprofile[0].last_name,
                email: verification.blockfortuneprofile[0].email,
                username: verification.blockfortuneprofile[0].username,
              }
            : undefined,
        }))
      )
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="p-4 text-center">Loading verifications...</div>
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pending Verifications</h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      {verifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No pending verification requests
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {verifications.map((verification) => (
                <tr key={verification.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {verification.blockfortuneprofile?.first_name} {verification.blockfortuneprofile?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {verification.blockfortuneprofile?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(verification.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {verification.phone_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedVerification(verification)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedVerification && (
        <VerificationReviewModal
          verification={selectedVerification}
          onClose={() => setSelectedVerification(null)}
          onUpdate={handleRefresh}
        />
      )}
    </div>
  )
}