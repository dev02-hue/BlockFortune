"use client"
import { motion } from "framer-motion";
import { FiDollarSign, FiCalendar, FiTrendingUp, FiUsers, FiAward } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InvestmentPlans = () => {
  const plans = [
    {
      name: "5-Day Plan",
      dailyROI: 3.5,
      min: 150,
      max: 4999,
      duration: 5,
      affiliate: 10,
      color: "bg-blue-500",
      description: "Includes principal after 5 days"
    },
    {
      name: "7-Day Plan",
      dailyROI: 5.5,
      min: 5000,
      max: 19999,
      duration: 7,
      affiliate: 10,
      color: "bg-purple-500",
      description: "Includes principal after 7 days"
    },
    {
      name: "10-Day Plan",
      dailyROI: 7.5,
      min: 20000,
      max: 49999,
      duration: 10,
      affiliate: 10,
      color: "bg-indigo-500",
      description: "Includes principal after 10 days"
    },
    {
      name: "13-Day Plan",
      dailyROI: 10.5,
      min: 50000,
      max: 100000,
      duration: 13,
      affiliate: 10,
      color: "bg-green-500",
      description: "Includes principal after 13 days"
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
            Choose from our range of investment plans with competitive returns and principal included.
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
                    <span className="text-gray-600 dark:text-gray-300">Referral: {plan.affiliate}%</span>
                  </div>
                  <div className="pt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                    {plan.description}
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
                  <Bar 
                    dataKey="roi"
                    fill="#4f46e5" // Using a single color for simplicity
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
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
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">Principal Included</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Your initial investment is included in the daily returns.</p>
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
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">Referral Bonus</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Earn 10% commission on every referral investment.</p>
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