"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown, FiStar, FiRefreshCw } from 'react-icons/fi';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiBinance, SiRipple, SiCardano, SiDogecoin, SiPolkadot, SiLitecoin, SiStellar } from 'react-icons/si';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  favorite: boolean;
}

const CryptoTable = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const fetchCryptoData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData: CryptoData[] = [
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 61408.23, change24h: 2.34, volume: 28300000000, marketCap: 1180000000000, favorite: true },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3385.42, change24h: -1.23, volume: 15200000000, marketCap: 405000000000, favorite: false },
        { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin', price: 586.71, change24h: 0.45, volume: 2100000000, marketCap: 89000000000, favorite: false },
        { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0.5321, change24h: 3.21, volume: 2800000000, marketCap: 51000000000, favorite: false },
        { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.4423, change24h: -0.67, volume: 850000000, marketCap: 15000000000, favorite: false },
        { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.1234, change24h: 5.78, volume: 1200000000, marketCap: 16000000000, favorite: true },
        { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', price: 21.56, change24h: -2.34, volume: 750000000, marketCap: 22000000000, favorite: false },
        { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', price: 156.78, change24h: 1.23, volume: 950000000, marketCap: 11000000000, favorite: false },
        { id: 'stellar', symbol: 'XLM', name: 'Stellar', price: 0.2345, change24h: 0.89, volume: 450000000, marketCap: 5800000000, favorite: false },
        { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', price: 18.76, change24h: -1.56, volume: 680000000, marketCap: 8200000000, favorite: false }
      ];
      
      setCryptoData(mockData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
  }, []);

  const toggleFavorite = (id: string) => {
    setCryptoData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, favorite: !item.favorite } : item
      )
    );
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getIcon = (symbol: string) => {
    switch (symbol) {
      case 'BTC': return <FaBitcoin className="text-orange-500" />;
      case 'ETH': return <FaEthereum className="text-gray-600" />;
      case 'BNB': return <SiBinance className="text-yellow-500" />;
      case 'XRP': return <SiRipple className="text-gray-700" />;
      case 'ADA': return <SiCardano className="text-blue-600" />;
      case 'DOGE': return <SiDogecoin className="text-yellow-600" />;
      case 'DOT': return <SiPolkadot className="text-pink-600" />;
      case 'LTC': return <SiLitecoin className="text-gray-400" />;
      case 'XLM': return <SiStellar className="text-blue-400" />;
      default: return <div className="w-6 h-6 rounded-full bg-gray-300"></div>;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    }
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    }
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-500'}`}
          >
            Top Cryptocurrencies
          </motion.h1>
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchCryptoData}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-blue-400' : 'bg-gray-200 text-blue-500'}`}
            >
              <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
            >
              {darkMode ? '☀️' : '🌙'}
            </motion.button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 mb-6 rounded-lg ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'}`}
          >
            {error}
          </motion.div>
        )}

        <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`overflow-x-auto ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Asset
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    24h Change
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider hidden md:table-cell">
                    Volume
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider hidden lg:table-cell">
                    Market Cap
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-800 bg-gray-900' : 'divide-gray-200 bg-white'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="inline-block"
                      >
                        <FiRefreshCw className={`text-2xl ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  cryptoData.map((crypto, index) => (
                    <motion.tr
                      key={crypto.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(243, 244, 246, 0.5)' }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                            {getIcon(crypto.symbol)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">{crypto.name}</div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{crypto.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${crypto.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <div className="flex items-center justify-end">
                          {crypto.change24h >= 0 ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
                          {Math.abs(crypto.change24h)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm hidden md:table-cell">
                        {formatNumber(crypto.volume)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm hidden lg:table-cell">
                        {formatNumber(crypto.marketCap)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleFavorite(crypto.id)}
                          className={`p-1 rounded-full ${crypto.favorite ? 'text-yellow-400' : darkMode ? 'text-gray-400' : 'text-gray-300'}`}
                        >
                          <FiStar className={crypto.favorite ? 'fill-current' : ''} />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`mt-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}
        >
          Data updates every 60 seconds. Last updated: {new Date().toLocaleTimeString()}
        </motion.div>
      </div>
    </div>
  );
};

export default CryptoTable;