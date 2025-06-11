"use client"
import { motion } from "framer-motion";
import { FaHeadset, FaChartLine, FaShieldAlt, FaExchangeAlt } from "react-icons/fa";

const TradingFeatures = () => {
  const features = [
    {
      icon: <FaHeadset className="w-8 h-8 text-blue-500 dark:text-blue-400" />,
      title: "Customer support 24/7",
      description: "Our support team is available to answer all questions regarding the BlockFortune investors portal, account issues, and casual inquiries."
    },
    {
      icon: <FaChartLine className="w-8 h-8 text-blue-500 dark:text-blue-400" />,
      title: "Trade over 15 Markets",
      description: "Trade global CFD markets including Forex, Cryptocurrencies, Indices, Commodities, Share CFDs and ETFs."
    },
    {
      icon: <FaShieldAlt className="w-8 h-8 text-blue-500 dark:text-blue-400" />,
      title: "Regulated broker",
      description: "We are regulated by the world's biggest supervision authorities including the Financial Conduct Authority."
    },
    {
      icon: <FaExchangeAlt className="w-8 h-8 text-blue-500 dark:text-blue-400" />,
      title: "No requotes",
      description: "Our advanced trading technology allows you to avoid requotes and trade with full confidence."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      transition: { duration: 0.2 }
    }
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Trade with Highly Rated Wall Street Traders
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We&apos;re a top provider of CFDs and mirror trading operations in over 14 countries using automated trading computers for market decisions and instant executions.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <motion.div 
                  className="mb-4"
                  whileHover={{ scale: 1.1 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            BlockFortune was established in 2018 in New Zealand. We give investors leveraged access to financial markets through our award-winning portal.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TradingFeatures;