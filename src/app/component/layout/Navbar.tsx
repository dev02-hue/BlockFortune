"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaHome, FaInfoCircle, FaEnvelope, FaMoon, FaSun, FaUser, FaUserPlus } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size and handle scroll
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close menu when clicking outside or resizing to desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.navbar-container')) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Apply dark mode class to body
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const mainNavLinks = [
    { name: 'Home', path: '/', icon: <FaHome className="text-base sm:text-lg" /> },
    { name: 'About', path: '/about', icon: <FaInfoCircle className="text-base sm:text-lg" /> },
    { name: 'Contact', path: '/contactus', icon: <FaEnvelope className="text-base sm:text-lg" /> },
  ];

  const authNavLinks = [
    { name: 'Sign Up', path: '/signup', icon: <FaUserPlus className="text-base sm:text-lg" /> },
    { name: 'Sign In', path: '/signin', icon: <FaUser className="text-base sm:text-lg" /> },
  ];

  // Animation variants
  const mobileMenuVariants = {
    hidden: { 
      x: '-100%',
      opacity: 0,
      transition: { duration: 0.3 }
    },
    visible: { 
      x: 0,
      opacity: 1,
      transition: { 
        duration: 0.4,
        ease: [0.25, 1, 0.5, 1],
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    },
    exit: { 
      x: '-100%',
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.nav 
      className={`navbar-container fixed w-full z-50 ${
        isScrolled 
          ? 'dark:bg-gray-900/95 bg-white/95 shadow-lg py-1 sm:py-2 border-b dark:border-gray-800 border-gray-200' 
          : 'dark:bg-gray-900/90 bg-white/90 py-2 sm:py-3'
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 0.5
      }}
      style={{ top: 0 }}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand - Adjusted for small screens */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.03 }}
          >
            <Link 
              href="/" 
              className="font-bold flex items-center"
            >
              <span className="text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-500 font-bold tracking-tighter">
                BlockFortune
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Main Navigation Links */}
            <div className="flex items-center space-x-1">
              {mainNavLinks.map((link) => (
                <motion.div
                  key={link.name}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Link 
                    href={link.path}
                    className={`flex items-center dark:text-gray-300 text-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium text-xs sm:text-sm uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-2 ${
                      pathname === link.path ? 'text-blue-500 dark:text-blue-400' : ''
                    }`}
                  >
                    <span className="mr-1 sm:mr-2">{link.icon}</span>
                    {link.name}
                  </Link>
                  {pathname === link.path && (
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400"
                      layoutId="activeIndicator"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Auth Buttons - Styled differently */}
            <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4 border-l dark:border-gray-700 border-gray-300 pl-2 sm:pl-4">
              {authNavLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={link.path}
                    className={`flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium uppercase tracking-wider transition-colors ${
                      index === 0 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'dark:bg-gray-800 dark:hover:bg-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 text-gray-800'
                    }`}
                  >
                    <span className="mr-1 sm:mr-2">{link.icon}</span>
                    {isMobile ? '' : link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-1 sm:space-x-2 ml-1 sm:ml-2">
              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1 sm:p-2 rounded-full dark:bg-gray-800 bg-gray-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FaSun className="text-yellow-300 text-base sm:text-lg" />
                ) : (
                  <FaMoon className="text-gray-700 text-base sm:text-lg" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu Button - Adjusted for small screens */}
          <motion.button
            className="md:hidden dark:text-gray-300 text-gray-800 focus:outline-none p-1"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <FaTimes size={20} className="text-red-400" />
            ) : (
              <FaBars size={20} />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu - Adjusted for small screens */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
              />
              
              {/* Menu Content - Adjusted width for small screens */}
              <motion.div
                className="fixed top-0 left-0 h-full w-4/5 max-w-xs dark:bg-gray-900 bg-white z-50 shadow-xl md:hidden"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={mobileMenuVariants}
              >
                <div className="h-full flex flex-col pt-16 pb-4 px-4 overflow-y-auto">
                  <div className="space-y-2 flex-grow">
                    {/* Main Links */}
                    {mainNavLinks.map((link) => (
                      <motion.div
                        key={link.name}
                        variants={navItemVariants}
                      >
                        <Link
                          href={link.path}
                          className={`flex items-center dark:text-gray-300 text-gray-800 py-2 px-3 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors font-medium text-sm ${
                            pathname === link.path ? 'text-blue-500 dark:text-blue-400' : ''
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="mr-2">{link.icon}</span>
                          {link.name}
                          {pathname === link.path && (
                            <span className="ml-2 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                          )}
                        </Link>
                      </motion.div>
                    ))}

                    {/* Auth Links - Separated visually */}
                    <div className="pt-3 mt-3 space-y-3 border-t dark:border-gray-800 border-gray-200">
                      {authNavLinks.map((link, index) => (
                        <motion.div
                          key={link.name}
                          variants={navItemVariants}
                        >
                          <Link
                            href={link.path}
                            className={`flex items-center py-2 px-3 rounded-lg transition-colors font-medium text-sm ${
                              index === 0
                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                : 'dark:bg-gray-800 dark:hover:bg-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 text-gray-800'
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="mr-2">{link.icon}</span>
                            {link.name}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto space-y-4 pt-4 border-t dark:border-gray-800 border-gray-200">
                    <motion.div variants={navItemVariants}>
                      <div className="flex justify-between items-center px-3">
                        <span className="dark:text-gray-400 text-gray-600 text-xs">Theme</span>
                        <button
                          onClick={() => setDarkMode(!darkMode)}
                          className="p-1.5 rounded-full dark:bg-gray-800 bg-gray-200"
                        >
                          {darkMode ? (
                            <FaSun className="text-yellow-300 text-sm" />
                          ) : (
                            <FaMoon className="text-gray-700 text-sm" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;