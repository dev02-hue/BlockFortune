'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiChevronUp, FiMoon, FiSun } from 'react-icons/fi';

const FAQComponent = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const faqs = [
    {
      question: "What is BlockFortune?",
      answer: "BlockFortune is a premier investment platform offering carefully curated investment plans with fixed returns. Our platform is designed to provide consistent returns with principal protection through short-term investment cycles."
    },
    {
      question: "How do I get started with investing?",
      answer: "To begin investing with BlockFortune:\n1. Create an account and complete verification\n2. Deposit funds into your BlockFortune wallet\n3. Select an investment plan that matches your financial goals\n4. Receive your principal plus returns after the plan duration"
    },
    {
      question: "Are there any fees for investing?",
      answer: "BlockFortune charges no hidden fees. The only cost is the investment amount you commit to your chosen plan. All returns are calculated net of any operational costs."
    },
    {
      question: "How are the returns calculated?",
      answer: "Returns are calculated based on the daily ROI percentage of your chosen plan. For example, our 5-Day Plan offers 3.5% daily ROI. This means a $1,000 investment would yield $1,175 ($175 profit) after 5 days, including your principal."
    },
    {
      question: "What payment methods are supported?",
      answer: "We support various payment methods including:\n- Cryptocurrencies (Bitcoin, Ethereum, USDT)\n- Bank transfers\n- Credit/debit cards"
    },
    {
      question: "When do I get my returns?",
      answer: "You receive your principal plus all returns at the end of your chosen plan duration. For example, if you invest in the 7-Day Plan, you'll receive your full payment after 7 days."
    },
    {
      question: "Is my investment secure?",
      answer: "BlockFortune employs bank-grade security measures including:\n- 256-bit SSL encryption\n- Two-factor authentication\n- Regular security audits\nAll investments include principal protection in our plans."
    },
    {
      question: "What is the referral program?",
      answer: "Our referral program allows you to earn 10% commission on investments made by users you refer. You can track your referrals and earnings in real-time through your dashboard."
    }
  ];

  const plans = [
    {
      name: "5-Day Plan",
      dailyROI: 3.5,
      min: 150,
      max: 4999,
      duration: 5,
      color: "bg-blue-500",
      description: "Principal + 17.5% return"
    },
    {
      name: "7-Day Plan",
      dailyROI: 5.5,
      min: 5000,
      max: 19999,
      duration: 7,
      color: "bg-purple-500",
      description: "Principal + 38.5% return"
    },
    {
      name: "10-Day Plan",
      dailyROI: 7.5,
      min: 20000,
      max: 49999,
      duration: 10,
      color: "bg-indigo-500",
      description: "Principal + 75% return"
    },
    {
      name: "13-Day Plan",
      dailyROI: 10.5,
      min: 50000,
      max: 100000,
      duration: 13,
      color: "bg-green-500",
      description: "Principal + 136.5% return"
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              BlockFortune <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">FAQ</span>
            </h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Answers to common questions about our investment plans
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </div>

        {/* Investment Plans Overview */}
        <div className={`mb-12 p-6 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Our Investment Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg ${plan.color} text-white`}
              >
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">Daily ROI: {plan.dailyROI}%</p>
                  <p className="text-sm">Duration: {plan.duration} days</p>
                  <p className="text-sm">Investment: ${plan.min.toLocaleString()} - ${plan.max.toLocaleString()}</p>
                  <p className="text-sm font-medium mt-1">{plan.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className={`w-full flex justify-between items-center p-4 text-left ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors duration-200`}
              >
                <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  {faq.question}
                </span>
                {activeIndex === index ? (
                  <FiChevronUp className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                ) : (
                  <FiChevronDown className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                )}
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}
                  >
                    <div className="p-4 pt-0 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className={`mt-12 p-6 rounded-lg text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Ready to invest?</h2>
          <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Join our growing community of investors today
          </p>
          <button
            className={`px-6 py-3 rounded-md font-medium ${darkMode ? 'bg-blue-400 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors duration-200`}
          >
            Start Investing Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQComponent;