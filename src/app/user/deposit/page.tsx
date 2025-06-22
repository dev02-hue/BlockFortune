'use client'

import { initiateBlockFortuneDeposit } from '@/lib/deposit'
import { getUserData } from '@/lib/getUserData'
import { CRYPTO_WALLETS } from '@/type/type'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiCopy, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiArrowRight,
  FiDollarSign,
  FiMail,
  FiCreditCard,
  FiChevronDown
} from 'react-icons/fi'
import { FaBitcoin, FaEthereum, FaWallet } from 'react-icons/fa'
import { SiTether, SiSolana, SiTon } from 'react-icons/si'

const cryptoOptions = [
  { value: 'BTC', label: 'Bitcoin', icon: <FaBitcoin className="text-orange-500" /> },
  { value: 'ETH', label: 'Ethereum', icon: <FaEthereum className="text-purple-500" /> },
  { value: 'USDT_TRC20', label: 'USDT (TRC20)', icon: <SiTether className="text-emerald-500" /> },
  { value: 'TRX', label: 'Tron', icon: <SiTon className="text-red-500" /> },
  { value: 'SOL', label: 'Solana', icon: <SiSolana className="text-indigo-500" /> }
]

type DepositDetails = {
  cryptoType: string
  cryptoNetwork: string
  walletAddress: string
  amount: number
  reference: string
  narration: string
  transactionId: string
}

type CryptoType = keyof typeof CRYPTO_WALLETS

export default function DepositForm() {
  const [amount, setAmount] = useState('')
  const [cryptoType, setCryptoType] = useState('BTC')
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false)
  type UserData = {
    email: string
    // Add other fields as needed
  }

  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [depositDetails, setDepositDetails] = useState<DepositDetails | null>(null)
  const [paymentMade, setPaymentMade] = useState(false)

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserData()
        if (response.user) {
          setUserData(response.user)
        } else if (response.error) {
          setError(response.error)
        }
      } catch (err) {
        setError('Failed to fetch user data')
        console.error('Error fetching user data:', err)
      }
    }
    
    fetchUserData()
  }, [])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers and a single decimal point
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
  
    try {
      const numericAmount = parseFloat(amount)
  
      if (isNaN(numericAmount)) {
        setError('Please enter a valid amount')
        return
      }
  
      if (numericAmount <= 150) {
        setError('Minimum deposit amount is $150')
        return
      }
  
      const result = await initiateBlockFortuneDeposit(
        numericAmount,
        cryptoType as CryptoType
      )
  
      if ('error' in result && result.error) {
        setError(result.error)
      } else if ('success' in result && result.success && result.depositDetails) {
        setDepositDetails(result.depositDetails)
      }
    } catch (err) {
      console.error('Deposit error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handlePaymentConfirmation = () => {
    setPaymentMade(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const selectedCrypto = cryptoOptions.find(option => option.value === cryptoType)

  if (depositDetails) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Complete Your Deposit</h2>
            <p className="text-gray-600 mt-2">
              Send your cryptocurrency payment to the address below to fund your BlockFortune account
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black mb-1">Amount to Send</p>
                  <p className="text-2xl text-black font-semibold">
                    ${depositDetails.amount} USD
                  </p>
                </div>
                <div className="bg-blue-100  text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {depositDetails.cryptoType}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <p className="text-sm font-medium text-black mb-2">Network</p>
                <p className="text-lg text-black font-semibold">{depositDetails.cryptoNetwork}</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <p className="text-sm font-medium text-black mb-2">Estimated Processing</p>
                <p className="text-lg text-black font-semibold">2-5 Network Confirmations</p>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500">Recipient Wallet Address</p>
                <button 
                  onClick={() => copyToClipboard(depositDetails.walletAddress)}
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                >
                  <FiCopy className="mr-1" /> Copy
                </button>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-300">
                <p className="font-mono break-all text-gray-800">{depositDetails.walletAddress}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500">Payment Reference</p>
                <button 
                  onClick={() => copyToClipboard(depositDetails.narration)}
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                >
                  <FiCopy className="mr-1" /> Copy
                </button>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-300">
                <p className="break-all text-gray-800">{depositDetails.narration}</p>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0 pt-0.5">
                  <FiAlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      • Send exactly ${depositDetails.amount} worth of {depositDetails.cryptoType} to the address above
                    </p>
                    <p className="mt-1">
                      • Transactions with incorrect amounts may require manual review and delay processing
                    </p>
                    <p className="mt-1">
                      • Funds will be credited after network confirmation (typically within 15-30 minutes)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {paymentMade ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg"
              >
                <div className="flex">
                  <div className="flex-shrink-0 pt-0.5">
                    <FiCheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Payment Received</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Thank you for your deposit. We&apos;ve received your payment details and will notify you 
                        via email once the transaction is confirmed on the blockchain.
                      </p>
                      <p className="mt-2 font-medium">
                        You can safely close this page or check your transaction status in your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePaymentConfirmation}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl text-white font-medium shadow-md transition-all"
              >
                <div className="flex items-center justify-center">
                  <span>I&apos;ve Sent the Payment</span>
                  <FiArrowRight className="ml-2" />
                </div>
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-8"
    >
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <FaWallet className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Fund Your Account</h2>
        <p className="text-gray-600 mt-2">
          Securely deposit funds using cryptocurrency to start investing with BlockFortune
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
        >
          <div className="flex">
            <div className="flex-shrink-0 pt-0.5">
              <FiAlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Processing Request</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Deposit Amount (USD)
          </label>
          <div className="mt-1 relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiDollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-4 text-lg border-gray-300 rounded-lg text-black"
              placeholder="0.00"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Minimum deposit: $150.00
          </p>
        </div>

        <div>
          <label htmlFor="cryptoType" className="block text-sm font-medium text-black mb-2">
            Select Cryptocurrency
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}
              className="relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-4 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <span className="flex text-black items-center">
                {selectedCrypto?.icon}
                <span className="ml-3 block truncate">{selectedCrypto?.label}</span>
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
                        setCryptoType(option.value)
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

        {userData && (
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                <FiMail className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Account Email</p>
                <p className="text-lg font-semibold text-gray-900">{userData.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-xl text-white font-medium shadow-md transition-all flex items-center justify-center ${
              isLoading ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
            }`}
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>Continue to Payment</span>
                <FiArrowRight className="ml-2" />
              </>
            )}
          </motion.button>
        </div>
      </form>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-center">
          <FiCreditCard className="h-5 w-5 text-gray-400" />
          <p className="ml-2 text-sm text-gray-500">
            Secure cryptocurrency deposit powered by BlockFortune
          </p>
        </div>
      </div>
    </motion.div>
  )
}