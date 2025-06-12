"use client"
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiRefreshCw, FiBarChart2, FiDollarSign } from "react-icons/fi";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { useEffect, useState } from "react";
import { ReactElement } from "react";
import dynamic from 'next/dynamic';

// Dynamic import for TradingView widgets to ensure they only load on client side
const TradingViewWidget = dynamic(
  () => import('./TradingViewWidget'),
  { ssr: false }
);

// Define types for the trading signal
interface TradingSignal {
  id: number;
  symbol: string;
  name: string;
  direction: 'buy' | 'sell';
  entry: number;
  target: number;
  stopLoss: number;
  timeframe: string;
  confidence: number;
  timestamp: number;
  icon: ReactElement;
}

// Define types for the market data
interface MarketData {
  active_cryptocurrencies: number;
  markets: number;
  market_cap_change_percentage_24h_usd: number;
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_percentage: { btc: number; eth: number };
}

// Mock signals data structure (replace with actual API call)
const mockSignals: TradingSignal[] = [
  {
    id: 1,
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    direction: 'buy',
    entry: 50000,
    target: 55000,
    stopLoss: 48000,
    timeframe: '1D',
    confidence: 85,
    timestamp: Date.now() - 3600000, // 1 hour ago
    icon: <FaBitcoin className="text-orange-500" />
  },
  {
    id: 2,
    symbol: 'ETH/USD',
    name: 'Ethereum',
    direction: 'sell',
    entry: 3000,
    target: 2800,
    stopLoss: 3200,
    timeframe: '4H',
    confidence: 65,
    timestamp: Date.now() - 1800000, // 30 minutes ago
    icon: <FaEthereum className="text-purple-500" />
  }
];

const TradingSignalsDashboard = () => {
  // State for signals and market data with proper types
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'crypto' | 'forex' | 'stocks'>('crypto');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Only access document after component mounts (client-side)
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  // Fetch trading signals
  useEffect(() => {
    const fetchSignals = async () => {
      setLoading(true);
      try {
        // Note: TradingView doesn't have a direct public API for signals
        // You would need a backend service that subscribes to TradingView signals
        // For now, we'll use mock data
        
        // In a real implementation, you would call your backend API:
        // const response = await fetch('/api/tradingview-signals');
        // const data = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSignals(mockSignals);
        setError(null);
      } catch (error) {
        console.error("Error fetching signals:", error);
        setError("Failed to load trading signals");
        setSignals([]);
      } finally {
        setLoading(false);
      }
    };
  
    if (isClient) {
      fetchSignals();
      const interval = setInterval(fetchSignals, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [activeTab, isClient]);

  // Fetch additional market data from CoinGecko API
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/global');
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        const marketData: MarketData = {
          active_cryptocurrencies: data.data.active_cryptocurrencies,
          markets: data.data.markets,
          market_cap_change_percentage_24h_usd: data.data.market_cap_change_percentage_24h_usd,
          total_market_cap: { usd: data.data.total_market_cap.usd },
          total_volume: { usd: data.data.total_volume.usd },
          market_cap_percentage: { 
            btc: data.data.market_cap_percentage.btc,
            eth: data.data.market_cap_percentage.eth
          }
        };
        
        setMarketData(marketData);
        setError(null);
      } catch (error) {
        console.error("Error fetching market data:", error);
        setError("Failed to load market data");
      }
    };
  
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 4 : 2
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    return `${minutes}m ago`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Live Trading Signals</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time market analysis from TradingView</p>
          </div>
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <button 
              onClick={() => setActiveTab('crypto')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${activeTab === 'crypto' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Crypto
            </button>
            <button 
              onClick={() => setActiveTab('forex')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${activeTab === 'forex' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Forex
            </button>
            <button 
              onClick={() => setActiveTab('stocks')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${activeTab === 'stocks' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Stocks
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 text-center">
          {error}
        </div>
      )}

      {/* Market Overview Bar */}
      {marketData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 dark:bg-blue-900/20 p-3 border-b border-blue-100 dark:border-blue-800/50"
        >
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center">
                <FiBarChart2 className="mr-2 text-blue-500 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300 mr-1">Market Cap:</span>
                <span className="font-medium">${(marketData.total_market_cap.usd / 1000000000).toFixed(2)}B</span>
              </div>
              <div className="flex items-center">
                <FiDollarSign className="mr-2 text-blue-500 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300 mr-1">24h Change:</span>
                <span className={`font-medium ${marketData.market_cap_change_percentage_24h_usd >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercent(marketData.market_cap_change_percentage_24h_usd)}
                </span>
              </div>
              <div className="flex items-center">
                <FaBitcoin className="mr-2 text-orange-500" />
                <span className="text-gray-700 dark:text-gray-300 mr-1">BTC Dominance:</span>
                <span className="font-medium">{marketData.market_cap_percentage.btc.toFixed(1)}%</span>
              </div>
              <div className="flex items-center">
                <FaEthereum className="mr-2 text-purple-500" />
                <span className="text-gray-700 dark:text-gray-300 mr-1">ETH Dominance:</span>
                <span className="font-medium">{marketData.market_cap_percentage.eth.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="p-4">
        {/* TradingView Signal Widget */}
        {isClient && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">TradingView Signals</h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <FiRefreshCw className="mr-1" /> Live
              </div>
            </div>
            <div className="h-96">
              <TradingViewWidget 
                widgetType="symbol-overview"
                theme={theme}
                symbols={[
                  ["BTCUSD", "BTCUSD|1D"],
                  ["ETHUSD", "ETHUSD|1D"],
                  ["SOLUSD", "SOLUSD|1D"],
                  ["BNBUSD", "BNBUSD|1D"],
                  ["XRPUSD", "XRPUSD|1D"]
                ]}
              />
            </div>
          </motion.div>
        )}

        {/* Signal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <AnimatePresence>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={`loading-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-48"
                >
                  <div className="animate-pulse flex flex-col h-full">
                    <div className="bg-gray-200 dark:bg-gray-700 h-6 w-3/4 rounded mb-3"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-4 w-1/2 rounded mb-4"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-3 w-full rounded mb-2"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-3 w-5/6 rounded mb-2"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-3 w-4/6 rounded"></div>
                  </div>
                </motion.div>
              ))
            ) : (
              signals.map((signal) => (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                    signal.direction === 'buy' 
                      ? 'border-green-200 dark:border-green-800/50' 
                      : 'border-red-200 dark:border-red-800/50'
                  } p-4`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {signal.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">{signal.symbol}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{signal.name}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      signal.direction === 'buy' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {signal.direction.toUpperCase()}
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Entry</span>
                      <span className="font-medium">{formatCurrency(signal.entry)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Target</span>
                      <span className="font-medium text-green-500">{formatCurrency(signal.target)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Stop Loss</span>
                      <span className="font-medium text-red-500">{formatCurrency(signal.stopLoss)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FiClock className="mr-1" />
                      {formatTime(signal.timestamp)}
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs mr-1">Confidence:</span>
                      <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            signal.confidence > 75 ? 'bg-green-500' : 
                            signal.confidence > 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${signal.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Additional Market Data */}
        {isClient && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Market Analysis</h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <FiRefreshCw className="mr-1" /> Updated in real-time
              </div>
            </div>
            <div className="h-64">
              <TradingViewWidget 
                widgetType="technical-analysis"
                theme={theme}
              />
            </div>
          </motion.div>
        )}
      </div>  
    </motion.div>
  );
};

export default TradingSignalsDashboard;