"use client"
import { motion } from "framer-motion";
import { FiExternalLink, FiRefreshCw, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';

// Define types for your chart data
interface ChartDataPoint {
  name: string;
  price: number;
  volume: number;
}

const TradingDashboard = () => {
  // Properly typed state with ChartDataPoint array
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [activeTab, setActiveTab] = useState<'forex' | 'commodities'>('forex');

  // Format currency with proper typing
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value);
  };

  useEffect(() => {
    // Simulate API fetch with proper typing
    const fetchData = () => {
      const data: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
        name: `Day ${i + 1}`,
        price: Math.floor(Math.random() * 100) + 50,
        volume: Math.floor(Math.random() * 500) + 100
      }));
      setChartData(data);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Real-time trading data</h2>
        </div>
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <button 
            onClick={() => setActiveTab('forex')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${activeTab === 'forex' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Forex
          </button>
          <button 
            onClick={() => setActiveTab('commodities')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${activeTab === 'commodities' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Commodities
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* TradingView Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Forex Widget */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-semibold text-gray-800 dark:text-gray-200">AUD/USD</span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Forex</span>
              </div>
              <a 
                href="https://www.tradingview.com/symbols/FX-AUDUSD/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center"
              >
                View <FiExternalLink className="ml-1" />
              </a>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold text-gray-800 dark:text-white">
                  {formatCurrency(0.6745)}
                </span>
                <span className="flex items-center text-green-500">
                  <FiTrendingUp className="mr-1" /> +0.24%
                </span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.5} />
                    <XAxis dataKey="name" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                        borderRadius: '0.375rem',
                        color: '#F9FAFB'
                      }}
                      itemStyle={{ color: '#F9FAFB' }}
                      labelStyle={{ fontWeight: 'bold' }}
                      formatter={(value: number) => [formatCurrency(value), 'Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Commodities Widget */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Crude Oil</span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Commodity</span>
              </div>
              <a 
                href="https://www.tradingview.com/symbols/TVC-USOIL/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center"
              >
                View <FiExternalLink className="ml-1" />
              </a>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold text-gray-800 dark:text-white">
                  {formatCurrency(78.42)}
                </span>
                <span className="flex items-center text-red-500">
                  <FiTrendingDown className="mr-1" /> -1.15%
                </span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.5} />
                    <XAxis dataKey="name" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                        borderRadius: '0.375rem',
                        color: '#F9FAFB'
                      }}
                      itemStyle={{ color: '#F9FAFB' }}
                      labelStyle={{ fontWeight: 'bold' }}
                      formatter={(value: number) => [formatCurrency(value), 'Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#8B5CF6" 
                      fillOpacity={1} 
                      fill="url(#colorOil)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Embedded TradingView Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Forex TradingView Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">AUD/USD Live Chart</h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <FiRefreshCw className="mr-1" /> Live
              </div>
            </div>
            <div className="h-64">
              <iframe 
                scrolling="no"
                allowTransparency={true}
                frameBorder="0"
                src={`https://www.tradingview-widget.com/embed-widget/single-quote/?locale=en#%7B%22symbol%22%3A%22FX%3AAUDUSD%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A100%2C%22colorTheme%22%3A%22${document.documentElement.classList.contains('dark') ? 'dark' : 'light'}%22%2C%22isTransparent%22%3Atrue%2C%22utm_source%22%3A%22blockfortune.com%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22single-quote%22%7D`}
                title="AUD/USD TradingView widget"
                style={{ userSelect: 'none', boxSizing: 'border-box', display: 'block', height: '100%', width: '100%' }}
              ></iframe>
            </div>
          </motion.div>

          {/* Commodities TradingView Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Crude Oil Live Chart</h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <FiRefreshCw className="mr-1" /> Live
              </div>
            </div>
            <div className="h-64">
              <iframe 
                scrolling="no"
                allowTransparency={true}
                frameBorder="0"
                src={`https://www.tradingview-widget.com/embed-widget/single-quote/?locale=en#%7B%22symbol%22%3A%22TVC%3AUSOIL%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A100%2C%22colorTheme%22%3A%22${document.documentElement.classList.contains('dark') ? 'dark' : 'light'}%22%2C%22isTransparent%22%3Atrue%2C%22utm_source%22%3A%22blockfortune.com%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22single-quote%22%7D`}
                title="Crude Oil TradingView widget"
                style={{ userSelect: 'none', boxSizing: 'border-box', display: 'block', height: '100%', width: '100%' }}
              ></iframe>
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};

export default TradingDashboard;