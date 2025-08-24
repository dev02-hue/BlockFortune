'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
 
  getUserInvestments,
  Investment,
  getUserBalance, 
  createInvestment
} from '@/lib/investment';
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiCalendar, 
 
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
 
  FiPieChart,
  FiZap,
 
} from 'react-icons/fi';
import { getAllInvestmentPlans, InvestmentPlan } from '@/lib/deposit';

export default function InvestmentComponent() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userBalance, setUserBalance] = useState(0);
  const [userInvestments, setUserInvestments] = useState<Investment[]>([]);
//   const [activeTab, setActiveTab] = useState<'plans' | 'investments'>('plans');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Get user ID from cookies (client-side)
    const getUserIdFromCookies = () => {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_id='))
        ?.split('=')[1];
      
      return cookieValue || '';
    };

    const id = getUserIdFromCookies();
    setUserId(id);
    
    if (id) {
      fetchPlans();
      fetchUserData(id);
    }
  }, []);

  const fetchPlans = async () => {
    const { data, error } = await getAllInvestmentPlans();
    if (!error && data) {
      setPlans(data);
      if (data.length > 0) {
        setSelectedPlan(data[0]);
      }
    }
  };

  const fetchUserData = async (userId: string) => {
    // Fetch user balance
    const balanceResult = await getUserBalance(userId);
    if (balanceResult.success) {
      setUserBalance(balanceResult.data);
    }
    
    // Fetch user investments
    const investmentsResult = await getUserInvestments(userId);
    if (investmentsResult.success) {
      setUserInvestments(investmentsResult.data);
    }
  };

  const handlePlanSelect = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    // Reset amount when plan changes if it doesn't meet the new plan's requirements
    if (amount) {
      const numAmount = parseFloat(amount);
      if (numAmount < plan.min_amount || numAmount > plan.max_amount) {
        setAmount('');
      }
    }
  };

  const handleInvest = async () => {
    if (!selectedPlan || !amount || !userId) {
      setMessage({ type: 'error', text: 'Please select a plan and enter an amount' });
      return;
    }

    const investmentAmount = parseFloat(amount);
    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    if (investmentAmount < selectedPlan.min_amount || investmentAmount > selectedPlan.max_amount) {
      setMessage({ 
        type: 'error', 
        text: `Amount must be between $${selectedPlan.min_amount} and $${selectedPlan.max_amount} for this plan` 
      });
      return;
    }

    if (investmentAmount > userBalance) {
      setMessage({ type: 'error', text: 'Insufficient balance for this investment' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await createInvestment(selectedPlan.id, investmentAmount);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Investment created successfully!' });
      setAmount('');
      fetchUserData(userId); // Refresh user data
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to create investment' });
    }
    
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Investment Plans */}
        <div className="md:w-2/3">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FiTrendingUp className="text-blue-600" />
                Investment Plans
              </h2>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                <FiDollarSign className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Balance: ${userBalance.toFixed(2)}</span>
              </div>
            </div>

            {message.text && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {message.type === 'success' ? (
                  <FiCheckCircle className="text-xl" />
                ) : (
                  <FiAlertCircle className="text-xl" />
                )}
                <span>{message.text}</span>
              </motion.div>
            )}

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
            >
              {plans.map(plan => (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  className={`border rounded-xl p-5 cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg text-gray-800">{plan.name}</h3>
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      <FiZap size={12} />
                      <span>{plan.daily_roi}% daily</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <FiCalendar size={14} />
                        Duration
                      </span>
                      <span className="text-sm font-medium">{plan.duration_days} days</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <FiDollarSign size={14} />
                        Min Investment
                      </span>
                      <span className="text-sm font-medium">${plan.min_amount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <FiDollarSign size={14} />
                        Max Investment
                      </span>
                      <span className="text-sm font-medium">${plan.max_amount}</span>
                    </div>
                  </div>
                  
                  {selectedPlan?.id === plan.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Investment Amount
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiDollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          className="block w-full pl-10 pr-3 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min={selectedPlan.min_amount}
                          max={selectedPlan.max_amount}
                          placeholder={`Enter amount (${selectedPlan.min_amount} - ${selectedPlan.max_amount})`}
                        />
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleInvest}
                        disabled={loading}
                        className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FiTrendingUp size={16} />
                            Invest Now
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right Column - User Investments */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiPieChart className="text-blue-600" />
              Your Investments
            </h2>
            
            {userInvestments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiInfo className="mx-auto text-3xl mb-2 opacity-50" />
                <p>You don&apos;t have any investments yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userInvestments.map(investment => (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-800">{investment.plan_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        investment.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : investment.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {investment.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium text-black">${investment.amount.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">ROI:</span>
                        <span className="font-medium text-black">{investment.daily_roi}% daily</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Return:</span>
                        <span className="font-medium text-black">${investment.expected_return.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium text-black">{formatDate(investment.start_date)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium text-black">{formatDate(investment.end_date)}</span>
                      </div>
                      
                      {investment.status === 'active' && (
                        <div className="pt-2 mt-2 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Days Left:</span>
                            <span className="font-medium text-blue-600">
                              {calculateDaysRemaining(investment.end_date)} days
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}