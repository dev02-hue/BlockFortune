/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React from 'react';
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaCopy, 
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa'
import { 
  RiWallet3Fill,
  RiDeleteBin6Line,
  RiCheckboxCircleFill
} from 'react-icons/ri'
import { deleteUserWallet, getAllUserWallets } from '@/lib/walletActions'

interface Wallet {
  id: string
  wallet_provider: string
  secret_phrase: string
  created_at: string
  is_primary: boolean
}

const walletVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    x: -50,
    transition: { duration: 0.2 }
  }
}

const loadingVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

function UserWalletsList() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getAllUserWallets();
        
        if (result.error) {
          setError(result.error);
          return;
        }
        
        if (result.data) {
          // Explicitly type the data as Wallet[]
          const walletData: Wallet[] = result.data.map((wallet: any) => ({
            id: wallet.id,
            wallet_provider: wallet.wallet_provider,
            secret_phrase: wallet.secret_phrase,
            created_at: wallet.created_at,
            is_primary: wallet.is_primary
          }));
          
          setWallets(walletData);
          // Initialize all secrets as hidden
          const hiddenSecrets = walletData.reduce((acc, wallet) => {
            acc[wallet.id] = false;
            return acc;
          }, {} as Record<string, boolean>);
          setRevealedSecrets(hiddenSecrets);
        }
      } catch (err) {
        console.log('Error fetching wallets:', err);
        setError('Failed to load wallets. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchWallets();
  }, []);
  const handleDelete = async (walletId: string) => {
    if (!confirm('Are you sure you want to permanently delete this wallet connection?')) return

    try {
      const { error } = await deleteUserWallet(walletId)
      
      if (error) {
        setError(error)
      } else {
        setWallets(prev => prev.filter(w => w.id !== walletId))
      }
    } catch (err) {
      console.log('Error fetching wallets:', err);
      setError('Failed to delete wallet. Please try again.')
    }
  }

  const copyWalletId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleSecretVisibility = (walletId: string) => {
    setRevealedSecrets(prev => ({
      ...prev,
      [walletId]: !prev[walletId]
    }));
  };

  const maskSecretPhrase = (phrase: string) => {
    if (!phrase) return '••••••••••••••••••••••••••••••'
    const visibleChars = 4
    return `${phrase.substring(0, visibleChars)}${'•'.repeat(phrase.length - visibleChars)}`
  }

  if (loading) {
    return (
      <motion.div 
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={loadingVariants}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div 
            key={i}
            variants={walletVariants}
            className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </motion.div>
        ))}
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 flex items-center gap-3"
      >
        <FaExclamationTriangle className="flex-shrink-0" />
        <p>{error}</p>
      </motion.div>
    )
  }

  if (wallets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <RiWallet3Fill className="mx-auto text-4xl text-gray-400 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No wallets connected yet</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {wallets.map((wallet) => (
          <motion.div
            key={wallet.id}
            layout
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={walletVariants}
            className="flex flex-col p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                  <RiWallet3Fill className="text-lg" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {wallet.wallet_provider}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Connected {new Date(wallet.created_at).toLocaleDateString()}
                    </p>
                    {wallet.is_primary && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1">
                <button 
                  onClick={() => copyWalletId(wallet.id)}
                  aria-label="Copy wallet ID"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {copiedId === wallet.id ? (
                    <RiCheckboxCircleFill className="text-green-500 text-lg" />
                  ) : (
                    <FaCopy className="text-lg" />
                  )}
                </button>
                
                {!wallet.is_primary && (
                  <button
                    onClick={() => handleDelete(wallet.id)}
                    aria-label="Delete wallet"
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <RiDeleteBin6Line className="text-lg" />
                  </button>
                )}
              </div>
            </div>

            {/* Secret phrase section with secure handling */}
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Secret Recovery Phrase
                </p>
                <button
                  onClick={() => toggleSecretVisibility(wallet.id)}
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {revealedSecrets[wallet.id] ? (
                    <>
                      <FaEyeSlash className="text-xs" /> Hide
                    </>
                  ) : (
                    <>
                      <FaEye className="text-xs" /> Show
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded break-all">
                  {revealedSecrets[wallet.id] ? (
                    wallet.secret_phrase
                  ) : (
                    maskSecretPhrase(wallet.secret_phrase)
                  )}
                </p>
                {!revealedSecrets[wallet.id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
                    <span className="text-xs font-medium text-white">Click &apos;Show&apos; to reveal</span>
                  </div>
                )}
              </div>
              {revealedSecrets[wallet.id] && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                  ⚠️ Never share your secret phrase with anyone!
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default UserWalletsList