"use client"
import { motion } from "framer-motion";
import { FiTrendingUp, FiDollarSign, FiUsers, FiActivity, FiShield, FiAward, FiGlobe, FiPieChart } from "react-icons/fi";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';



const EnhancedStatsDashboard = () => {
  // State for crypto data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
const [cryptoData, setCryptoData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [marketData, setMarketData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Fetch data from CoinGecko API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch top cryptocurrencies
        const cryptoResponse = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=4&page=1&sparkline=true&price_change_percentage=24h'
        );
        const cryptoData = await cryptoResponse.json();
        
        // Fetch global market data
        const globalResponse = await fetch('https://api.coingecko.com/api/v3/global');
        const globalData = await globalResponse.json();
        
        setCryptoData(cryptoData);
        setMarketData(globalData.data);
        setLoading(false);
        
        // Set up polling every 30 seconds
        const interval = setInterval(async () => {
          const updatedCryptoResponse = await fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=4&page=1&sparkline=true&price_change_percentage=24h'
          );
          const updatedCryptoData = await updatedCryptoResponse.json();
          setCryptoData(updatedCryptoData);
        }, 30000);
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format market cap
  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value}`;
  };

  // Stats with real-time data
  const stats = [
    {
      icon: <FiDollarSign className="w-6 h-6" />,
      value: marketData.total_market_cap ? formatMarketCap(marketData.total_market_cap.usd) : "$1.2B+",
      label: "Market Cap",
      change: marketData.market_cap_change_percentage_24h_usd ? 
        `${marketData.market_cap_change_percentage_24h_usd.toFixed(2)}%` : "+12.5%",
      isPositive: marketData.market_cap_change_percentage_24h_usd ? 
        marketData.market_cap_change_percentage_24h_usd >= 0 : true,
      tooltip: "Total cryptocurrency market capitalization"
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      value: marketData.active_cryptocurrencies ? 
        `${marketData.active_cryptocurrencies.toLocaleString()}+` : "500K+",
      label: "Active Cryptocurrencies",
      change: "+8.2%",
      isPositive: true,
      tooltip: "Number of active cryptocurrencies tracked"
    },
    {
      icon: <FiActivity className="w-6 h-6" />,
      value: "98.7%",
      label: "Uptime Reliability",
      change: "99.9% peak",
      isPositive: true,
      tooltip: "Platform availability last quarter"
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      value: marketData.markets ? marketData.markets : "14",
      label: "Markets",
      change: "3 new in 2023",
      isPositive: true,
      tooltip: "Number of active trading markets"
    }
  ];

  const features = [
    {
      icon: <FiAward className="w-5 h-5" />,
      title: "Award-Winning Platform",
      description: "Recognized by FinTech Breakthrough Awards 2023"
    },
    {
      icon: <FiGlobe className="w-5 h-5" />,
      title: "Global Liquidity",
      description: "Access to 25+ liquidity providers worldwide"
    },
    {
      icon: <FiPieChart className="w-5 h-5" />,
      title: "Advanced Analytics",
      description: "Real-time market depth and volume indicators"
    }
  ];

  // Generate sparkline data for charts
  const generateSparklineData = (sparkline: number[]) => {
    return sparkline.map((value, index) => ({
      name: index.toString(),
      value
    }));
  };

  // Market data for charts
  const marketChartData = [
    { name: 'Crypto', value: marketData.total_market_cap ? (marketData.total_market_cap.usd / 1e12).toFixed(2) : 1.2, change: marketData.market_cap_change_percentage_24h_usd ? marketData.market_cap_change_percentage_24h_usd.toFixed(2) : 2.5 },
    { name: 'DeFi', value: marketData.defi_market_cap ? (marketData.defi_market_cap / 1e9).toFixed(2) : 0.8, change: marketData.defi_24h_change ? marketData.defi_24h_change.toFixed(2) : 1.8 },
    { name: 'NFTs', value: marketData.nft_market_cap ? (marketData.nft_market_cap / 1e9).toFixed(2) : 0.5, change: -1.2 },
    { name: 'Stablecoins', value: marketData.stablecoin_market_cap ? (marketData.stablecoin_market_cap / 1e9).toFixed(2) : 0.3, change: 0.8 }
  ];

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
    <section className="py-16 bg-gradient-to-br from-blue-900/5 via-gray-50 to-purple-900/5 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="container mx-auto px-4">
        {/* Main Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            BlockFortune <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">By The Numbers</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive metrics showcasing our platform&apos;s performance, security, and global reach.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={`stat-${index}`}
              variants={item}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 relative group"
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 ${stat.isPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                {stat.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {stat.label}
              </p>
              <div className={`flex items-center ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                <FiTrendingUp className="mr-1" />
                <span className="text-sm font-medium">{stat.change}</span>
              </div>
              <div className="absolute bottom-2 right-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">{stat.tooltip}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features & Performance Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
        >
          {/* Platform Features */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Platform Features</h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={`feature-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start"
                >
                  <div className="flex-shrink-0 mt-1 mr-3 text-blue-500 dark:text-blue-400">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-100">{feature.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 lg:col-span-2">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Top Performing Assets</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">24h Change</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Market Cap</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chart</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                        Loading data...
                      </td>
                    </tr>
                  ) : (
                    cryptoData.map((asset, index) => {
                      const change = asset.price_change_percentage_24h;
                      const isPositive = change >= 0;
                      const sparklineData = generateSparklineData(asset.sparkline_in_7d.price.slice(0, 7));
                      
                      return (
                        <motion.tr
                          key={`asset-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          viewport={{ once: true }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 mr-3">
                                <img src={asset.image} alt={asset.name} className="h-8 w-8 rounded-full" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{asset.name}</div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">{asset.symbol.toUpperCase()}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                            ${asset.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                          </td>
                          <td className={`px-4 py-4 whitespace-nowrap ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {change.toFixed(2)}%
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                            ${(asset.market_cap / 1e9).toFixed(2)}B
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="w-24 h-10">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparklineData}>
                                  <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={isPositive ? "#10B981" : "#EF4444"} 
                                    fill={isPositive ? "#D1FAE5" : "#FEE2E2"} 
                                    strokeWidth={2}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Market Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Market Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketChartData.map((market, index) => (
              <motion.div
                key={`market-${index}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{market.name}</span>
                  <span className={`text-sm font-medium ${market.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {market.change >= 0 ? '+' : ''}{market.change}%
                  </span>
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[market]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.2} />
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Tooltip 
                        formatter={(value) => [`$${value}B`, "Market Cap"]}
                        labelFormatter={() => ''}
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: 'none',
                          borderRadius: '0.5rem',
                          color: 'white'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[4, 4, 0, 0]} 
                        fill={market.change >= 0 ? "#3B82F6" : "#EF4444"}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EnhancedStatsDashboard;