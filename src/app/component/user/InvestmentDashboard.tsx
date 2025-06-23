"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight, FiDollarSign, FiCalendar, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for charts
const generateChartData = (days: number, volatility = 0.2) => {
  return Array.from({ length: days }, (_, i) => {
      const baseValue = 100;
      const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;
      return {
          day: `Day ${i + 1}`,
          value: Math.round(baseValue * (1 + i * 0.1) * randomFactor),
      };
  });
};

// Mock CoinGecko data
const mockCoinData = [
  { id: 'bitcoin', symbol: 'btc', current_price: 62345, price_change_percentage_24h: 2.5 },
  { id: 'ethereum', symbol: 'eth', current_price: 3456, price_change_percentage_24h: 1.8 },
  { id: 'solana', symbol: 'sol', current_price: 142, price_change_percentage_24h: 5.2 },
];

// TradingView Widget component
const TradingViewWidget = ({ symbol }: { symbol: string }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: '100%',
      height: '100%',
      locale: 'en',
      dateRange: '1M',
      colorTheme: 'dark',
      trendLineColor: 'rgba(41, 98, 255, 1)',
      underLineColor: 'rgba(41, 98, 255, 0.3)',
      isTransparent: true,
      autosize: true,
    });
    const widgetElement = document.getElementById(`tradingview-widget-${symbol}`);
    if (widgetElement) {
        widgetElement.appendChild(script);
    }

    return () => {
      const widgetElement = document.getElementById(`tradingview-widget-${symbol}`);
      if (widgetElement) {
        widgetElement.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div 
      id={`tradingview-widget-${symbol}`} 
      className="h-64 rounded-lg overflow-hidden"
    />
  );
};

type InvestmentPlan = {
  name: string;
  minPrice: number;
  maxPrice: number;
  duration: number;
  dailyReturns: number;
  referral: number;
};

const InvestmentPlanCard = ({ plan, index }: { plan: InvestmentPlan; index: number }) => {
  const [hovered, setHovered] = useState(false);
  const chartData = generateChartData(plan.duration, 0.15 + index * 0.05);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative p-6 rounded-xl border ${getPlanBorderColor(plan.name)} bg-gradient-to-br ${getPlanGradient(plan.name)}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-20 backdrop-blur-sm text-black">
        {plan.name}
      </div>
      
      <h3 className="text-2xl font-bold mb-2 ">{plan.name} Plan</h3>
      <p className="text-sm opacity-80 mb-6">Optimal investment for {plan.duration} days</p>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center">
          <FiDollarSign className="mr-2" />
          <div>
            <p className="text-xs opacity-60">Investment</p>
            <p>${plan.minPrice.toLocaleString()} - ${plan.maxPrice.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center">
          <FiTrendingUp className="mr-2" />
          <div>
            <p className="text-xs opacity-60">Daily Returns</p>
            <p>{plan.dailyReturns}%</p>
          </div>
        </div>
        <div className="flex items-center">
          <FiCalendar className="mr-2" />
          <div>
            <p className="text-xs opacity-60">Duration</p>
            <p>{plan.duration} Days</p>
          </div>
        </div>
        <div className="flex items-center">
          <FiUsers className="mr-2" />
          <div>
            <p className="text-xs opacity-60">Referral Bonus</p>
            <p>{plan.referral}%</p>
          </div>
        </div>
      </div>
      
      <div className="h-40 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={getPlanChartColor(plan.name)} 
              fill={getPlanChartColor(plan.name)} 
              fillOpacity={0.2} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="h-32 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar 
              dataKey="value" 
              fill={getPlanChartColor(plan.name)} 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <motion.div
        animate={{ 
          scale: hovered ? 1.02 : 1,
          boxShadow: hovered ? '0 10px 25px -5px rgba(0, 0, 0, 0.2)' : 'none'
        }}
        transition={{ duration: 0.3 }}
      >
        <Link href={`/user/deposit`} passHref>
          <button className={`w-full py-3 rounded-lg font-medium flex items-center justify-center ${getPlanButtonColor(plan.name)}`}>
            Invest Now <FiArrowRight className="ml-2" />
          </button>
        </Link>
      </motion.div>
    </motion.div>
  );
};

// Helper functions for styling
interface PlanBorderColor {
    [key: string]: string;
}

