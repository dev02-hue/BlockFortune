/* eslint-disable @typescript-eslint/no-explicit-any */
// app/verification/page.tsx
"use client"

import { submitVerificationRequest } from '@/lib/profile'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiUpload, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiClock,
  FiUser,
  FiFileText,
  FiCreditCard,
  FiGlobe,
  FiLoader
} from 'react-icons/fi'

type DocumentType = 'passport' | 'driving_license' | 'id_card'
type VerificationStatus = 'unverified' | 'pending' | 'verified'

export default function VerificationPage() {
  const [documentType, setDocumentType] = useState<DocumentType>('passport')
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [status, setStatus] = useState<VerificationStatus>('unverified')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const documentTypeOptions = [
    { value: 'passport', label: 'Passport', icon: <FiGlobe className="mr-2" /> },
    { value: 'driving_license', label: "Driver's License", icon: <FiCreditCard className="mr-2" /> },
    { value: 'id_card', label: 'National ID Card', icon: <FiUser className="mr-2" /> }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!frontImage) {
      setError('Please upload front image of your document')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const frontInfo = {
        name: frontImage.name,
        size: frontImage.size,
        type: frontImage.type
      }

      let backInfo = null
      if (backImage) {
        backInfo = {
          name: backImage.name,
          size: backImage.size,
          type: backImage.type
        }
      }

      const result = await submitVerificationRequest(
        documentType,
        frontInfo,
        backInfo
      )

      if (result.error) {
        throw new Error(result.error)
      }

      setSuccess(true)
      setStatus('pending')
    } catch (err: any) {
      console.error('Verification error:', err)
      setError(err.message || 'Failed to submit verification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center mb-6"
      >
        <FiFileText className="text-blue-600 text-2xl mr-2" />
        <h1 className="text-2xl font-bold text-black">Identity Verification</h1>
      </motion.div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
          >
            <div className="flex items-start">
              <FiAlertCircle className="text-red-500 text-xl mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-700">Verification Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {status === 'unverified' && (
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Document Type</label>
            <div className="relative">
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full pl-10 pr-4 py-2 text-black border border-gray-300 rounded-lg appearance-none bg-white focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {documentTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {documentTypeOptions.find(opt => opt.value === documentType)?.icon}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Front Image *</label>
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
            >
              <FiUpload className="mx-auto text-gray-400 text-2xl mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                {frontImage ? frontImage.name : 'Click to upload front image'}
              </p>
              <p className="text-xs text-gray-500">Supports: JPG, PNG (Max 5MB)</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setFrontImage)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
            </motion.div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Back Image (if applicable)</label>
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
            >
              <FiUpload className="mx-auto text-gray-400 text-2xl mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                {backImage ? backImage.name : 'Click to upload back image'}
              </p>
              <p className="text-xs text-gray-500">Supports: JPG, PNG (Max 5MB)</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setBackImage)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </motion.div>
          </div>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg"
              >
                <div className="flex items-start">
                  <FiCheckCircle className="text-green-500 text-xl mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-700">Success!</p>
                    <p className="text-sm text-green-600">
                      Verification request submitted. Our team will review your documents shortly.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center ${
              isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white shadow-md transition-all`}
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Submit Verification'
            )}
          </motion.button>
        </motion.form>
      )}

      {status === 'pending' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center p-6 bg-amber-50 rounded-xl border-l-4 border-amber-400"
        >
          <div className="flex justify-center mb-3">
            <FiClock className="text-amber-500 text-3xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Pending</h2>
          <p className="text-gray-600 mb-4">
            Your documents are under review. This process typically takes 1-2 business days.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            Need help? Contact Support
          </motion.button>
        </motion.div>
      )}

      {status === 'verified' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center p-6 bg-green-50 rounded-xl border-l-4 border-green-400"
        >
          <div className="flex justify-center mb-3">
            <FiCheckCircle className="text-green-500 text-3xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Identity Verified</h2>
          <p className="text-gray-600">
            Your account has been successfully verified. Thank you for completing the process.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}