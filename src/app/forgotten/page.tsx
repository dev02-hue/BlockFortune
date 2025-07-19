'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaEnvelope, FaKey, FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'
import { sendPasswordResetOTP, resetPasswordWithOTP, resetPasswordWithSecret } from '@/lib/auth'

export default function ForgotPassword() {
  const [step, setStep] = useState<'init' | 'otp' | 'secret'>('init')
  const [username, setUsername] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [secretAnswer, setSecretAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [useSecretQuestion, setUseSecretQuestion] = useState(false)

  const handleSendOTP = async () => {
    if (!username) {
      setError('Please enter your username')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const result = await sendPasswordResetOTP({ username })
      
      if (result.error) {
        setError(result.error)
      } else {
        setStep('otp')
        setSuccess(result.message || 'OTP sent successfully')
      }
    } catch (err) {
        console.log(err)
      setError('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetWithOTP = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const result = await resetPasswordWithOTP({
        username,
        otp,
        newPassword,
        confirmNewPassword: confirmPassword
      })
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(result.message || 'Password reset successfully!')
        // Clear form
        setOtp('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
        console.log(err)
      setError('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetWithSecret = async () => {
    if (!secretAnswer || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const result = await resetPasswordWithSecret({
        username,
        newPassword,
        confirmNewPassword: confirmPassword,
        secretAnswer
      })
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(result.message || 'Password reset successfully!')
        // Clear form
        setSecretAnswer('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
        console.log(err)
      setError('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep('init')
    setUsername('')
    setOtp('')
    setNewPassword('')
    setConfirmPassword('')
    setSecretAnswer('')
    setError('')
    setSuccess('')
    setUseSecretQuestion(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex items-center justify-between">
            {step !== 'init' && (
              <button 
                onClick={resetForm}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl font-bold text-center flex-1">
              {step === 'init' ? 'Reset Your Password' : 
               step === 'otp' ? 'Enter OTP' : 'Answer Security Question'}
            </h1>
            {step !== 'init' && <div className="w-5"></div>} {/* Spacer for alignment */}
          </div>
        </div>

        <div className="p-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
            >
              {success}
            </motion.div>
          )}

          {step === 'init' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep('secret')
                  setUseSecretQuestion(true)
                }}
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                Use Security Question
              </button>

              <div className="text-center text-sm mt-4">
                <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500">
                  Remember your password? Sign in
                </Link>
              </div>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter 6-digit code"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Check your email for the verification code we sent you.
                </p>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetWithOTP}
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>

              <div className="text-center text-sm">
                <button
                  onClick={() => setUseSecretQuestion(!useSecretQuestion)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {useSecretQuestion ? 'Use OTP Instead' : 'Use Security Question Instead'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'secret' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="secretAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                  Answer to Your Security Question
                </label>
                <input
                  id="secretAnswer"
                  type="text"
                  value={secretAnswer}
                  onChange={(e) => setSecretAnswer(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your secret answer"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetWithSecret}
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>

              <div className="text-center text-sm">
                <button
                  onClick={() => setUseSecretQuestion(!useSecretQuestion)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {useSecretQuestion ? 'Use OTP Instead' : 'Use Security Question Instead'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}