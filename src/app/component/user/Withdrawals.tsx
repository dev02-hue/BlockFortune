/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiArrowRight, 
  FiCheck, 
  FiDollarSign, 
  FiCreditCard, 
  FiInfo, 
  FiLoader,
  FiChevronDown,
 
  FiAlertTriangle
} from 'react-icons/fi'
import { FaBitcoin, FaEthereum } from 'react-icons/fa'
import { SiTether, SiSolana, SiTon } from 'react-icons/si'
import { CRYPTO_WALLETS  } from '@/type/type'
import { initiateBlockFortuneWithdrawal } from '@/lib/deposit'
import { getUserData } from '@/lib/getUserData'

type CryptoType = keyof typeof CRYPTO_WALLETS

type WithdrawalDetails = {
  cryptoType: CryptoType
  cryptoNetwork: string
  walletAddress: string
  amount: number
  fee: number
  reference: string
  narration: string
  transactionId: string
}

type CoinGeckoMarketData = {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
}

const cryptoOptions = [
  { 
    value: 'BTC', 
    label: 'Bitcoin', 
    icon: <FaBitcoin className="text-orange-500" />,
    networks: ['Bitcoin', 'Lightning Network']
  },
  { 
    value: 'ETH', 
    label: 'Ethereum', 
    icon: <FaEthereum className="text-purple-500" />,
    networks: ['Ethereum', 'ERC-20']
  },
  { 
    value: 'USDT_TRC20', 
    label: 'USDT (TRC20)', 
    icon: <SiTether className="text-emerald-500" />,
    networks: ['TRON', 'TRC-20']
  },
  { 
    value: 'TRX', 
    label: 'Tron', 
    icon: <SiTon className="text-red-500" />,
    networks: ['TRON']
  },
  { 
    value: 'SOL', 
    label: 'Solana', 
    icon: <SiSolana className="text-indigo-500" />,
    networks: ['Solana']
  }
]

const WITHDRAWAL_FEES: Record<CryptoType, number> = {
  BTC: 0.0005,
  ETH: 0.01,
  USDT_TRC20: 1,
  TRX: 5,
  SOL: 0.01
}

