'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiEdit, 
  FiSave, 
  FiX, 
  FiChevronUp, 
  FiChevronDown, 
  FiSearch,
  FiRefreshCw,
  FiUser,
  FiMail,
  FiDollarSign,
  FiCreditCard,
  FiActivity,
  FiDownload,
  FiUpload,
  FiLink
} from 'react-icons/fi'
import { EditableProfileFields, UserProfile } from '@/type/type'
import { getAllUserData, updateUserProfile } from '@/lib/getUserData'

export default function UserManagementTable() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: keyof UserProfile; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  })
  const [showCryptoAddresses, setShowCryptoAddresses] = useState<Record<string, boolean>>({})

  // Fetch users data
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAllUserData({
        orderBy: sortConfig.key,
        orderAsc: sortConfig.direction === 'asc',
        limit: pagination.pageSize,
        offset: (pagination.page - 1) * pagination.pageSize
      })

      if (response.error) {
        throw new Error(response.error)
      }

      setUsers(response.data || [])
      setPagination(prev => ({ ...prev, total: response.count || 0 }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [sortConfig, pagination.page])

  // Handle sort
  const requestSort = (key: keyof UserProfile) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Toggle crypto addresses visibility
  const toggleCryptoAddresses = (userId: string) => {
    setShowCryptoAddresses(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }))
  }

  // Handle edit
  const startEditing = (user: UserProfile) => {
    setEditingId(user.id)
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      balance: user.balance,
      pendingWithdrawal: user.pendingWithdrawal,
      activeDeposit: user.activeDeposit,
      withdrawalTotal: user.withdrawalTotal,
      earnedTotal: user.earnedTotal,
      usdtTrc20Address: user.usdtTrc20Address,
      btcAddress: user.btcAddress,
      usdtErc20Address: user.usdtErc20Address,
      ethAddress: user.ethAddress,
      bnbAddress: user.bnbAddress
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({})
  }

  // Handle save
  const saveEdit = async () => {
    if (!editingId) return

    setLoading(true)
    try {
      const updates: EditableProfileFields = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        balance: editForm.balance,
        pendingWithdrawal: editForm.pendingWithdrawal,
        activeDeposit: editForm.activeDeposit,
        withdrawalTotal: editForm.withdrawalTotal,
        earnedTotal: editForm.earnedTotal,
        usdtTrc20Address: editForm.usdtTrc20Address,
        btcAddress: editForm.btcAddress,
        usdtErc20Address: editForm.usdtErc20Address,
        ethAddress: editForm.ethAddress,
        bnbAddress: editForm.bnbAddress
      }

      const response = await updateUserProfile(updates)
      if (response.error) {
        throw new Error(response.error)
      }

      await fetchUsers()
      cancelEditing()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
      console.error('Error updating user:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName} ${user.email} ${user.username}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  // Table columns configuration
  const columns = [
    { key: 'firstName', label: 'Name', icon: <FiUser className="inline mr-1" /> },
    { key: 'email', label: 'Email', icon: <FiMail className="inline mr-1" /> },
    { key: 'balance', label: 'Balance', icon: <FiDollarSign className="inline mr-1" /> },
    { key: 'pendingWithdrawal', label: 'Pending Withdrawal', icon: <FiDownload className="inline mr-1" /> },
    { key: 'activeDeposit', label: 'Active Deposit', icon: <FiCreditCard className="inline mr-1" /> },
    { key: 'withdrawalTotal', label: 'Total Withdrawn', icon: <FiUpload className="inline mr-1" /> },
    { key: 'earnedTotal', label: 'Total Earned', icon: <FiActivity className="inline mr-1" /> },
    { key: 'actions', label: 'Actions' }
  ]

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiX className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.key !== 'actions' && requestSort(column.key as keyof UserProfile)}
                >
                  <div className="flex items-center">
                    {column.icon}
                    {column.label}
                    {sortConfig.key === column.key && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? (
                          <FiChevronUp className="inline" />
                        ) : (
                          <FiChevronDown className="inline" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center py-8">
                    <FiRefreshCw className="animate-spin h-8 w-8 text-blue-500" />
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <>
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={editingId === user.id ? 'bg-blue-50' : ''}
                    >
                      {/* Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.id ? (
                          <input
                            type="text"
                            value={editForm.firstName || ''}
                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.id ? (
                          <input
                            type="email"
                            value={editForm.email || ''}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{user.email}</div>
                        )}
                      </td>

                      {/* Balance */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.id ? (
                          <input
                            type="number"
                            value={editForm.balance || 0}
                            onChange={(e) => setEditForm({ ...editForm, balance: parseFloat(e.target.value) || 0 })}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                            step="0.01"
                          />
                        ) : (
                          <div className="text-sm text-gray-900 font-medium">
                            {formatCurrency(user.balance)}
                          </div>
                        )}
                      </td>

                      {/* Pending Withdrawal */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.id ? (
                          <input
                            type="number"
                            value={editForm.pendingWithdrawal || 0}
                            onChange={(e) => setEditForm({ ...editForm, pendingWithdrawal: parseFloat(e.target.value) || 0 })}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                            step="0.01"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">
                            {formatCurrency(user.pendingWithdrawal)}
                          </div>
                        )}
                      </td>

                      {/* Active Deposit */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.id ? (
                          <input
                            type="number"
                            value={editForm.activeDeposit || 0}
                            onChange={(e) => setEditForm({ ...editForm, activeDeposit: parseFloat(e.target.value) || 0 })}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                            step="0.01"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">
                            {formatCurrency(user.activeDeposit)}
                          </div>
                        )}
                      </td>

                      {/* Total Withdrawn */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.id ? (
                          <input
                            type="number"
                            value={editForm.withdrawalTotal || 0}
                            onChange={(e) => setEditForm({ ...editForm, withdrawalTotal: parseFloat(e.target.value) || 0 })}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                            step="0.01"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">
                            {formatCurrency(user.withdrawalTotal)}
                          </div>
                        )}
                      </td>

                      {/* Total Earned */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user.id ? (
                          <input
                            type="number"
                            value={editForm.earnedTotal || 0}
                            onChange={(e) => setEditForm({ ...editForm, earnedTotal: parseFloat(e.target.value) || 0 })}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                            step="0.01"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">
                            {formatCurrency(user.earnedTotal)}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            {editingId === user.id ? (
                              <>
                                <button
                                  onClick={saveEdit}
                                  disabled={loading}
                                  className="text-green-600 hover:text-green-900 flex items-center"
                                >
                                  <FiSave className="mr-1" /> Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="text-gray-600 hover:text-gray-900 flex items-center"
                                >
                                  <FiX className="mr-1" /> Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEditing(user)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <FiEdit className="mr-1" /> Edit
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => toggleCryptoAddresses(user.id)}
                            className="text-purple-600 hover:text-purple-900 flex items-center text-xs"
                          >
                            <FiLink className="mr-1" /> {showCryptoAddresses[user.id] ? 'Hide' : 'Show'} Addresses
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Crypto Addresses Row */}
                    {showCryptoAddresses[user.id] && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50"
                      >
                        <td colSpan={columns.length} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* USDT TRC20 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">USDT TRC20</label>
                              {editingId === user.id ? (
                                <input
                                  type="text"
                                  value={editForm.usdtTrc20Address || ''}
                                  onChange={(e) => setEditForm({ ...editForm, usdtTrc20Address: e.target.value })}
                                  className="border border-gray-300 rounded px-2 py-1 w-full"
                                />
                              ) : (
                                <div className="text-sm text-gray-900 break-all">
                                  {user.usdtTrc20Address || 'Not set'}
                                </div>
                              )}
                            </div>

                            {/* BTC */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">BTC</label>
                              {editingId === user.id ? (
                                <input
                                  type="text"
                                  value={editForm.btcAddress || ''}
                                  onChange={(e) => setEditForm({ ...editForm, btcAddress: e.target.value })}
                                  className="border border-gray-300 rounded px-2 py-1 w-full"
                                />
                              ) : (
                                <div className="text-sm text-gray-900 break-all">
                                  {user.btcAddress || 'Not set'}
                                </div>
                              )}
                            </div>

                            {/* USDT ERC20 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">USDT ERC20</label>
                              {editingId === user.id ? (
                                <input
                                  type="text"
                                  value={editForm.usdtErc20Address || ''}
                                  onChange={(e) => setEditForm({ ...editForm, usdtErc20Address: e.target.value })}
                                  className="border border-gray-300 rounded px-2 py-1 w-full"
                                />
                              ) : (
                                <div className="text-sm text-gray-900 break-all">
                                  {user.usdtErc20Address || 'Not set'}
                                </div>
                              )}
                            </div>

                            {/* ETH */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">ETH</label>
                              {editingId === user.id ? (
                                <input
                                  type="text"
                                  value={editForm.ethAddress || ''}
                                  onChange={(e) => setEditForm({ ...editForm, ethAddress: e.target.value })}
                                  className="border border-gray-300 rounded px-2 py-1 w-full"
                                />
                              ) : (
                                <div className="text-sm text-gray-900 break-all">
                                  {user.ethAddress || 'Not set'}
                                </div>
                              )}
                            </div>

                            {/* BNB */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">BNB</label>
                              {editingId === user.id ? (
                                <input
                                  type="text"
                                  value={editForm.bnbAddress || ''}
                                  onChange={(e) => setEditForm({ ...editForm, bnbAddress: e.target.value })}
                                  className="border border-gray-300 rounded px-2 py-1 w-full"
                                />
                              ) : (
                                <div className="text-sm text-gray-900 break-all">
                                  {user.bnbAddress || 'Not set'}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && pagination.total > pagination.pageSize && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="mb-2 sm:mb-0">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.pageSize, pagination.total)}
              </span>{' '}
              of <span className="font-medium">{pagination.total}</span> users
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}