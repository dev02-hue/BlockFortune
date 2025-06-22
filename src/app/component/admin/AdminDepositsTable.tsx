'use client'

import { useState, useEffect } from 'react'
 import { supabase } from '@/lib/supabaseClient'
import { approveBlockFortuneDeposit, rejectBlockFortuneDeposit } from '@/lib/deposit'

type Deposit = {
  id: string
  user_id: string
  user_email: string
  amount: number
  crypto_type: string
  wallet_address: string
  reference: string
  narration: string
  status: 'pending' | 'completed' | 'rejected'
  created_at: string
  admin_notes?: string
}

export default function AdminDepositsTable() {
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPendingDeposits = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('blockfortunedeposits')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: true })

        if (error) throw error
        setDeposits(data || [])
      } catch (err) {
        console.error('Error fetching deposits:', err)
        setError('Failed to load deposits')
      } finally {
        setLoading(false)
      }
    }

    fetchPendingDeposits()

    // Set up real-time subscription
    
  }, [])

  const handleApprove = async (depositId: string) => {
    try {
      setLoading(true)
      const result = await approveBlockFortuneDeposit(depositId)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Remove the approved deposit from the list
      setDeposits(prev => prev.filter(d => d.id !== depositId))
    } catch (err) {
      console.error('Approval failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to approve deposit')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedDepositId) return
    
    try {
      setLoading(true)
      const result = await rejectBlockFortuneDeposit(selectedDepositId, rejectNote)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Remove the rejected deposit from the list
      setDeposits(prev => prev.filter(d => d.id !== selectedDepositId))
      setSelectedDepositId(null)
      setRejectNote('')
    } catch (err) {
      console.error('Rejection failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to reject deposit')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading && deposits.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      {/* Reject Confirmation Modal */}
      {selectedDepositId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Deposit</h3>
            <p className="mb-2">Please provide a reason for rejecting this deposit:</p>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Reason for rejection..."
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedDepositId(null)
                  setRejectNote('')
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className={`px-4 py-2 text-white rounded-md ${
                  loading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? 'Processing...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deposits.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No pending deposits found</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crypto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deposits.map((deposit) => (
              <tr key={deposit.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{deposit.user_email}</div>
                  <div className="text-sm text-gray-500">ID: {deposit.user_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${deposit.amount.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{deposit.crypto_type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-500 max-w-xs truncate">{deposit.wallet_address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{deposit.reference}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(deposit.created_at)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(deposit.id)}
                      disabled={loading}
                      className={`px-3 py-1 rounded-md text-white ${
                        loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedDepositId(deposit.id)}
                      disabled={loading}
                      className={`px-3 py-1 rounded-md text-white ${
                        loading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}