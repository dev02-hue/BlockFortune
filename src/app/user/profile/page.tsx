'use client'

import { motion } from 'framer-motion'
import { FaUser, FaWallet, FaMoneyBillWave, FaChartLine, FaEnvelope } from 'react-icons/fa'
import { GiMoneyStack } from 'react-icons/gi'
import { MdPendingActions } from 'react-icons/md'
import { useEffect, useState } from 'react'
import { getUserData } from '@/lib/getUserData'
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell,
  PieChart, 
  Pie
} from 'recharts'
import { getTotalCompletedDeposits, getTotalCompletedWithdrawals, getTotalPendingWithdrawals } from '@/lib/deposit'

interface UserData {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  pendingWithdrawal: number
  activeDeposit: number
  withdrawalTotal: number
  earnedTotal: number
  balance: number
  totalDeposits?: number 
  totalPendingWithdrawals?:number
  totalCompletedWithdrawals?:number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function UserProfile() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeChart, setActiveChart] = useState<'bar' | 'pie'>('bar')
  const [totalDeposits, setTotalDeposits] = useState<number>(0)  
  const [totalPendingWithdrawals, setTotalPendingWithdrawals] = useState<number>(0)
  const [totalCompletedWithdrawals, setTotalCompletedWithdrawals] = useState<number>(0)


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await getUserData()
        const depositsResult = await getTotalCompletedDeposits()
        const pendingWithdrawalsResult = await getTotalPendingWithdrawals()
        const completedWithdrawalsResult = await getTotalCompletedWithdrawals()
        
        if (result.error) {
          setError(result.error)
        } else if (result.user) {
          setUserData(result.user)
        }
        
        if (depositsResult.error) {
          console.error(depositsResult.error)
        } else {
          setTotalDeposits(depositsResult.total || 0)
        }
  
        if (pendingWithdrawalsResult.error) {
          console.error(pendingWithdrawalsResult.error)
        } else {
          setTotalPendingWithdrawals(pendingWithdrawalsResult.total || 0)
        }
  
        if (completedWithdrawalsResult.error) {
          console.error(completedWithdrawalsResult.error)
        } else {
          // Use this wherever you need completed withdrawals total
          setTotalCompletedWithdrawals(completedWithdrawalsResult.total || 0)
        }
      } catch (err) {
        setError('Failed to load user data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  
    fetchData()
  }, [])


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const prepareChartData = () => {
    if (!userData) return []
    
    return [
      { name: 'Balance', value: userData.balance },
      { name: 'Earned Total', value: userData.earnedTotal },
       { name: 'Pending Withdrawal', value: totalPendingWithdrawals }, 
      { name: 'Withdrawn Total', value: totalCompletedWithdrawals },
      { name: 'Total Deposits', value: totalDeposits }, 
    ].filter(item => item.value > 0)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-xs mx-auto my-4"
      >
        {error}
      </motion.div>
    )
  }

  if (!userData) {
    return (
      <div className="text-gray-500 text-center p-4">
        No user data available
      </div>
    )
  }

  const chartData = prepareChartData()

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 sm:p-6 text-white">
          <div className="flex flex-col xs:flex-row items-start xs:items-center space-x-0 xs:space-x-4 space-y-2 xs:space-y-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 p-2 sm:p-3 rounded-full"
            >
              <FaUser size={20} className="sm:w-6 sm:h-6" />
            </motion.div>
            <div className="text-center xs:text-left text-black">
              <h1 className="text-xl sm:text-2xl text-black font-bold line-clamp-1">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">@{userData.username}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-3 sm:p-4 md:p-6">
          {/* Personal Info */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
              <FaUser className="mr-2 text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 text-black">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-500 text-xs sm:text-sm">Full Name</p>
                <p className="font-medium text-sm sm:text-base">
                  {userData.firstName} {userData.lastName}
                </p>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-500 text-xs sm:text-sm">Email</p>
                <p className="font-medium text-sm sm:text-base flex items-center">
                  <FaEnvelope className="mr-2 text-blue-600 w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{userData.email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
              <FaWallet className="mr-2 text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
              Financial Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
  {[
    {
      name: 'Account Balance',
      value: userData.balance,
      icon: <GiMoneyStack className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'blue'
    },
    {
      name: 'Total Deposits',
      value: totalDeposits,
      icon: <FaMoneyBillWave className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'green'
    },
    {
      name: 'Total Earned',
      value: userData.earnedTotal,
      icon: <FaChartLine className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'purple'
    },
    {
      name: 'Pending Withdrawal',
      value: totalPendingWithdrawals, // Use the state value here
      icon: <MdPendingActions className="text-yellow-600 w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'yellow'
    },
    {
      name: 'Total Withdrawn',
      value: totalCompletedWithdrawals,
      icon: <FaMoneyBillWave className="text-red-600 w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'red'
    }
  ].map((item, index) => (
    <motion.div
      key={index}
      whileHover={{ y: -3 }}
      className={`bg-${item.color}-50 p-3 sm:p-4 rounded-lg border-l-4 border-${item.color}-500`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs sm:text-sm">{item.name}</p>
          <p className={`text-lg sm:text-xl font-bold text-${item.color}-700`}>
            {formatCurrency(item.value)}
          </p>
        </div>
        {item.icon}
      </div>
    </motion.div>
  ))}
</div>
          </div>

          {/* Financial Chart */}
          {chartData.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <FaChartLine className="mr-2 text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
                Financial Visualization
              </h2>
              
              <div className="flex justify-center mb-3">
                <div className="inline-flex rounded-md shadow-sm">
                  <button
                    onClick={() => setActiveChart('bar')}
                    className={`px-3 py-1 text-sm font-medium rounded-l-lg ${activeChart === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Bar Chart
                  </button>
                  <button
                    onClick={() => setActiveChart('pie')}
                    className={`px-3 py-1 text-sm font-medium rounded-r-lg ${activeChart === 'pie' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Pie Chart
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeChart === 'bar' ? (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                        <Legend />
                        <Bar dataKey="value" name="Amount">
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => 
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                        <Legend />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 sm:p-6 rounded-lg text-white"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-2">Your Financial Summary</h3>
            <p className="mb-3 text-sm sm:text-base">
              You currently have {formatCurrency(userData.balance)} actively invested, 
              with {formatCurrency(totalPendingWithdrawals)} pending withdrawal.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm">Net Worth</span>
              <span className="text-lg sm:text-xl font-bold">
                {formatCurrency(userData.balance)}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}