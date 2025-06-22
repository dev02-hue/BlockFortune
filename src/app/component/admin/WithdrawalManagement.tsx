'use client'

import { useState, useEffect } from 'react'
 import { supabase } from '@/lib/supabaseClient'
import { approveBlockFortuneWithdrawal, rejectBlockFortuneWithdrawal } from '@/lib/deposit'

type Withdrawal = {
  id: string
  user_id: string
  user_email: string
  amount: number
  crypto_type: string
  wallet_address: string
  status: 'pending' | 'completed' | 'rejected'
  reference: string
  created_at: string
  processed_at: string | null
  admin_notes: string | null
  network_fee: number
}

export default function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState('')
  const [rejectNotes, setRejectNotes] = useState('')
  const [currentRejectId, setCurrentRejectId] = useState('')

  // Fetch pending withdrawals
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('blockfortunewithdrawals')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        if (error) throw error
        setWithdrawals(data || [])
      } catch (err) {
        console.error('Failed to fetch withdrawals:', err)
        setError('Failed to load withdrawals')
      } finally {
        setLoading(false)
      }
    }

    fetchWithdrawals()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id)
      const result = await approveBlockFortuneWithdrawal(id)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      setWithdrawals(withdrawals.map(w => 
        w.id === id ? { ...w, status: 'completed' } : w
      ))
    } catch (err) {
      console.error('Approval failed:', err)
      setError(err instanceof Error ? err.message : 'Approval failed')
    } finally {
      setProcessingId('')
    }
  }

  const handleReject = async (id: string, notes: string) => {
    try {
      setProcessingId(id)
      const result = await rejectBlockFortuneWithdrawal(id, notes)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Update local state
      setWithdrawals(withdrawals.map(w => 
        w.id === id ? { ...w, status: 'rejected', admin_notes: notes } : w
      ))
      setRejectNotes('')
      setCurrentRejectId('')
    } catch (err) {
      console.error('Rejection failed:', err)
      setError(err instanceof Error ? err.message : 'Rejection failed')
    } finally {
      setProcessingId('')
    }
  }

  const openRejectModal = (id: string) => {
    setCurrentRejectId(id)
    setRejectNotes('')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Pending Withdrawal Requests</h1>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crypto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No pending withdrawals found
                </td>
              </tr>
            ) : (
              withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{withdrawal.user_email}</div>
                    <div className="text-sm text-gray-500">{withdrawal.user_id.slice(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${withdrawal.amount.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">Fee: {withdrawal.network_fee}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {withdrawal.crypto_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">{withdrawal.wallet_address.slice(0, 10)}...</div>
                    <div className="text-xs text-gray-500">{withdrawal.reference}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(withdrawal.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(withdrawal.id)}
                        disabled={processingId === withdrawal.id}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                      >
                        {processingId === withdrawal.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => openRejectModal(withdrawal.id)}
                        disabled={processingId === withdrawal.id}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rejection Modal */}
      {currentRejectId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Reason for Rejection</h3>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Enter reason for rejecting this withdrawal..."
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              rows={4}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setCurrentRejectId('')
                  setRejectNotes('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(currentRejectId, rejectNotes)}
                disabled={!rejectNotes.trim() || processingId === currentRejectId}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {processingId === currentRejectId ? 'Processing...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}