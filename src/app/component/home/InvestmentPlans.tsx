"use client"
import { motion } from "framer-motion";
import { FiDollarSign, FiCalendar, FiTrendingUp, FiUsers, FiAward } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InvestmentPlans = () => {
  const plans = [
    {
      name: "XP-FLASH",
      dailyROI: 2.5,
      min: 100,
      max: 2999,
      duration: 6,
      affiliate: 7,
      color: "bg-blue-500"
    },
    {
      name: "XP-MINER",
      dailyROI: 4.5,
      min: 3000,
      max: 5999,
      duration: 7,
      affiliate: 7,
      color: "bg-purple-500"
    },
    {
      name: "XP-POOL",
      dailyROI: 7.8,
      min: 6000,
      max: 9999,
      duration: 8,
      affiliate: 7,
      color: "bg-indigo-500"
    },
    {
      name: "FOREX",
      dailyROI: 1.4,
      min: 7560,
      max: 9999,
      duration: 35,
      affiliate: 7,
      color: "bg-green-500"
    },
    {
      name: "AGRI",
      dailyROI: 1.6,
      min: 10000,
      max: 24999,
      duration: 60,
      affiliate: 7,
      color: "bg-amber-500"
    },
    {
      name: "REAL EST",
      dailyROI: 1.8,
      min: 25000,
      max: 500000,
      duration: 90,
      affiliate: 7,
      color: "bg-red-500"
    }
  ];

  // Data for the ROI comparison chart
  const roiData = plans.map(plan => ({
    name: plan.name,
    roi: plan.dailyROI,
    color: plan.color.replace("bg-", "text-")
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Investment <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Plans</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose from our range of professionally managed investment portfolios with competitive returns.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plans Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={`plan-${index}`}
                variants={item}
                whileHover={{ y: -5 }}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden ${plan.color} bg-opacity-10 dark:bg-opacity-10`}
              >
                <div className="absolute top-0 right-0 w-16 h-16 -mr-6 -mt-6 rounded-full opacity-20" style={{ backgroundColor: plan.color }}></div>
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{plan.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${plan.color} text-white`}>
                    {plan.dailyROI}% Daily
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <FiDollarSign className="text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Min: {formatCurrency(plan.min)}</span>
                  </div>
                  <div className="flex items-center">
                    <FiDollarSign className="text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Max: {formatCurrency(plan.max)}</span>
                  </div>
                  <div className="flex items-center">
                    <FiCalendar className="text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Duration: {plan.duration} days</span>
                  </div>
                  <div className="flex items-center">
                    <FiUsers className="text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Affiliate: {plan.affiliate}%</span>
                  </div>
                </div>

                <button className={`mt-6 w-full py-2 rounded-lg ${plan.color} bg-opacity-90 hover:bg-opacity-100 text-white font-medium transition-all`}>
                  Invest Now
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* ROI Comparison Chart */}
          <motion.div
  initial={{ opacity: 0, x: 20 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5, delay: 0.2 }}
  viewport={{ once: true }}
  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
>
  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
    <FiTrendingUp className="mr-2 text-blue-500" />
    Daily ROI Comparison
  </h3>
  
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={roiData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.2} />
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6B7280', fontSize: 12 }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#1F2937',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white'
          }}
          formatter={(value) => [`${value}%`, "Daily ROI"]}
          labelFormatter={(label) => `Plan: ${label}`}
        />
        {roiData.map((entry, index) => (
          <Bar 
            key={`bar-${index}`}
            dataKey="roi"  // Added the required dataKey prop
            fill={entry.color}
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
            </div>

            {/* Key Features */}
            <div className="mt-8 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="flex items-start"
              >
                <div className="flex-shrink-0 mt-1 mr-3 text-blue-500 dark:text-blue-400">
                  <FiAward className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">Professional Management</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">All plans are managed by our team of certified financial experts.</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="flex items-start"
              >
                <div className="flex-shrink-0 mt-1 mr-3 text-green-500 dark:text-green-400">
                  <FiDollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">Daily Payouts</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Earnings are calculated and paid daily to your account.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InvestmentPlans;