const getPlanBorderColor = (planName: string): string => {
    const borderColors: PlanBorderColor = {
        starter: 'border-blue-400',
        silver: 'border-gray-300',
        gold: 'border-yellow-500',
        vip: 'border-purple-500',
    };

    return borderColors[planName.toLowerCase()] || 'border-gray-700';
};

const getPlanGradient = (planName: string) => {
  switch(planName.toLowerCase()) {
    case 'starter': return 'from-blue-900/50 to-blue-800/50';
    case 'silver': return 'from-gray-800/50 to-gray-700/50';
    case 'gold': return 'from-yellow-800/50 to-yellow-700/50';
    case 'vip': return 'from-purple-900/50 to-purple-800/50';
    default: return 'from-gray-900/50 to-gray-800/50';
  }
};

const getPlanChartColor = (planName: string): string => {
  switch(planName.toLowerCase()) {
    case 'starter': return '#60a5fa';
    case 'silver': return '#9ca3af';
    case 'gold': return '#eab308';
    case 'vip': return '#a855f7';
    default: return '#6b7280';
  }
};

const getPlanButtonColor = (planName: string): string => {
  switch(planName.toLowerCase()) {
    case 'starter': return 'bg-blue-600 hover:bg-blue-700 text-white';
    case 'silver': return 'bg-gray-600 hover:bg-gray-700 text-white';
    case 'gold': return 'bg-yellow-600 hover:bg-yellow-700 text-white';
    case 'vip': return 'bg-purple-600 hover:bg-purple-700 text-white';
    default: return 'bg-gray-600 hover:bg-gray-700 text-white';
  }
};

const InvestmentDashboard = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [cryptoData, setCryptoData] = useState(mockCoinData);

  // In a real app, you would fetch this from CoinGecko API
  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setCryptoData(mockCoinData.map(coin => ({
        ...coin,
        current_price: coin.current_price * (1 + (Math.random() * 0.1 - 0.05)),
        price_change_percentage_24h: coin.price_change_percentage_24h + (Math.random() * 2 - 1)
      })));
    }, 5000);

    return () => clearTimeout(timer);
  }, [cryptoData]);

  const investmentPlans = [
    {
      name: 'Starter',
      minPrice: 150,
      maxPrice: 4999,
      duration: 5,
      dailyReturns: 3.5,
      referral: 10
    },
    {
      name: 'Silver',
      minPrice: 5000,
      maxPrice: 19999,
      duration: 7,
      dailyReturns: 5.5,
      referral: 10
    },
    {
      name: 'Gold',
      minPrice: 20000,
      maxPrice: 49999,
      duration: 10,
      dailyReturns: 7.5,
      referral: 10
    },
    {
      name: 'VIP',
      minPrice: 50000,
      maxPrice: 100000,
      duration: 13,
      dailyReturns: 10.5,
      referral: 10
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Investment Dashboard</h1>
          <p className="text-gray-400">Choose your investment plan and start earning today</p>
        </header>

        <div className="flex border-b border-gray-700 mb-8">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 font-medium ${activeTab === 'plans' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          >
            Investment Plans
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`px-4 py-2 font-medium ${activeTab === 'market' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          >
            Market Data
          </button>
        </div>

        {activeTab === 'plans' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {investmentPlans.map((plan, index) => (
              <InvestmentPlanCard key={plan.name} plan={plan} index={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Market Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {cryptoData.map((coin) => (
                  <div key={coin.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{coin.id.toUpperCase()}</span>
                      <span className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-2xl font-bold">${coin.current_price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <TradingViewWidget symbol="BTCUSDT" />
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Portfolio Performance</h2>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generateChartData(30, 0.1)}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="h-64">
                <TradingViewWidget symbol="ETHUSDT" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {[
                  { plan: 'Starter', amount: 1000, date: '2023-05-15', status: 'Active' },
                  { plan: 'Gold', amount: 25000, date: '2023-05-10', status: 'Completed' },
                  { plan: 'Silver', amount: 8000, date: '2023-05-05', status: 'Active' },
                ].map((tx, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">{tx.plan}</td>
                    <td className="px-4 py-3 whitespace-nowrap">${tx.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{tx.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tx.status === 'Active' ? 'bg-green-900 text-green-200' : 'bg-blue-900 text-blue-200'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentDashboard;