'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiCheck, FiDollarSign,  FiCreditCard, FiInfo, FiLoader } from 'react-icons/fi'
import { CRYPTO_WALLETS, CRYPTO_NETWORKS } from '@/type/type'
import { initiateBlockFortuneWithdrawal } from '@/lib/deposit'
import { getUserData } from '@/lib/getUserData'
 
type CryptoType = keyof typeof CRYPTO_WALLETS

const WITHDRAWAL_FEES: Record<CryptoType, number> = {
  BTC: 0.0005,
  ETH: 0.01,
  USDT_TRC20: 1,
  TRX: 5,
  SOL: 0.01
}

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

type WithdrawalResponse = 
  | { success: true; withdrawalDetails: WithdrawalDetails }
  | { success: false; error: string }

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
}

export default function WithdrawalForm() {
  const [amount, setAmount] = useState('')
  const [cryptoType, setCryptoType] = useState<CryptoType>('USDT_TRC20')
  const [walletAddress, setWalletAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [withdrawalDetails, setWithdrawalDetails] = useState<WithdrawalDetails | null>(null)
  const [balance, setBalance] = useState(0)
  const [currentStep, setCurrentStep] = useState(1)

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
      ) as WithdrawalResponse

      if (!result.success) {
        throw new Error(result.error)
      }

      setWithdrawalDetails(result.withdrawalDetails)
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
      <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">
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
              <span className="font-semibold text-black">{CRYPTO_NETWORKS[withdrawalDetails.cryptoType]}</span>
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
    )
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">
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
              <FiInfo className="mr-3 mt-0.5 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </motion.div>
          )}
          
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
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
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label className="  text-sm font-medium text-black mb-3 flex items-center">
                  <FiCreditCard className="mr-2 text-gray-600" />
                  Cryptocurrency
                </label>
                <select
                  value={cryptoType}
                  onChange={(e) => setCryptoType(e.target.value as CryptoType)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  {Object.entries(CRYPTO_WALLETS).map(([key]) => (
                    <option key={key} value={key}>
                      {key} ({CRYPTO_NETWORKS[key as CryptoType]})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="  text-sm font-medium text-black mb-3 flex items-center">
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
                    <span className="text-gray-700">Amount:</span>
                    <span className="font-semibold">${amount || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Network Fee:</span>
                    <span className="font-semibold">{WITHDRAWAL_FEES[cryptoType]} {cryptoType}</span>
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
  )
}