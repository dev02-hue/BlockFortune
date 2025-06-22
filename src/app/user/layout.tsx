'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiHome, FiPieChart, FiDollarSign, FiCreditCard, FiShield, FiActivity, FiShoppingBag, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    financial: true,
    security: true,
    transactions: true
  });
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 }
  };

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/user/dashboard', 
      icon: <FiHome />,
      section: null
    },
    { 
      name: 'Profile', 
      path: '/user/profile', 
      icon: <FiUser />,
      section: null
    },
    { 
      section: 'security',
      name: 'Security',
      items: [
        { name: 'Account Security', path: '/user/security', icon: <FiShield /> },
      ]
    },
    { 
      section: 'financial',
      name: 'Financial',
      items: [
        { name: 'Deposit', path: '/user/deposit', icon: <FiDollarSign /> },
        { name: 'Investment', path: '/user/investment', icon: <FiPieChart /> },
        { name: 'Withdraw Profit', path: '/user/withdraw', icon: <FiDollarSign /> },
      ]
    },
    { 
      section: 'transactions',
      name: 'Transactions',
      items: [
        { name: 'Deposit History', path: '/user/deposit-history', icon: <FiCreditCard /> },
        { name: 'Withdrawal History', path: '/user/withdrawal-history', icon: <FiActivity /> },
        { name: 'All Transactions', path: '/user/transactions', icon: <FiActivity /> },
      ]
    },
    { 
      name: 'Connect Wallet', 
      path: '/user/wallet', 
      icon: <FiShoppingBag />,
      section: null
    },
    { 
      name: 'Logout', 
      path: '/logout', 
      icon: <FiLogOut />,
      section: null
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-gray-200 relative">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 flex items-center justify-between border-b border-gray-700 sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-200 hover:text-purple-400 transition-colors"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-semibold">User Dashboard</h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none"
            aria-label="User profile"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
              <FiUser size={20} />
            </div>
           
          </button>

          <AnimatePresence>
            {isProfileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-[#1e293b] rounded-md shadow-lg z-50 border border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <Link
                    href="/user/profile"
                    className=" px-4 py-2 text-sm hover:bg-purple-900 hover:bg-opacity-50 transition-colors flex items-center space-x-2"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <FiUser size={16} />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/user/security"
                    className=" px-4 py-2 text-sm hover:bg-purple-900 hover:bg-opacity-50 transition-colors flex items-center space-x-2"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <FiSettings size={16} />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/user/logout"
                    className=" px-4 py-2 text-sm hover:bg-purple-900 hover:bg-opacity-50 transition-colors flex items-center space-x-2"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Overlay for mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-20 md:hidden"
              onClick={toggleSidebar}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              className={`fixed md:relative h-full w-64 bg-gradient-to-b from-purple-900 via-blue-900 to-gray-900 flex-shrink-0 overflow-hidden border-r border-gray-700 z-30`}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="h-full overflow-y-auto py-4">
                <nav>
                  <ul className="space-y-1 px-2">
                    {navItems.map((item) => (
                      <li key={item.name || item.section}>
                        {item.section ? (
                          <div className="mb-1">
                            <button
                              onClick={() => toggleSection(item.section!)}
                              className="w-full flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-blue-900 hover:bg-opacity-50 text-gray-200"
                            >
                              <div className="flex items-center">
                                <span className="mr-3">{item.icon || <FiActivity />}</span>
                                <span>{item.name}</span>
                              </div>
                              {expandedSections[item.section] ? (
                                <FiChevronUp size={18} />
                              ) : (
                                <FiChevronDown size={18} />
                              )}
                            </button>
                            
                            <AnimatePresence>
                              {expandedSections[item.section] && (
                                <motion.ul
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="pl-8 overflow-hidden"
                                >
                                  {item.items?.map((subItem) => (
                                    <li key={subItem.name}>
                                      <Link
                                        href={subItem.path}
                                        className={`flex items-center p-3 rounded-lg transition-colors ${pathname === subItem.path
                                          ? 'bg-purple-900 bg-opacity-50 text-purple-400'
                                          : 'hover:bg-blue-900 hover:bg-opacity-50 text-gray-200'
                                          }`}
                                      >
                                        <span className="mr-3">{subItem.icon}</span>
                                        <span>{subItem.name}</span>
                                      </Link>
                                    </li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <Link
                            href={item.path!}
                            className={`flex items-center p-3 rounded-lg transition-colors ${pathname === item.path
                              ? 'bg-purple-900 bg-opacity-50 text-purple-400'
                              : 'hover:bg-blue-900 hover:bg-opacity-50 text-gray-200'
                              }`}
                          >
                            <span className="mr-3">{item.icon}</span>
                            <span>{item.name}</span>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className={` overflow-y-auto    bg-opacity-20 transition-all duration-300 ${isSidebarOpen ? ' ' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}