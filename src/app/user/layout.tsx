'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiSettings, FiHome,  FiDollarSign, FiCreditCard, FiShield, FiActivity, FiShoppingBag, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import SignOutButton from '../component/user/SignOutButton';
import { FaUserFriends } from 'react-icons/fa';


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
      icon: <FiHome className="text-amber-500" />,
      section: null
    },
    { 
      name: 'Profile', 
      path: '/user/profile', 
      icon: <FiUser className="text-amber-500" />,
      section: null
    },
    { 
      name: 'Investment', 
      path: '/user/investment-in', 
      icon: <FiUser className="text-amber-500" />,
      section: null
    },

    { 
      name: 'Invite', 
      path: '/user/invite', 
      icon: <FaUserFriends className="text-amber-500" />,
      section: null
    },
    { 
      section: 'security',
      name: 'Security',
      icon: <FiShield className="text-amber-500" />,
      items: [
        { name: 'Account Security', path: '/user/security', icon: <FiShield className="text-amber-500" /> },
      ]
    },
    { 
      section: 'financial',
      name: 'Financial',
      icon: <FiDollarSign className="text-amber-500" />,
      items: [
        { name: 'Deposit', path: '/user/deposit', icon: <FiDollarSign className="text-amber-500" /> },
         
        { name: 'Withdraw Profit', path: '/user/withdraw', icon: <FiDollarSign className="text-amber-500" /> },
      ]
    },
    { 
      section: 'transactions',
      name: 'Transactions',
      icon: <FiActivity className="text-amber-500" />,
      items: [
        { name: 'Deposit History', path: '/user/deposit-history', icon: <FiCreditCard className="text-amber-500" /> },
        { name: 'Withdrawal History', path: '/user/withdrawal-history', icon: <FiActivity className="text-amber-500" /> },
        { name: 'All Transactions', path: '/user/transactions', icon: <FiActivity className="text-amber-500" /> },
      ]
    },
    { 
      name: 'Connect Wallet', 
      path: '/user/wallet', 
      icon: <FiShoppingBag className="text-amber-500" />,
      section: null
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 relative">
      {/* Navbar */}
      <nav className="bg-navy-blue p-4 flex items-center justify-between border-b border-amber-500/30 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-amber-400 transition-colors"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold text-white">
            BlockFortune
          </h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none group"
            aria-label="User profile"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center group-hover:bg-amber-400 transition-all shadow-md">
              <FiUser size={20} className="text-white" />
            </div>
          </button>

          <AnimatePresence>
            {isProfileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-navy-blue rounded-md shadow-lg z-50 border border-amber-500/30"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <Link
                    href="/user/profile"
                    className="px-4 py-3 text-sm hover:bg-amber-500/20 transition-colors flex items-center space-x-2 text-white"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <FiUser size={16} className="text-amber-400" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/user/security"
                    className="px-4 py-3 text-sm hover:bg-amber-500/20 transition-colors flex items-center space-x-2 text-white"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <FiSettings size={16} className="text-amber-400" />
                    <span>Settings</span>
                  </Link>
                  <div className="border-t border-amber-500/30 mt-2 pt-2">
                    <SignOutButton className="w-full text-left px-4 py-3 text-sm hover:bg-amber-500/20 transition-colors flex items-center space-x-2 text-white" />
                  </div>
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
              animate={{ opacity: 0.7 }}
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
              className={`fixed md:relative h-full w-64 bg-navy-blue flex-shrink-0 overflow-hidden border-r border-amber-500/30 z-30`}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="h-full overflow-y-auto py-6 px-3">
                <nav>
                  <ul className="space-y-1">
                    {navItems.map((item) => (
                      <li key={item.name || item.section}>
                        {item.section ? (
                          <div className="mb-1">
                            <button
                              onClick={() => toggleSection(item.section!)}
                              className="w-full flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-amber-500/20 text-white"
                            >
                              <div className="flex items-center">
                                <span className="mr-3">{item.icon}</span>
                                <span>{item.name}</span>
                              </div>
                              {expandedSections[item.section] ? (
                                <FiChevronUp size={18} className="text-amber-400" />
                              ) : (
                                <FiChevronDown size={18} className="text-amber-400" />
                              )}
                            </button>
                            
                            <AnimatePresence>
                              {expandedSections[item.section] && (
                                <motion.ul
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="pl-11 overflow-hidden space-y-1 mt-1"
                                >
                                  {item.items?.map((subItem) => (
                                    <li key={subItem.name}>
                                      <Link
                                        href={subItem.path}
                                        className={`flex items-center p-3 rounded-lg transition-colors ${
                                          pathname === subItem.path
                                            ? 'bg-amber-500/30 text-white'
                                            : 'hover:bg-amber-500/20 text-gray-200'
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
                            className={`flex items-center p-3 rounded-lg transition-colors ${
                              pathname === item.path
                                ? 'bg-amber-500/30 text-white'
                                : 'hover:bg-amber-500/20 text-gray-200'
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
        <main className={`flex-1 overflow-y-auto bg-gray-50 transition-all duration-300 ${
          isSidebarOpen ? ' ' : ''
        }`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      
      <style jsx global>{`
        :root {
          --navy-blue: #1E3A8A;
          --gold: #F59E0B;
        }
        
        .bg-navy-blue {
          background-color: #1E3A8A;
        }
        
        .text-navy-blue {
          color: #1E3A8A;
        }
        
        .bg-gold {
          background-color: #F59E0B;
        }
        
        .text-gold {
          color: #F59E0B;
        }
      `}</style>
    </div>
  );
}