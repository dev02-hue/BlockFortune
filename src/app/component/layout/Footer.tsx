'use client';

import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Footer = ({ darkMode }: { darkMode: boolean }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              BlockFortune
            </h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your trusted partner in wealth creation through innovative investment solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                <FiFacebook size={18} />
              </a>
              <a href="#" aria-label="Twitter" className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                <FiTwitter size={18} />
              </a>
              <a href="#" aria-label="Instagram" className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                <FiInstagram size={18} />
              </a>
              <a href="#" aria-label="LinkedIn" className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                <FiLinkedin size={18} />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { name: 'Home', href: '#' },
                { name: 'About Us', href: '#' },
                { name: 'Investment Plans', href: '#' },
                { name: 'FAQ', href: '#' },
                { name: 'Contact', href: '#' },
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`hover:text-blue-500 transition-colors ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-500'}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Investment Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              Investment Plans
            </h3>
            <ul className="space-y-2">
              {plans.map((plan, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className={`hover:text-blue-500 transition-colors ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-500'}`}
                  >
                    {plan.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FiMail className={`mt-1 mr-3 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>blockfortunevercelteam@gmail.com</span>
              </li>
              <li className="flex items-start">
                <FiPhone className={`mt-1 mr-3 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>+1 (848) 316-8766</span>
              </li>
              <li className="flex items-start">
                <FiMapPin className={`mt-1 mr-3 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>123 Financial District, New York, NY 10005</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div className={`border-t my-8 ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-4 md:mb-0`}>
            © {currentYear} BlockFortune. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className={`text-sm hover:text-blue-500 transition-colors ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-500'}`}>
              Privacy Policy
            </a>
            <a href="#" className={`text-sm hover:text-blue-500 transition-colors ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-500'}`}>
              Terms of Service
            </a>
            <a href="#" className={`text-sm hover:text-blue-500 transition-colors ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-500'}`}>
              Risk Disclosure
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

const plans = [
  {
    name: "XP-FLASH",
    dailyROI: 2.5,
    min: 100,
    max: 2999,
    duration: 6,
    affiliate: 7,
    color: "bg-blue-500"
  },
  {
    name: "XP-MINER",
    dailyROI: 4.5,
    min: 3000,
    max: 5999,
    duration: 7,
    affiliate: 7,
    color: "bg-purple-500"
  },
  {
    name: "XP-POOL",
    dailyROI: 7.8,
    min: 6000,
    max: 9999,
    duration: 8,
    affiliate: 7,
    color: "bg-indigo-500"
  },
  {
    name: "FOREX",
    dailyROI: 1.4,
    min: 7560,
    max: 9999,
    duration: 35,
    affiliate: 7,
    color: "bg-green-500"
  },
  {
    name: "AGRI",
    dailyROI: 1.6,
    min: 10000,
    max: 24999,
    duration: 60,
    affiliate: 7,
    color: "bg-amber-500"
  },
  {
    name: "REAL EST",
    dailyROI: 1.8,
    min: 25000,
    max: 500000,
    duration: 90,
    affiliate: 7,
    color: "bg-red-500"
  }
];