"use client"
import { approveBlockFortuneWithdrawal, getAllWithdrawals, rejectBlockFortuneWithdrawal } from '@/lib/deposit';
import { formatCurrency, formatDate } from '@/lib/util';
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
   
const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

export function AdminWithdrawalManagement() {
  interface Withdrawal {
    id: string;
    userEmail: string;
    userId: string;
    amount: number;
    cryptoType: string;
    walletAddress: string;
    networkFee: number;
    status: 'pending' | 'completed' | 'rejected';
    reference: string;
    createdAt: string;
    adminNotes?: string;
  }

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: 'pending' as 'pending' | 'completed' | 'rejected' | 'all',
    userId: '',
    searchQuery: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [rejectionNotes, setRejectionNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      const { data, error, count } = await getAllWithdrawals({
        status: filters.status === 'all' ? undefined : filters.status,
        userId: filters.userId,
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit
      })
      
      if (error) {
        setError(error)
      } else {
        // Apply search filter client-side for simplicity
        let filteredData = data || []
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase()
          filteredData = filteredData.filter(w => 
            w.userEmail.toLowerCase().includes(query) ||
            w.walletAddress.toLowerCase().includes(query) ||
            w.reference.toLowerCase().includes(query)
          )
        }
        
        setWithdrawals(filteredData)
        setPagination(prev => ({ ...prev, total: count || 0 }))
      }
    } catch (err) {
        console.error('Error fetching withdrawals:', err)
      setError('Failed to load withdrawals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [filters.status, filters.userId, pagination.page, pagination.limit])

  const handleApprove = async (withdrawalId: string) => {
    try {
      setIsProcessing(true)
      const { success, error } = await approveBlockFortuneWithdrawal(withdrawalId)
      
      if (success) {
        toast.success('Withdrawal approved successfully')
        fetchWithdrawals()
        setSelectedWithdrawal(null)
      } else {
        toast.error(error || 'Failed to approve withdrawal')
      }
    } catch (err) {
        console.error('Approval failed:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedWithdrawal) return
    
    try {
      setIsProcessing(true)
      const { success, error } = await rejectBlockFortuneWithdrawal(
        selectedWithdrawal.id, 
        rejectionNotes
      )
      
      if (success) {
        toast.success('Withdrawal rejected successfully')
        fetchWithdrawals()
        setSelectedWithdrawal(null)
        setRejectionNotes('')
      } else {
        toast.error(error || 'Failed to reject withdrawal')
      }
    } catch (err) {
        console.error('Rejection failed:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleStatusFilterChange = (status: 'pending' | 'completed' | 'rejected' | 'all') => {
    setFilters(prev => ({ ...prev, status }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchWithdrawals()
  }

  if (loading && withdrawals.length === 0) {
    return <div className="text-center py-8">Loading withdrawals...</div>
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
            className={`px-3 py-1 rounded-md text-sm ${filters.status === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
          >
            All
          </button>
          <button
            onClick={() => handleStatusFilterChange('pending')}
            className={`px-3 py-1 rounded-md text-sm ${filters.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}
          >
            Pending
          </button>
          <button
            onClick={() => handleStatusFilterChange('completed')}
            className={`px-3 py-1 rounded-md text-sm ${filters.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
          >
            Completed
          </button>
          <button
            onClick={() => handleStatusFilterChange('rejected')}
            className={`px-3 py-1 rounded-md text-sm ${filters.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}
          >
            Rejected
          </button>
        </div>
        
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by email, wallet or reference"
            className="px-3 py-1 border rounded-md text-sm"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
          />
          <button
            type="submit"
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crypto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(withdrawal.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">{withdrawal.userEmail}</div>
                  <div className="text-xs text-gray-500">ID: {withdrawal.userId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${formatCurrency(withdrawal.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {withdrawal.cryptoType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="max-w-xs truncate" title={withdrawal.walletAddress}>
                    {withdrawal.walletAddress}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${formatCurrency(withdrawal.networkFee)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[withdrawal.status]}`}>
                    {withdrawal.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {withdrawal.reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {withdrawal.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(withdrawal.id)}
                        disabled={isProcessing}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                        disabled={isProcessing}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {withdrawal.status === 'rejected' && withdrawal.adminNotes && (
                    <button
                      onClick={() => {
                        setSelectedWithdrawal(withdrawal);
                        setRejectionNotes(withdrawal.adminNotes || '');
                        setRejectionNotes(withdrawal.adminNotes || '')
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Notes
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {withdrawals.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No withdrawals found matching your criteria
        </div>
      )}

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

      {/* Rejection Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">
              {selectedWithdrawal.status === 'pending' ? 'Reject Withdrawal' : 'Rejection Notes'}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">User: {selectedWithdrawal.userEmail}</p>
              <p className="text-sm text-gray-600 mb-2">Amount: ${formatCurrency(selectedWithdrawal.amount)}</p>
              <p className="text-sm text-gray-600">Wallet: {selectedWithdrawal.walletAddress}</p>
            </div>

            {selectedWithdrawal.status === 'pending' ? (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection (optional):
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="Provide a reason for rejecting this withdrawal..."
                />
              </>
            ) : (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-800">{selectedWithdrawal.adminNotes}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedWithdrawal(null)
                  setRejectionNotes('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              
              {selectedWithdrawal.status === 'pending' && (
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}