'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'
import { getUserData } from '@/lib/getUserData'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  Treemap,
  ReferenceLine
} from 'recharts'
import {
  FiUser, FiTrendingUp, FiPieChart,
  FiRefreshCw, FiGlobe, FiActivity,
  FiBell
} from 'react-icons/fi'
import { FaBitcoin, FaEthereum } from 'react-icons/fa'
import { SiLitecoin, SiDogecoin, SiRipple } from 'react-icons/si'
import { TbCurrencyDollar, TbCurrencyEuro, TbCurrencyPound } from 'react-icons/tb'
import { getTotalCompletedDeposits, getTotalCompletedWithdrawals, getTotalPendingWithdrawals } from '@/lib/deposit'

// API endpoints
const COINGECKO_API = 'https://api.coingecko.com/api/v3'
const FOREX_API = 'https://api.exchangerate-api.com/v4/latest/USD'
const CRYPTO_NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/'

// Types
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
}

interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  sparkline_in_7d: { price: number[] }
}

interface ForexData {
  rates: {
    EUR: number
    GBP: number
    JPY: number
    AUD: number
    CAD: number
  }
  base: string
  timestamp: number
}

interface NewsItem {
  title: string
  url: string
  source: string
  published_on: number
}

const COLORS = ['#1E3A8A', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444']

export default function ProfessionalDashboard() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [forexData, setForexData] = useState<ForexData | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [totalDeposits, setTotalDeposits] = useState<number>(0)  
  const [totalPendingWithdrawals, setTotalPendingWithdrawals] = useState<number>(0)
  const [totalCompletedWithdrawals, setTotalCompletedWithdrawals] = useState<number>(0)
  const [loading, setLoading] = useState({
    user: true,
    crypto: true,
    forex: true,
    news: true
  })
  const [error, setError] = useState<string | null>(null)
  const [activeTimeframe, setActiveTimeframe] = useState('24h')

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      // User data
      const userResult = await getUserData()
      const depositsResult = await getTotalCompletedDeposits()
      const pendingWithdrawalsResult = await getTotalPendingWithdrawals()
      const completedWithdrawalsResult = await getTotalCompletedWithdrawals()
      
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
        setTotalCompletedWithdrawals(completedWithdrawalsResult.total || 0)
      }      

      if (userResult.error) throw new Error(userResult.error)
      if (userResult.user) {
        setUserData(userResult.user)
      } else {
        throw new Error('User data is undefined')
      }

      // Crypto data
      const cryptoRes = await fetch(`${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`)
      const cryptoData = await cryptoRes.json()
      setCryptoData(cryptoData)

      // Forex data
      const forexRes = await fetch(FOREX_API)
      const forexData = await forexRes.json()
      setForexData(forexData)

      // News
      const newsRes = await fetch(CRYPTO_NEWS_API)
      const newsData = await newsRes.json()
      setNews(newsData.Data.slice(0, 5))

      setLoading({
        user: false,
        crypto: false,
        forex: false,
        news: false
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      setLoading({
        user: false,
        crypto: false,
        forex: false,
        news: false
      })
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 300000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [fetchData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const prepareFinancialData = () => {
    if (!userData) return []
    return [
      { name: 'Balance', value: userData.balance },
      { name: 'Active Deposit', value: totalDeposits },
      { name: 'Earned Total', value: userData.earnedTotal },
      { name: 'Pending withdrawal', value: totalPendingWithdrawals },
      { name: 'Withdrawn', value: totalCompletedWithdrawals },
    ].filter(item => item.value > 0)
  }

  const prepareCryptoChartData = () => {
    return cryptoData.map(crypto => ({
      name: crypto.symbol.toUpperCase(),
      price: crypto.current_price,
      change: crypto.price_change_percentage_24h,
      marketCap: crypto.market_cap / 1000000000, // In billions
      volume: crypto.sparkline_in_7d.price
    }))
  }

  const prepareForexChartData = () => {
    if (!forexData) return []
    return [
      { currency: 'EUR/USD', rate: forexData.rates.EUR, icon: <TbCurrencyEuro /> },
      { currency: 'GBP/USD', rate: forexData.rates.GBP, icon: <TbCurrencyPound /> },
      { currency: 'USD/JPY', rate: 1 / forexData.rates.JPY, icon: '¥' },
      { currency: 'AUD/USD', rate: forexData.rates.AUD, icon: 'A$' },
      { currency: 'USD/CAD', rate: 1 / forexData.rates.CAD, icon: 'C$' },
    ]
  }

  const getCryptoIcon = (symbol: string) => {
    switch (symbol.toLowerCase()) {
      case 'btc': return <FaBitcoin className="text-amber-500" />
      case 'eth': return <FaEthereum className="text-indigo-500" />
      case 'ltc': return <SiLitecoin className="text-gray-500" />
      case 'doge': return <SiDogecoin className="text-amber-400" />
      case 'xrp': return <SiRipple className="text-blue-500" />
      default: return <FaBitcoin />
    }
  }

  if (loading.user || loading.crypto || loading.forex) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto my-8"
      >
        {error}
        <button 
          onClick={fetchData}
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center ml-auto"
        >
          <FiRefreshCw className="mr-1" /> Retry
        </button>
      </motion.div>
    )
  }

  const financialData = prepareFinancialData()
  const cryptoChartData = prepareCryptoChartData()
  const forexChartData = prepareForexChartData()

  return (
    <div className="min-h-screen w-full bg-gray-50 p-2 sm:p-4 md:p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl shadow-lg mb-4 p-4 text-white"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <motion.div 
              whileHover={{ rotate: 360 }}
              className="bg-white/20 p-2 rounded-full mr-3"
            >
              <FiGlobe size={24} />
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">BlockFortune Dashboard</h1>
              <p className="text-blue-100 text-sm">Real-time market data & portfolio analytics</p>
            </div>
          </div>
          {userData && (
            <div className="flex items-center space-x-2 bg-white/10 p-2 rounded-lg">
              <div className="bg-white/20 p-1 rounded-full">
                <FiUser size={18} />
              </div>
              <div>
                <p className="font-medium text-sm">{userData.firstName} {userData.lastName}</p>
                <p className="text-blue-100 text-xs">@{userData.username}</p>
              </div>
            </div>
          )}
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* User Summary Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-4 lg:col-span-1 border border-gray-200"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center text-gray-800">
              <FiUser className="mr-2 text-blue-700" /> Portfolio Summary
            </h2>
            <button 
              onClick={fetchData}
              className="text-gray-500 hover:text-blue-700 transition-colors"
            >
              <FiRefreshCw size={16} />
            </button>
          </div>

          {userData ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-700">
                <p className="text-gray-600 text-xs">Total Balance</p>
                <p className="text-xl font-bold text-blue-800">
                  {formatCurrency(userData.balance)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="text-gray-600 text-xs">Active Deposit</p>
                  <p className="text-lg font-bold text-green-700">
                    {formatCurrency(totalDeposits)}
                  </p>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                  <p className="text-gray-600 text-xs">Total Earned</p>
                  <p className="text-lg font-bold text-purple-700">
                    {formatCurrency(userData.earnedTotal)}
                  </p>
                </div>
              </div>

              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {financialData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No user data available
            </div>
          )}
        </motion.div>

        {/* Market Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-4 lg:col-span-2 border border-gray-200"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center text-gray-800">
              <FiActivity className="mr-2 text-blue-700" /> Market Overview
            </h2>
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {['24h', '7d', '30d', '90d'].map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setActiveTimeframe(timeframe)}
                  className={`px-2 py-1 text-xs rounded-md ${activeTimeframe === timeframe ? 'bg-blue-700 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>

          {/* Crypto Price Chart */}
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cryptoChartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#4B5563" />
                <YAxis domain={['auto', 'auto']} stroke="#4B5563" />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => `${label} Price`}
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '0.5rem' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#1E3A8A" 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                />
                <ReferenceLine y={0} stroke="#9CA3AF" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Crypto Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Asset</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">24h Change</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Market Cap</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cryptoData.map((crypto) => (
                  <motion.tr 
                    key={crypto.id}
                    whileHover={{ scale: 1.01 }}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-2">{getCryptoIcon(crypto.symbol)}</span>
                        <span className="font-medium text-gray-900">{crypto.name}</span>
                        <span className="text-gray-500 ml-1">{crypto.symbol.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                      {formatCurrency(crypto.current_price)}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap ${crypto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(crypto.price_change_percentage_24h)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                      {formatCurrency(crypto.market_cap)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Forex Rates */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
        >
          <h2 className="text-lg font-semibold flex items-center mb-4 text-gray-800">
            <TbCurrencyDollar className="mr-2 text-blue-700" /> Forex Rates
          </h2>
          
          {forexData ? (
            <div>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={forexChartData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="currency" stroke="#4B5563" />
                    <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 0.2']} stroke="#4B5563" />
                    <Radar name="Exchange Rate" dataKey="rate" stroke="#1E3A8A" fill="#1E3A8A" fillOpacity={0.6} />
                    <Tooltip 
                      formatter={(value) => typeof value === 'number' ? value.toFixed(4) : value}
                      contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '0.5rem' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {forexChartData.map((pair, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg mr-2 text-amber-500">{pair.icon}</span>
                      <span className="font-medium text-gray-800">{pair.currency}</span>
                    </div>
                    <span className="font-mono text-gray-900">{pair.rate.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Loading forex data...
            </div>
          )}
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
        >
          <h2 className="text-lg font-semibold flex items-center mb-4 text-gray-800">
            <FiTrendingUp className="mr-2 text-blue-700" /> Performance Metrics
          </h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid stroke="#E5E7EB" />
                <XAxis type="number" dataKey="marketCap" name="Market Cap (B)" unit="B" stroke="#4B5563" />
                <YAxis type="number" dataKey="change" name="24h Change" unit="%" stroke="#4B5563" />
                <Tooltip 
                  formatter={(value, name) => 
                    name === '24h Change' ? `${value}%` : `$${value}B`
                  }
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '0.5rem' }}
                />
                <Legend />
                <Scatter name="Cryptocurrencies" data={cryptoChartData} fill="#1E3A8A">
                  {cryptoChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Market Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
        >
          <h2 className="text-lg font-semibold flex items-center mb-4 text-gray-800">
            <FiPieChart className="mr-2 text-blue-700" /> Market Distribution
          </h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={cryptoData.map(crypto => ({
                  name: crypto.name,
                  size: crypto.market_cap
                }))}
                dataKey="size"
                aspectRatio={4/3}
                stroke="#fff"
                fill="#1E3A8A"
              >
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '0.5rem' }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* News Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
      >
        <h2 className="text-lg font-semibold flex items-center mb-4 text-gray-800">
          <FiBell className="mr-2 text-blue-700" /> Latest Market News
        </h2>
        
        <AnimatePresence>
          {news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {news.map((item, index) => (
                <motion.a
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5 }}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-gray-50 hover:bg-blue-50"
                >
                  <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-xs flex items-center">
                    <span>{item.source}</span>
                    <span className="mx-1">•</span>
                    <span>{new Date(item.published_on * 1000).toLocaleDateString()}</span>
                  </p>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              {loading.news ? 'Loading news...' : 'No news available'}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}