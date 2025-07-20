/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaUserFriends, 
  FaCoins, 
  FaLink, 
  FaShareAlt, 
  FaUser, 
  FaCalendarAlt, 
  FaArrowRight,
  FaPercentage
} from 'react-icons/fa'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getReferralStats, getReferralList, withdrawReferralEarnings } from '@/lib/referral'
import { toast } from 'react-toastify'

interface Referral {
  id: string
  referee_id: string
  created_at: string
  earned_amount: number
  status: 'pending' | 'paid'
  referee: {
    username: string | null
    email: string
    created_at: string
  }
}

export function ReferralDashboard() {
  const [stats, setStats] = useState<{
    total_referrals: number
    active_referrals: number
    total_earnings: number
    pending_earnings: number
    referral_code: string
    referral_link: string
    monthly_earnings: { month: string; earnings: number }[]
  } | null>(null)
  
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [activeTab, setActiveTab] = useState<'stats' | 'list'>('stats')
  const [loading, setLoading] = useState({
    stats: true,
    list: false,
    withdraw: false
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, stats: true }))
        const { data: statsData, error: statsError } = await getReferralStats()
        
        if (statsError) {
          toast.error(statsError)
          return
        }
        
        if (statsData) {
          setStats(statsData)
        }
      } catch (err) {
        console.error('Failed to load referral stats:', err)
        toast.error('Failed to load referral stats')
      } finally {
        setLoading(prev => ({ ...prev, stats: false }))
      }
    }

    fetchData()
  }, [])

  const fetchReferrals = async () => {
    try {
      setLoading(prev => ({ ...prev, list: true }))
      const { data, error } = await getReferralList()
      
      if (error) {
        toast.error(error)
        return
      }
      
      if (data) {
        setReferrals(data)
      }
    } catch (err) {
      console.error('Failed to load referral list:', err)
      toast.error('Failed to load referral list')
    } finally {
      setLoading(prev => ({ ...prev, list: false }))
    }
  }

  const handleTabChange = (tab: 'stats' | 'list') => {
    setActiveTab(tab)
    if (tab === 'list' && referrals.length === 0) {
      fetchReferrals()
    }
  }

  const handleWithdraw = async () => {
    if (!stats || stats.pending_earnings <= 0) {
      toast.warning('No pending earnings to withdraw')
      return
    }

    setLoading(prev => ({ ...prev, withdraw: true }))
    try {
      const { success, error } = await withdrawReferralEarnings()
      
      if (error) {
        toast.error(error)
        return
      }
      
      if (success) {
        toast.success(`Successfully withdrawn $${stats.pending_earnings.toFixed(2)}`)
        // Refresh stats after successful withdrawal
        const { data: statsData } = await getReferralStats()
        if (statsData) setStats(statsData)
      }
    } catch (err) {
      console.error('Failed to withdraw earnings:', err)
      toast.error('Failed to withdraw earnings')
    } finally {
      setLoading(prev => ({ ...prev, withdraw: false }))
    }
  }

  const copyToClipboard = () => {
    if (!stats) return
    navigator.clipboard.writeText(stats.referral_link)
    toast.success('Referral link copied to clipboard!')
  }

  const shareReferralLink = () => {
    if (!stats) return
    if (navigator.share) {
      navigator.share({
        title: 'Join with my referral',
        text: 'Earn with my referral link',
        url: stats.referral_link,
      }).catch(() => {
        copyToClipboard()
      })
    } else {
      copyToClipboard()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaUserFriends className="text-blue-500" />
          Referral Program
        </h1>
        
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleTabChange('stats')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            Statistics
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleTabChange('list')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            Referral List
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Tab */}
      <AnimatePresence>
        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {loading.stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 h-28 animate-pulse"
                  />
                ))}
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    icon={<FaUserFriends className="text-blue-500" />}
                    title="Total Referrals"
                    value={stats.total_referrals}
                    change={stats.total_referrals > 0 ? '+12%' : '0%'}
                  />
                  <StatCard 
                    icon={<FaUserFriends className="text-purple-500" />}
                    title="Active Referrals"
                    value={stats.active_referrals}
                    change={stats.active_referrals > 0 ? '+8%' : '0%'}
                  />
                  <StatCard 
                    icon={<FaCoins className="text-yellow-500" />}
                    title="Total Earnings"
                    value={`$${stats.total_earnings.toFixed(2)}`}
                    change={stats.total_earnings > 0 ? '+15%' : '0%'}
                  />
                  <StatCard 
                    icon={<FaCoins className="text-green-500" />}
                    title="Pending Earnings"
                    value={`$${stats.pending_earnings.toFixed(2)}`}
                  />
                </div>

                {/* Earnings Chart */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-6"
                >
                  <h3 className="text-lg font-semibold mb-4">Monthly Earnings</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.monthly_earnings}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'Earnings']}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Bar 
                          dataKey="earnings" 
                          fill="#8884d8" 
                          radius={[4, 4, 0, 0]}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Referral Link Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div 
                    whileHover={{ y: -2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FaLink className="text-blue-500" />
                      Your Referral Code
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex items-center">
                        <span className="font-mono text-sm md:text-base">{stats.referral_code}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyToClipboard}
                        className="bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-2"
                      >
                        Copy
                      </motion.button>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FaShareAlt className="text-green-500" />
                      Your Referral Link
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-hidden">
                        <p className="text-sm truncate">{stats.referral_link}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={shareReferralLink}
                        className="bg-green-600 text-white px-4 py-3 rounded-lg flex items-center gap-2"
                      >
                        Share
                      </motion.button>
                    </div>
                  </motion.div>
                </div>

                {/* Withdraw Section */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                        <FaCoins className="text-yellow-500" />
                        Available for Withdrawal
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        You can withdraw your pending earnings to your account balance
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                        <p className="text-green-700 dark:text-green-400 font-semibold">
                          ${stats.pending_earnings.toFixed(2)}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleWithdraw}
                        disabled={stats.pending_earnings <= 0 || loading.withdraw}
                        className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                          stats.pending_earnings <= 0 || loading.withdraw
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                            : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        }`}
                      >
                        {loading.withdraw ? (
                          <>
                            <FaCoins className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaCoins />
                            Withdraw
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
                <p className="text-red-500">Failed to load referral stats</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Tab */}
      <AnimatePresence>
        {activeTab === 'list' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {loading.list ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gray-100 dark:bg-gray-700 rounded-xl h-20 animate-pulse"
                  />
                ))}
              </div>
            ) : referrals.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center"
              >
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full inline-block mb-4">
                    <FaUserFriends className="text-blue-500 text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Referrals Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    You haven&apos;t referred anyone yet. Share your referral link to start earning!
                  </p>
                  {stats && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={shareReferralLink}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto"
                    >
                      <FaShareAlt />
                      Share Referral Link
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {referrals.map((referral, index) => (
                  <motion.div
                    key={referral.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <FaUser className="text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {referral.referee.username || referral.referee.email.split('@')[0]}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Joined {new Date(referral.referee.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">${referral.earned_amount.toFixed(2)}</p>
                            <p className={`text-sm ${
                              referral.status === 'paid' 
                                ? 'text-green-500' 
                                : 'text-yellow-500'
                            }`}>
                              {referral.status === 'paid' ? 'Paid' : 'Pending'}
                            </p>
                          </div>
                          <FaArrowRight className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="px-4 md:px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <FaCalendarAlt />
                        <span>{new Date(referral.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaPercentage className="text-purple-500" />
                        <span>10% Commission</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ 
  icon, 
  title, 
  value, 
  change 
}: { 
  icon: React.ReactNode, 
  title: string, 
  value: string | number,
  change?: string 
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30">
          {icon}
        </div>
      </div>
      {change && (
        <p className={`mt-2 text-sm ${
          change.startsWith('+') 
            ? 'text-green-500' 
            : change === '0%' 
              ? 'text-gray-500' 
              : 'text-red-500'
        }`}>
          {change} from last month
        </p>
      )}
    </motion.div>
  )
}