'use client';

import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck, FiUsers, FiTrendingUp, FiShield, FiGlobe } from 'react-icons/fi';

const AboutPage = ({ darkMode }: { darkMode: boolean }) => {
  const successStories = [
    {
      name: "Michael T.",
      location: "New York, USA",
      investment: "XP-MINER",
      amount: "$5,000",
      return: "$7,650",
      duration: "7 days",
      quote: "BlockFortune helped me achieve financial freedom faster than I imagined. The returns are consistent and withdrawals are prompt."
    },
    {
      name: "Sarah K.",
      location: "London, UK",
      investment: "REAL EST",
      amount: "$50,000",
      return: "$81,000",
      duration: "90 days",
      quote: "As a real estate professional, I was skeptical about digital investments. BlockFortune changed my perspective completely."
    },
    {
      name: "David L.",
      location: "Dubai, UAE",
      investment: "FOREX",
      amount: "$8,000",
      return: "$11,200",
      duration: "35 days",
      quote: "The forex investment plan provided stable returns that outperformed my traditional brokerage accounts."
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 mt-24 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-4xl md:text-5xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}
          >
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Revolutionizing Wealth Creation
            </span> Through Smart Investments
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            BlockFortune is a premier digital investment platform offering institutional-grade opportunities to individual investors worldwide. Since 2018, we&apos;ve helped over 50,000 clients grow their capital through diversified, high-yield investment strategies.
          </motion.p>
        </section>

        {/* Our Story */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Our <span className="text-blue-500">Story</span>
              </h2>
              <div className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <p>
                  Founded in 2018 by a team of Wall Street veterans and blockchain experts, BlockFortune was born from a simple idea: democratize access to high-yield investment opportunities traditionally reserved for institutional investors.
                </p>
                <p>
                  We recognized that technological advancements in blockchain, algorithmic trading, and global markets could be harnessed to create reliable passive income streams for everyday investors.
                </p>
                <p>
                  Today, we manage over $250M in assets across our diversified investment vehicles, maintaining an industry-leading 98.7% client satisfaction rate.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`p-8 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
            >
              <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Why Choose BlockFortune?
              </h3>
              <ul className="space-y-4">
                {[
                  "Institutional-grade investment strategies",
                  "Diversified portfolio options",
                  "Transparent performance tracking",
                  "24/7 client support",
                  "Bank-level security protocols",
                  "Regulatory compliant operations"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <FiCheck className={`mt-1 mr-3 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Investment Philosophy */}
        <section className={`mb-20 p-8 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Our <span className="text-blue-500">Investment Philosophy</span>
            </h2>
            <p className={`mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              At BlockFortune, we believe in three core principles that guide every investment decision we make:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <FiTrendingUp size={32} className={`mx-auto mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />,
                  title: "Risk-Adjusted Returns",
                  description: "We prioritize sustainable growth over speculative gains, carefully balancing risk and reward across all our investment plans."
                },
                {
                  icon: <FiShield size={32} className={`mx-auto mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />,
                  title: "Capital Preservation",
                  description: "Your principal is protected through diversified allocations and conservative position sizing in all market conditions."
                },
                {
                  icon: <FiGlobe size={32} className={`mx-auto mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />,
                  title: "Global Opportunities",
                  description: "We leverage worldwide market inefficiencies across crypto, forex, commodities, and real estate to maximize returns."
                }
              ].map((item, index) => (
                <div key={index} className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm`}>
                  {item.icon}
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.title}</h3>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Success Stories */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={`text-3xl font-bold mb-6 text-center ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Investor <span className="text-blue-500">Success Stories</span>
            </h2>
            <p className={`mb-12 text-center max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Don&apos;t just take our word for it. Here&apos;s what our investors have to say about their experience with BlockFortune.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {successStories.map((story, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className={`mb-4 p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} w-12 h-12 flex items-center justify-center`}>
                    <FiUsers className={`${darkMode ? 'text-blue-400' : 'text-blue-500'}`} size={20} />
                  </div>
                  <p className={`italic mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>&apos;{story.quote}&apos;</p>
                  <div className={`border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h4 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{story.name}</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{story.location}</p>
                    <div className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p>Invested: <span className="font-medium">{story.amount}</span> in {story.investment}</p>
                      <p>Received: <span className="font-medium">{story.return}</span> in {story.duration}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className={`py-12 px-8 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Ready to Start Your <span className="text-blue-500">Investment Journey</span>?
            </h2>
            <p className={`mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Join thousands of investors growing their wealth with BlockFortune&apos;s proven investment strategies.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                className={`px-6 py-3 rounded-md font-medium flex items-center justify-center ${darkMode ? 'bg-blue-400 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors duration-200`}
              >
                Get Started <FiArrowRight className="ml-2" />
              </button>
              <button
                className={`px-6 py-3 rounded-md font-medium flex items-center justify-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-white hover:bg-gray-100 text-gray-800'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} transition-colors duration-200`}
              >
                Explore Investment Plans
              </button>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;