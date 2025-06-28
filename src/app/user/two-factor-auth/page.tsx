'use client'

import { useState, useEffect } from 'react';
import { FiShield, FiMail, FiPhone, FiCheck, FiX, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function TwoFactorAuthSettings() {
  const [loading, setLoading] = useState(true);
  const [email2FA, setEmail2FA] = useState(false);
  const [phone2FA, setPhone2FA] = useState(false);
  const [authenticator2FA, setAuthenticator2FA] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone' | 'authenticator' | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmail2FA(true);
      setPhone2FA(false);
      setAuthenticator2FA(false);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handle2FAToggle = (method: 'email' | 'phone' | 'authenticator') => {
    if (method === 'email' && !email2FA) {
      setVerificationMethod('email');
      setShowVerificationModal(true);
    } else if (method === 'phone' && !phone2FA) {
      setVerificationMethod('phone');
      setShowVerificationModal(true);
    } else if (method === 'authenticator' && !authenticator2FA) {
      setVerificationMethod('authenticator');
      setShowVerificationModal(true);
    } else {
      // Turning off doesn't require verification
      if (method === 'email') setEmail2FA(false);
      if (method === 'phone') setPhone2FA(false);
      if (method === 'authenticator') setAuthenticator2FA(false);
    }
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setVerificationSuccess(false);
    
    // Simulate verification
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
      
      // Update the corresponding 2FA method
      if (verificationMethod === 'email') setEmail2FA(true);
      if (verificationMethod === 'phone') setPhone2FA(true);
      if (verificationMethod === 'authenticator') setAuthenticator2FA(true);
      
      // Close modal after success
      setTimeout(() => {
        setShowVerificationModal(false);
        setVerificationSuccess(false);
        setVerificationMethod(null);
        setVerificationCode('');
      }, 1500);
    }, 2000);
  };

  const handleSave = () => {
    setSaveLoading(true);
    setSaveSuccess(false);
    
    // Simulate API call
    setTimeout(() => {
      setSaveLoading(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 sm:p-8 w-full max-w-md text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <FiLoader className="text-blue-500 text-4xl mx-auto mb-4" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-700">Loading security settings...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 sm:px-6 py-4"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-white">Two-Factor Authentication</h1>
            <p className="text-blue-100 text-sm sm:text-base">Add an extra layer of security to your account</p>
          </motion.div>
          
          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Security Status */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100"
            >
              <div className="flex items-center space-x-3">
                <FiShield className="text-blue-600 text-lg sm:text-xl" />
                <div>
                  <h3 className="font-medium text-gray-800 text-sm sm:text-base">Security Status</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {email2FA || phone2FA || authenticator2FA ? (
                      <span className="text-green-600">Two-factor authentication is active</span>
                    ) : (
                      <span className="text-yellow-600">Two-factor authentication is not set up</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Email 2FA */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-2 sm:p-3 bg-blue-100 rounded-full"
                >
                  <FiMail className="text-blue-600 text-lg sm:text-xl" />
                </motion.div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm sm:text-base">Email Verification</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Receive a verification code via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={email2FA}
                  onChange={() => handle2FAToggle('email')}
                />
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"
                ></motion.div>
              </label>
            </motion.div>
            
            {/* Phone 2FA */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-2 sm:p-3 bg-green-100 rounded-full"
                >
                  <FiPhone className="text-green-600 text-lg sm:text-xl" />
                </motion.div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm sm:text-base">SMS Verification</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Receive a verification code via text message</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={phone2FA}
                  onChange={() => handle2FAToggle('phone')}
                />
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-green-600"
                ></motion.div>
              </label>
            </motion.div>
            
            {/* Authenticator App 2FA */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-2 sm:p-3 bg-purple-100 rounded-full"
                >
                  <FiShield className="text-purple-600 text-lg sm:text-xl" />
                </motion.div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm sm:text-base">Authenticator App</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Use an app like Google Authenticator</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={authenticator2FA}
                  onChange={() => handle2FAToggle('authenticator')}
                />
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-purple-600"
                ></motion.div>
              </label>
            </motion.div>
            
            {/* Recovery Codes */}
            {(email2FA || phone2FA || authenticator2FA) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <FiShield className="text-yellow-600 text-lg sm:text-xl" />
                    <div>
                      <h3 className="font-medium text-gray-800 text-sm sm:text-base">Recovery Codes</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Save these codes to access your account if you lose your 2FA device</p>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
                  >
                    View Codes
                  </motion.button>
                </div>
              </motion.div>
            )}
            
            {/* Save Button */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="pt-3 sm:pt-4 flex flex-col sm:flex-row sm:justify-end items-center space-y-3 sm:space-y-0 sm:space-x-4"
            >
              <AnimatePresence>
                {saveSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center text-green-600 text-sm sm:text-base"
                  >
                    <FiCheckCircle className="mr-2" />
                    <span>Settings saved successfully!</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button
                onClick={handleSave}
                disabled={saveLoading}
                whileHover={{ scale: saveLoading ? 1 : 1.03 }}
                whileTap={{ scale: saveLoading ? 1 : 0.97 }}
                className={`px-4 sm:px-6 py-2 rounded-md text-white font-medium text-sm sm:text-base ${saveLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors w-full sm:w-auto`}
              >
                {saveLoading ? (
                  <span className="flex items-center justify-center sm:justify-start">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="mr-2"
                    >
                      <FiLoader />
                    </motion.span>
                    Saving...
                  </span>
                ) : 'Save Changes'}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Verify {verificationMethod === 'email' ? 'Email' : 
                        verificationMethod === 'phone' ? 'Phone' : 
                        'Authenticator'}
                </h3>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVerificationMethod(null);
                    setVerificationCode('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="text-xl" />
                </motion.button>
              </div>
              
              {!verificationSuccess ? (
                <>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    {verificationMethod === 'email' && 'We sent a 6-digit code to your email address. Enter it below to verify.'}
                    {verificationMethod === 'phone' && 'We sent a 6-digit code to your phone number. Enter it below to verify.'}
                    {verificationMethod === 'authenticator' && 'Enter the 6-digit code from your authenticator app.'}
                  </p>
                  
                  <div className="mb-6">
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Code
                    </label>
                    <motion.input
                      type="text"
                      id="verificationCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      maxLength={6}
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setShowVerificationModal(false);
                        setVerificationMethod(null);
                        setVerificationCode('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: isVerifying || verificationCode.length < 6 ? 1 : 1.03 }}
                      whileTap={{ scale: isVerifying || verificationCode.length < 6 ? 1 : 0.97 }}
                      onClick={handleVerify}
                      disabled={isVerifying || verificationCode.length < 6}
                      className={`px-4 py-2 rounded-md text-white text-sm sm:text-base ${isVerifying || verificationCode.length < 6 ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {isVerifying ? (
                        <span className="flex items-center justify-center">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="mr-2"
                          >
                            <FiLoader />
                          </motion.span>
                          Verifying...
                        </span>
                      ) : 'Verify'}
                    </motion.button>
                  </div>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4 sm:py-6"
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <FiCheck className="text-green-500 text-4xl sm:text-5xl mx-auto mb-3 sm:mb-4" />
                  </motion.div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Verification Successful</h4>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {verificationMethod === 'email' && 'Email verification is now enabled.'}
                    {verificationMethod === 'phone' && 'Phone verification is now enabled.'}
                    {verificationMethod === 'authenticator' && 'Authenticator app is now set up.'}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}