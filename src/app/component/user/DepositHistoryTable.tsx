// components/DepositHistoryTable.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiClock, FiCheckCircle, FiXCircle, FiDollarSign } from 'react-icons/fi'
import { fetchDepositHistory } from '@/lib/depositHistory'
 
type DepositStatus = 'pending' | 'completed' | 'rejected'

const statusConfig = {
  pending: {
    icon: <FiClock className="text-yellow-500" />,
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Pending'
  },
  completed: {
    icon: <FiCheckCircle className="text-green-500" />,
    color: 'bg-green-100 text-green-800',
    label: 'Completed'
  },
  rejected: {
    icon: <FiXCircle className="text-red-500" />,
    color: 'bg-red-100 text-red-800',
    label: 'Rejected'
  }
}

export default function DepositHistoryTable() {
  type Deposit = {
    id: string;
    created_at: string;
    amount: number;
    crypto_type: string;
    reference: string;
    status: DepositStatus;
  };

  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDeposits = async () => {
      try {
        setLoading(true)
        const { data, error } = await fetchDepositHistory()
        
        if (error) {
          setError(error)
        } else if (data) {
          setDeposits(data)
        }
      } catch (err) {
        console.log(err);
        
        setError('Failed to load deposit history')
      } finally {
        setLoading(false)
      }
    }

    loadDeposits()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
        {error}
      </div>
    )
  }

  if (deposits.length === 0) {
    return (
      <div className="bg-gray-50 text-gray-600 p-4 rounded-lg text-center">
        No deposit history found
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm"
      >
        {/* Desktop/Tablet View */}
        <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Crypto Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deposits.map((deposit) => (
              <motion.tr
                key={deposit.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {formatDate(deposit.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                  {formatAmount(deposit.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {deposit.crypto_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black max-w-xs truncate">
                  {deposit.reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[deposit.status as DepositStatus].color}`}>
                    {statusConfig[deposit.status as DepositStatus].icon}
                    <span className="ml-1">{statusConfig[deposit.status as DepositStatus].label}</span>
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Mobile View */}
        <div className="sm:hidden space-y-4 p-4">
          {deposits.map((deposit) => (
            <motion.div
              key={deposit.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 p-4 rounded-lg shadow-xs"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <FiDollarSign className="text-blue-500 mr-2" />
                  <div>
                    <p className="font-medium text-black">{formatAmount(deposit.amount)}</p>
                    <p className="text-xs text-black">{deposit.crypto_type}</p>
                  </div>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[deposit.status as DepositStatus].color}`}>
                  {statusConfig[deposit.status as DepositStatus].icon}
                  <span className="ml-1">{statusConfig[deposit.status as DepositStatus].label}</span>
                </span>
              </div>
              <div className="mt-2 text-sm">
                <p className="text-black truncate">{deposit.reference}</p>
                <p className="text-xs text-black mt-1">{formatDate(deposit.created_at)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}