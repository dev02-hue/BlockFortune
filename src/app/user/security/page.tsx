// app/settings/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaWallet, 
  FaKey, 
  FaEnvelope, 
 
  FaChevronRight,
  FaUserShield,
  FaBell,
  FaLanguage,
  
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
  import { FiHeadphones } from 'react-icons/fi';
// import SignOutButton from '@/app/component/user/SignOutButton';
 
const SettingsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'preferences'>('account');

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const settingsOptions = {
    account: [
      {
        title: "Wallet Manager",
        icon: <FaWallet className="text-blue-500" />,
        action: () => handleNavigation('/user/wallet-manager'),
        description: "Manage your connected wallets and addresses"
      },
      {
        title: "Change Email",
        icon: <FaEnvelope className="text-purple-500" />,
        action: () => handleNavigation('/user/change-email'),
        description: "Update your account email address"
      }
    ],
    security: [
      {
        title: "Change Password",
        icon: <FaKey className="text-green-500" />,
        action: () => handleNavigation('/user/change-password'),
        description: "Update your account password"
      },
      {
        title: "Two-Factor Authentication",
        icon: <FaUserShield className="text-orange-500" />,
        action: () => handleNavigation('/user/two-factor-auth'),
        description: "Enable extra security for your account"
      }
    ],
    preferences: [
      {
        title: "Notification Settings",
        icon: <FaBell className="text-yellow-500" />,
        action: () => handleNavigation('/user/notifications'),
        description: "Customize your notification preferences"
      },
      {
        title: "Language",
        icon: <FaLanguage className="text-red-500" />,
        action: () => handleNavigation('/user/language'),
        description: "Change application language"
      },
      {
        title: "contact",
        icon: <FiHeadphones className="text-red-500" />,
        action: () => handleNavigation('/user/contactus'),
        description: "Contact us"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and security</p>
        </motion.div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Settings Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm ${activeTab === 'account' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex-1 py-4 px-4 text-center font-medium text-sm ${activeTab === 'preferences' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Preferences
            </button>
          </div>

          {/* Settings Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {settingsOptions[activeTab].map((option, index) => (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    key={index}
                    onClick={option.action}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {option.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{option.title}</h3>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Sign Out Button */}
        {/* <div className="mt-8">
          <SignOutButton />
        </div> */}

         
      </div>
    </div>
  );
};

export default SettingsPage;