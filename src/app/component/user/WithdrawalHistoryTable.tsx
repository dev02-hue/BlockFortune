"use client"
import { getBlockFortuneWithdrawalHistory } from '@/lib/deposit'
import { formatCurrency, formatDate } from '@/lib/util'
import { useState, useEffect, useCallback } from 'react'
  
 
const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

export function WithdrawalHistoryTable() {
  interface Withdrawal {
    id: string;
    createdAt: string;
    amount: number;
    cryptoType: string;
    walletAddress: string;
    networkFee: number;
    status: 'pending' | 'completed' | 'rejected';
    reference: string;
  }

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })

  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true)
      const filters = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit
      }
      
      const { data, error, count } = await getBlockFortuneWithdrawalHistory(filters)
      
      if (error) {
        setError(error)
      } else {
        setWithdrawals(data || [])
        setPagination(prev => ({ ...prev, total: count || 0 }))
      }
    } catch (err) {
        console.log('Error fetching withdrawals:', err);
        
      setError('Failed to load withdrawal history')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, pagination.limit, pagination.page])

  useEffect(() => {
    fetchWithdrawals()
  }, [fetchWithdrawals])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleStatusFilterChange = (status: 'all' | 'pending' | 'completed' | 'rejected') => {
    setStatusFilter(status)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page when filter changes
  }

  if (loading && withdrawals.length === 0) {
    return <div className="text-center py-8">Loading withdrawal history...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filter controls */}
      <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusFilterChange('all')}
            className={`px-3 py-1 rounded-md text-sm text-black ${statusFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
          >
            All
          </button>
          <button
            onClick={() => handleStatusFilterChange('pending')}
            className={`px-3 py-1 rounded-md text-sm text-black ${statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}
          >
            Pending
          </button>
          <button
            onClick={() => handleStatusFilterChange('completed')}
            className={`px-3 py-1 rounded-md text-sm text-black ${statusFilter === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
          >
            Completed
          </button>
          <button
            onClick={() => handleStatusFilterChange('rejected')}
            className={`px-3 py-1 rounded-md text-sm text-black ${statusFilter === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}
          >
            Rejected
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          Showing {withdrawals.length} of {pagination.total} withdrawals
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crypto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(withdrawal.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${formatCurrency(withdrawal.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {withdrawal.cryptoType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="max-w-xs truncate">
                    {withdrawal.walletAddress}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${formatCurrency(withdrawal.networkFee)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[withdrawal.status as 'pending' | 'completed' | 'rejected']}`}>
                    {withdrawal.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {withdrawal.reference}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.limit >= pagination.total}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>
                {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => i + 1)
                  .slice(Math.max(0, pagination.page - 3), Math.min(pagination.page + 2, Math.ceil(pagination.total / pagination.limit)))
                  .map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === pagination.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}