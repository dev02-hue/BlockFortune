'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEdit, FiSave, FiX, FiCopy, FiCheck } from 'react-icons/fi'
import { FaBitcoin, FaEthereum } from 'react-icons/fa'
import { SiBinance, SiTether } from 'react-icons/si'
import { getCryptoAddresses, updateCryptoAddresses } from '@/lib/getUserData'
 
type Addresses = {
  usdtTrc20Address: string
  btcAddress: string
  usdtErc20Address: string
  ethAddress: string
  bnbAddress: string
}

export default function CryptoAddressManager() {
  const [addresses, setAddresses] = useState<Addresses>({
    usdtTrc20Address: '',
    btcAddress: '',
    usdtErc20Address: '',
    ethAddress: '',
    bnbAddress: ''
  })
  const [editMode, setEditMode] = useState<keyof Addresses | null>(null)
  const [tempAddress, setTempAddress] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    setIsLoading(true)
    try {
      const result = await getCryptoAddresses()
      if (result.error) {
        setError(result.error)
      } else if (result.addresses) {
        setAddresses(result.addresses)
      }
    } catch (err) {
        console.log('Error updating address:', err);

      setError('Failed to fetch addresses')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (field: keyof Addresses) => {
    setEditMode(field)
    setTempAddress(addresses[field])
    setError('')
    setSuccess('')
  }

  const handleCancel = () => {
    setEditMode(null)
    setTempAddress('')
  }

  const handleSave = async () => {
    if (!editMode) return

    setIsLoading(true)
    try {
      const updateData = { [editMode]: tempAddress }
      const result = await updateCryptoAddresses(updateData)

      if (result.error) {
        setError(result.error)
      } else {
        setAddresses(prev => ({ ...prev, [editMode]: tempAddress }))
        setSuccess('Address updated successfully')
        setEditMode(null)
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
        console.log('Error updating address:', err);
        
      setError('Failed to update address')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const getIcon = (type: keyof Addresses) => {
    switch (type) {
      case 'btcAddress':
        return <FaBitcoin className="text-orange-500" />
      case 'ethAddress':
        return <FaEthereum className="text-purple-500" />
      case 'bnbAddress':
        return <SiBinance className="text-yellow-500" />
      case 'usdtTrc20Address':
      case 'usdtErc20Address':
        return <SiTether className="text-emerald-500" />
      default:
        return null
    }
  }

  const getNetworkName = (type: keyof Addresses) => {
    switch (type) {
      case 'btcAddress':
        return 'Bitcoin (BTC)'
      case 'ethAddress':
        return 'Ethereum (ETH)'
      case 'bnbAddress':
        return 'Binance Coin (BNB)'
      case 'usdtTrc20Address':
        return 'USDT (TRC20)'
      case 'usdtErc20Address':
        return 'USDT (ERC20)'
      default:
        return ''
    }
  }

  if (isLoading && !editMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Cryptocurrency Addresses
      </h2>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {(Object.keys(addresses) as Array<keyof Addresses>).map((field) => (
          <motion.div
            key={field}
            layout
            className="p-4 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getIcon(field)}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {getNetworkName(field)}
                </span>
              </div>

              {editMode !== field && (
                <button
                  onClick={() => handleEdit(field)}
                  className="p-2 text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 transition-colors"
                  disabled={isLoading}
                >
                  <FiEdit />
                </button>
              )}
            </div>

            {editMode === field ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder={`Enter ${getNetworkName(field)} address`}
                  />
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    <FiSave />
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
                  >
                    <FiX />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between mt-2"
              >
                <div className="truncate text-gray-600 dark:text-gray-400">
                  {addresses[field] || 'Not set'}
                </div>
                {addresses[field] && (
                  <button
                    onClick={() => copyToClipboard(addresses[field])}
                    className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    title="Copy to clipboard"
                  >
                    {copiedAddress === addresses[field] ? (
                      <FiCheck className="text-green-500" />
                    ) : (
                      <FiCopy />
                    )}
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}