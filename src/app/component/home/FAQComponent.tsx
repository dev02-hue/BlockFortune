"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I get started with investing?",
      answer: "To start investing, simply sign up for an account, choose an investment plan that suits your goals, make a deposit, and watch your investment grow. Our platform makes it easy to track your earnings in real-time."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), BNB, USDT (TRC20), Dogecoin (DOGE), and Solana (SOL). All deposits are processed securely through blockchain technology."
    },
    {
      question: "How are profits calculated and paid?",
      answer: "Profits are calculated based on the daily ROI percentage of your chosen plan and are compounded daily. Earnings are automatically credited to your account balance and can be withdrawn or reinvested according to your plan's terms."
    },
    {
      question: "What is the minimum investment amount?",
      answer: "The minimum investment varies by plan, starting from $150 for our 5-Day Plan up to $50,000 for our 13-Day Plan. Each plan clearly states its minimum and maximum investment limits."
    },
    {
      question: "How do withdrawals work?",
      answer: "Withdrawals can be requested through your dashboard. Processing times vary by cryptocurrency but typically complete within 24 hours. There may be network fees depending on the cryptocurrency you're withdrawing to."
    },
    {
      question: "Is my investment secure?",
      answer: "We employ industry-standard security measures including SSL encryption, two-factor authentication, and cold storage for digital assets. However, as with any investment, we recommend only investing what you can afford to lose."
    },
    {
      question: "Can I change my investment plan?",
      answer: "You can upgrade to a higher-tier plan at any time by making an additional deposit that meets the new plan's minimum requirement. Downgrades or plan changes during an active investment period are not permitted."
    },
    {
      question: "How does the referral program work?",
      answer: "Our referral program awards you 10% of your referrals' deposits. These bonuses are credited to your account immediately and can be withdrawn or reinvested according to your current plan's terms."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our investment platform
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                aria-expanded={activeIndex === index}
                aria-controls={`faq-content-${index}`}
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {faq.question}
                </h3>
                <span className="ml-4 text-gray-500">
                  {activeIndex === index ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                </span>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    id={`faq-content-${index}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0 text-gray-600">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

 