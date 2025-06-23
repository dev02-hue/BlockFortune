'use client'

import { fetchAllTransactions, Transaction } from '@/lib/transactions'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiArrowLeft, 
  FiArrowRight, 
  FiFilter, 
  FiRefreshCw, 
  FiDownload, 
  FiSearch,
  FiChevronDown,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiSend,
  FiInfo
} from 'react-icons/fi'
import { Spinner } from './Spinner' // Create a separate spinner component

const statusIcons = {
  pending: <FiClock className="mr-1" />,
  completed: <FiCheckCircle className="mr-1" />,
  rejected: <FiXCircle className="mr-1" />
}

const typeIcons = {
  deposit: <FiDollarSign className="mr-1" />,
  withdrawal: <FiSend className="mr-1" />
}

export default function TransactionHistoryTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    type: undefined as 'deposit' | 'withdrawal' | undefined,
    status: undefined as 'pending' | 'completed' | 'rejected' | undefined,
    limit: 10,
    offset: 0
  })

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true)
        const { data, error, count } = await fetchAllTransactions(filters)
        
        if (error) {
          setError(error)
        } else if (data) {
          setTransactions(data)
          setCount(count || 0)
        }
      } catch (err) {
        console.log(err)
        setError('Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [filters])

  const handleFilterChange = (key: keyof typeof filters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset offset when filters change
    }))
  }

  const handleNextPage = () => {
    setFilters(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }))
  }

  const handlePrevPage = () => {
    setFilters(prev => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit)
    }))
  }

  const refreshTransactions = () => {
    setFilters(prev => ({ ...prev })) // Trigger refresh by creating new object
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-100'
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100'
      case 'rejected': return 'bg-red-50 text-red-700 border-red-100'
      default: return 'bg-gray-50 text-gray-700 border-gray-100'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600'
  }

  const filteredTransactions = transactions.filter(tx => 
    tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.crypto_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.type === 'withdrawal' && tx.wallet_address?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (tx.type === 'deposit' && tx.narration?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (error) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
    >
      <div className="text-red-600 font-medium mb-2">{error}</div>
      <button
        onClick={refreshTransactions}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center mx-auto"
      >
        <FiRefreshCw className="mr-2" />
        Try Again
      </button>
    </motion.div>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with search and filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Transaction History</h2>
          <p className="text-gray-600">All your deposits and withdrawals</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 w-full border border-black text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button className="px-4 py-2 text-black bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
            <FiDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center gap-3">
        <div className="flex items-center">
          <FiFilter className="text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <select
          className="px-3 py-2 text-black text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          value={filters.type || ''}
          onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
        >
          <option className='text-black' value="">All Types</option>
          <option value="deposit">Deposits</option>
          <option value="withdrawal">Withdrawals</option>
        </select>

        <select
          className="px-3 py-2 text-black text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          className="px-3 py-2 text-black text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          value={filters.limit}
          onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>

        <button
          onClick={refreshTransactions}
          disabled={loading}
          className="ml-auto px-3 py-2 text-sm text-black bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                <div className="flex items-center">
                  Type
                  <FiChevronDown className="ml-1" size={14} />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Crypto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <Spinner size="lg" />
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                  <div className="flex flex-col items-center justify-center">
                    <FiInfo className="text-gray-400 mb-2" size={24} />
                    No transactions found
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {filteredTransactions.map((tx) => (
                  <motion.tr 
                    key={`${tx.type}-${tx.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gray-50"
                  >
                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${getTypeColor(tx.type)}`}>
                      <div className="flex items-center">
                        {typeIcons[tx.type]}
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">
                      {tx.amount} {tx.crypto_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">
                      {tx.crypto_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full border ${getStatusColor(tx.status)}`}>
                        {statusIcons[tx.status]}
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <span className="font-mono">{tx.reference}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {tx.type === 'deposit' ? (
                        tx.narration
                      ) : (
                        <div className="flex items-center">
                          <span className="truncate max-w-xs">{tx.wallet_address}</span>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-black">
          Showing <span className="font-medium">{filters.offset + 1}</span> to{' '}
          <span className="font-medium">{Math.min(filters.offset + filters.limit, count)}</span> of{' '}
          <span className="font-medium">{count}</span> results
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handlePrevPage}
            disabled={filters.offset === 0 || loading}
            className={`px-4 py-2 rounded-lg flex items-center ${
              filters.offset === 0 || loading
                ? 'bg-gray-100 text-black cursor-pointer'
                : 'bg-white border border-gray-200 text-black hover:bg-gray-50'
            } transition-colors`}
          >
            <FiArrowLeft className="mr-2" />
            Previous
          </button>
          
          <button
            onClick={handleNextPage}
            disabled={filters.offset + filters.limit >= count || loading}
            className={`px-4 py-2 rounded-lg flex items-center ${
              filters.offset + filters.limit >= count || loading
                ? 'bg-gray-100 text-black cursor-pointer'
                : 'bg-white border border-gray-200 text-black hover:bg-gray-50'
            } transition-colors`}
          >
            Next
            <FiArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}