export default function WithdrawalForm() {
  const [amount, setAmount] = useState('')
  const [cryptoType, setCryptoType] = useState<CryptoType>('USDT_TRC20')
  const [selectedNetwork, setSelectedNetwork] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [withdrawalDetails, setWithdrawalDetails] = useState<WithdrawalDetails | null>(null)
  const [balance, setBalance] = useState(0)
  const [currentStep, setCurrentStep] = useState(1)
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false)
  const [marketData, setMarketData] = useState<CoinGeckoMarketData[]>([])
  const [isMarketDataLoading, setIsMarketDataLoading] = useState(true)

  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        const result = await getUserData()
        if (result.user) {
          setBalance(result.user.balance)
        }
      } catch (err) {
        console.error('Failed to fetch balance:', err)
      }
    }
    fetchUserBalance()
  }, [])

  // Fetch CoinGecko market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,tron,solana&per_page=5'
        )
        const data = await response.json()
        setMarketData(data)
      } catch (err) {
        console.error('Failed to fetch market data:', err)
      } finally {
        setIsMarketDataLoading(false)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const validateStep1 = () => {
    const numericAmount = parseFloat(amount)
    if (!amount || isNaN(numericAmount) || numericAmount < 50) {
      setError('Minimum withdrawal amount is $50')
      return false
    }
    if (numericAmount > balance) {
      setError('Insufficient balance for this withdrawal')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const numericAmount = parseFloat(amount)
      if (isNaN(numericAmount)) {
        throw new Error('Please enter a valid amount')
      }

      if (numericAmount < 50) {
        throw new Error('Minimum withdrawal amount is $50')
      }

      if (numericAmount > balance) {
        throw new Error('Insufficient balance for this withdrawal')
      }

      if (!walletAddress) {
        throw new Error('Please enter your wallet address')
      }

      const result = await initiateBlockFortuneWithdrawal(
        numericAmount,
        cryptoType,
        walletAddress
      )

      if ('success' in result && !result.success) {
        throw new Error('An error occurred during the withdrawal process')
      }

      if ('withdrawalDetails' in result) {
        setWithdrawalDetails(result.withdrawalDetails)
      }
      setSuccess(true)
      setCurrentStep(3)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to initiate withdrawal')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success && withdrawalDetails && currentStep === 3) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheck className="text-green-600 text-4xl" />
              </div>
              <h2 className="text-2xl font-bold text-black mb-3">Withdrawal Request Submitted</h2>
              <p className="text-gray-700 mb-8">Your transaction is being processed</p>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-black">Amount:</span>
                  <span className="font-semibold text-black">${withdrawalDetails.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-black">Crypto Type:</span>
                  <span className="font-semibold text-black">{withdrawalDetails.cryptoType}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-black">Network:</span>
                  <span className="font-semibold text-black">{withdrawalDetails.cryptoNetwork}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-black">Network Fee:</span>
                  <span className="font-semibold text-black">{WITHDRAWAL_FEES[withdrawalDetails.cryptoType]} {withdrawalDetails.cryptoType}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-black">Reference:</span>
                  <span className="font-semibold text-blue-600">{withdrawalDetails.reference}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100 flex items-start mb-8">
                <FiInfo className="mr-3 mt-0.5 flex-shrink-0 text-blue-600" />
                <p>Your withdrawal is being processed. You&apos;ll receive a confirmation email once completed. Processing typically takes 1-24 hours.</p>
              </div>
              
              <button
                onClick={() => {
                  setSuccess(false)
                  setCurrentStep(1)
                  setAmount('')
                  setWalletAddress('')
                }}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                New Withdrawal
              </button>
            </motion.div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Market Prices</h3>
            {isMarketDataLoading ? (
              <div className="flex justify-center items-center h-40">
                <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
              </div>
            ) : (
              <div className="space-y-4">
                {marketData.map((coin) => (
                  <div key={coin.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <img src={coin.image} alt={coin.name} className="h-8 w-8 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{coin.symbol.toUpperCase()}</p>
                        <p className="text-sm text-gray-500">{coin.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${coin.current_price.toLocaleString()}</p>
                      <p className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {coin.price_change_percentage_24h >= 0 ? '↑' : '↓'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Prices update every minute</p>
              <p className="mt-1">Powered by CoinGecko API</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-3">Withdraw Funds</h2>
            <p className="text-gray-700">Securely transfer your funds to your cryptocurrency wallet</p>
          </div>
          
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-lg mb-8 border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-blue-800">Available Balance</p>
                <p className="text-2xl font-bold text-black">${balance.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiDollarSign className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="relative mb-10">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'} ${currentStep === step ? 'ring-4 ring-blue-200' : ''} transition-colors duration-200`}>
                    {step}
                  </div>
                  <span className={`text-xs mt-2 ${currentStep >= step ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                    {step === 1 ? 'Amount' : step === 2 ? 'Details' : 'Confirm'}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute top-6 left-0 right-0 h-1.5 bg-gray-200 -z-10">
              <motion.div 
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
                animate={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          
          <form onSubmit={currentStep === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep() }}>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 bg-red-50 text-red-700 rounded-lg mb-6 flex items-start border border-red-100"
                >
                  <FiAlertTriangle className="mr-3 mt-0.5 flex-shrink-0 text-red-600" />
                  <span>{error}</span>
                </motion.div>
              )}
              
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={{
                    hidden: { opacity: 0, x: 50 },
                    visible: { opacity: 1, x: 0 },
                    exit: { opacity: 0, x: -50 }
                  }}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-black mb-3">
                      Withdrawal Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount (min $50)"
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12 text-black"
                        min="50"
                        step="0.01"
                        required
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-gray-600">Minimum: $50.00</span>
                      <button 
                        type="button" 
                        onClick={() => setAmount(balance.toString())}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Use full balance
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep1()) handleNextStep()
                      }}
                      className="flex items-center justify-center py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                    >
                      Continue <FiArrowRight className="ml-2" />
                    </button>
                  </div>
                </motion.div>
              )}
              
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={{
                    hidden: { opacity: 0, x: 50 },
                    visible: { opacity: 1, x: 0 },
                    exit: { opacity: 0, x: -50 }
                  }}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="text-sm font-medium text-black mb-3">
                      Cryptocurrency
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}
                        className="relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-4 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <span className="flex text-black items-center">
                          {cryptoOptions.find(opt => opt.value === cryptoType)?.icon}
                          <span className="ml-3 block truncate">
                            {cryptoOptions.find(opt => opt.value === cryptoType)?.label}
                          </span>
                        </span>
                        <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <FiChevronDown className="h-5 w-5 text-black" />
                        </span>
                      </button>

                      <AnimatePresence>
                        {showCryptoDropdown && (
                          <motion.ul
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                          >
                            {cryptoOptions.map((option) => (
                              <li
                                key={option.value}
                                className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                                onClick={() => {
                                  setCryptoType(option.value as CryptoType)
                                  setSelectedNetwork(option.networks?.[0] || '')
                                  setShowCryptoDropdown(false)
                                }}
                              >
                                <div className="flex items-center">
                                  {option.icon}
                                  <span className="font-normal ml-3 block truncate">
                                    {option.label}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {cryptoOptions.find(opt => opt.value === cryptoType)?.networks && 
                   (cryptoOptions.find(opt => opt.value === cryptoType)?.networks ?? []).length > 1 && (
                    <div>
                      <label className="text-sm font-medium text-black mb-3">
                        Network
                      </label>
                      <select
                        value={selectedNetwork}
                        onChange={(e) => setSelectedNetwork(e.target.value)}
                        className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                      >
                        {cryptoOptions.find(opt => opt.value === cryptoType)?.networks?.map((network) => (
                          <option key={network} value={network}>
                            {network}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-black mb-3 flex items-center">
                      <FiCreditCard className="mr-2 text-gray-600" />
                      Your {cryptoType} Wallet Address
                    </label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder={`Enter your ${cryptoType} wallet address`}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-black mb-4">Transaction Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-black">Amount:</span>
                        <span className="font-semibold text-black">${amount || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Network Fee:</span>
                        <span className="font-semibold text-black">{WITHDRAWAL_FEES[cryptoType]} {cryptoType}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between">
                          <span className="text-black font-semibold">Total to Receive:</span>
                          <span className="font-semibold text-blue-600">
                            {amount ? (parseFloat(amount) - WITHDRAWAL_FEES[cryptoType]).toFixed(2) : '0.00'} {cryptoType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="py-3 px-6 border border-gray-300 text-black font-medium rounded-lg hover:bg-gray-50 transition duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center justify-center py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-70"
                    >
                      {isLoading ? (
                        <>
                          <FiLoader className="animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        'Confirm Withdrawal'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          
          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="flex items-start">
              <FiInfo className="text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold text-black mb-2">Important Information</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Withdrawals are processed within 1-24 hours</li>
                  <li>Network fees are deducted from the withdrawal amount</li>
                  <li>Ensure wallet address is correct for the selected network</li>
                  <li>Contact support if you encounter any issues</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Market Prices</h3>
          {isMarketDataLoading ? (
            <div className="flex justify-center items-center h-40">
              <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {marketData.map((coin) => (
                <div key={coin.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <img src={coin.image} alt={coin.name} className="h-8 w-8 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{coin.symbol.toUpperCase()}</p>
                      <p className="text-sm text-gray-500">{coin.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${coin.current_price.toLocaleString()}</p>
                    <p className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {coin.price_change_percentage_24h >= 0 ? '↑' : '↓'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Prices update every minute</p>
            <p className="mt-1">Powered by CoinGecko API</p>
          </div>
        </div>
      </div>
    </div>
  )
}