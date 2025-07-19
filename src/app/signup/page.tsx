'use client';

import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiHelpCircle, FiArrowRight } from 'react-icons/fi';
import { FaSpinner, FaFacebookF, FaLinkedinIn, FaTwitter, FaInstagram } from 'react-icons/fa';
import { useState } from 'react';
import { signUp } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FormState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  secretQuestion: string;
  secretAnswer: string;
  usdtTrc20Address: string;
  btcAddress: string;
  usdtErc20Address: string;
  ethAddress: string;
  bnbAddress: string;
  referredCode: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  confirmEmail?: string;
  password?: string;
  confirmPassword?: string;
  secretQuestion?: string;
  secretAnswer?: string;
  form?: string;
}

const secretQuestions = [
  "What was your first pet's name?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What was your childhood nickname?"
];

const SignUpForm = () => {
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    secretQuestion: '',
    secretAnswer: '',
    usdtTrc20Address: '',
    btcAddress: '',
    usdtErc20Address: '',
    ethAddress: '',
    bnbAddress: '',
    referredCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.username.trim()) newErrors.username = "Username is required";
    
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (form.email !== form.confirmEmail) {
      newErrors.confirmEmail = "Emails do not match";
    }
    
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!form.secretQuestion) {
      newErrors.secretQuestion = "Security question is required";
    }
    
    if (!form.secretAnswer.trim()) {
      newErrors.secretAnswer = "Security answer is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    setSuccessMessage(null);

    try {
      const result = await signUp(form);
      
      if (result.error) {
        setErrors({ form: result.error });
      } else {
        setSuccessMessage(result.message || 'Signup successful! Please check your email.');
        // Reset form on success
        setForm({
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          confirmEmail: '',
          password: '',
          confirmPassword: '',
          secretQuestion: '',
          secretAnswer: '',
          usdtTrc20Address: '',
          btcAddress: '',
          usdtErc20Address: '',
          ethAddress: '',
          bnbAddress: '',
          referredCode: ''
        });
        // Redirect to login after 2 seconds
        setTimeout(() => router.push("/signin"), 2000);
      }
    } catch (err) {
      console.log(err);
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 mt-5">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
      >
        {/* Left Column: Introduction */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center lg:text-left space-y-5"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium uppercase tracking-wider text-emerald-600"
          >
            <span>✨</span> Get Started
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
          >
            Join <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">BlockFortune</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 max-w-md mx-auto lg:mx-0 text-sm sm:text-base"
          >
            Create your account to start your crypto investment journey
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center lg:justify-start gap-3 pt-2"
          >
            {[FaFacebookF, FaLinkedinIn, FaTwitter, FaInstagram].map((Icon, i) => (
              <Link
                key={i}
                href="#"
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-md border border-gray-200 hover:bg-emerald-50 hover:border-emerald-100 transition-colors duration-200"
                aria-label={`Follow us on ${Icon.name.replace("Fa", "")}`}
              >
                <Icon className="text-gray-600 text-sm sm:text-base" />
              </Link>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column: Registration Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs sm:shadow-sm p-6 sm:p-8 md:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Register</h3>
              <p className="text-sm text-gray-500">Create your account in minutes</p>
            </div>
            
            {(errors.form || successMessage) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-md text-sm flex items-center ${
                  errors.form ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                <svg 
                  className={`w-4 h-4 mr-2 flex-shrink-0 ${
                    errors.form ? "text-red-500" : "text-emerald-500"
                  }`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d={errors.form ? 
                      "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" : 
                      "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    } 
                    clipRule="evenodd" 
                  />
                </svg>
                {errors.form || successMessage}
              </motion.div>
            )}
            
            <div className="grid grid-cols-1 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                    className={`w-full text-black  pl-10 pr-4 py-3 text-sm sm:text-base border ${
                      errors.firstName ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                    } rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                  )}
                </div>
              </div>
              
              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={handleChange}
                    className={`w-full text-black  pl-10 pr-4 py-3 text-sm sm:text-base border ${
                      errors.lastName ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                    } rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="johndoe123"
                    value={form.username}
                    onChange={handleChange}
                    className={`w-full text-black  pl-10 pr-4 py-3 text-sm sm:text-base border ${
                      errors.username ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                    } rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400`}
                  />
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                  )}
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full text-black  pl-10 pr-4 py-3 text-sm sm:text-base border ${
                      errors.email ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                    } rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>
              
              {/* Confirm Email */}
              <div>
                <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmEmail"
                    type="email"
                    name="confirmEmail"
                    placeholder="Confirm your email"
                    value={form.confirmEmail}
                    onChange={handleChange}
                    className={`w-full text-black  pl-10 pr-4 py-3 text-sm sm:text-base border ${
                      errors.confirmEmail ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                    } rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400`}
                  />
                  {errors.confirmEmail && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirmEmail}</p>
                  )}
                </div>
              </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full text-black  pl-10 pr-10 py-3 text-sm sm:text-base border ${
                      errors.password ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                    } rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>
              
              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`w-full text-black  pl-10 pr-10 py-3 text-sm sm:text-base border ${
                      errors.confirmPassword ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                    } rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              {/* Secret Question */}
              <div>
                <label htmlFor="secretQuestion" className="block text-sm font-medium text-gray-700 mb-1">
                  Security Question
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiHelpCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="secretQuestion"
                    name="secretQuestion"
                    value={form.secretQuestion}
                    onChange={handleChange}
                    className={`w-full text-black  pl-10 pr-4 py-3 text-sm sm:text-base border ${
                      errors.secretQuestion ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                    } rounded-lg focus:ring-2 focus:border-transparent transition appearance-none bg-white`}
                  >
                    <option value="">Select a security question</option>
                    {secretQuestions.map((question, index) => (
                      <option key={index} value={question}>{question}</option>
                    ))}
                  </select>
                  {errors.secretQuestion && (
                    <p className="mt-1 text-xs text-red-600">{errors.secretQuestion}</p>
                  )}
                </div>
              </div>
              
              {/* Secret Answer */}
              <div>
                <label htmlFor="secretAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                  Security Answer
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiHelpCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="secretAnswer"
                    type="text"
                    name="secretAnswer"
                    placeholder="Your answer"
                    value={form.secretAnswer}
                    onChange={handleChange}
                    className={`w-full text-black  pl-10 pr-4 py-3 text-sm sm:text-base border ${
                      errors.secretAnswer ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                    } rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400`}
                  />
                  {errors.secretAnswer && (
                    <p className="mt-1 text-xs text-red-600">{errors.secretAnswer}</p>
                  )}
                </div>
              </div>
              
              {/* Referral Code */}
              <div>
                <label htmlFor="referredCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Referral Code (Optional)
                </label>
                <input
                  id="referredCode"
                  type="text"
                  name="referredCode"
                  placeholder="Enter referral code if any"
                  value={form.referredCode}
                  onChange={handleChange}
                  className="w-full text-black  px-4 py-3 text-sm sm:text-base border border-gray-300 focus:ring-emerald-500 rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400"
                />
              </div>
              
              {/* Wallet Addresses Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Wallet Addresses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* USDT TRC20 */}
                  <div className="space-y-1">
                    <label htmlFor="usdtTrc20Address" className="block text-sm font-medium text-gray-700">
                      USDT (TRC20)
                    </label>
                    <input
                      type="text"
                      id="usdtTrc20Address"
                      name="usdtTrc20Address"
                      value={form.usdtTrc20Address}
                      onChange={handleChange}
                      className="w-full text-black  px-4 py-3 text-sm sm:text-base border border-gray-300 focus:ring-emerald-500 rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400"
                      placeholder="T... (TRON network)"
                    />
                  </div>

                  {/* BTC */}
                  <div className="space-y-1">
                    <label htmlFor="btcAddress" className="block text-sm font-medium text-gray-700">
                      Bitcoin (BTC)
                    </label>
                    <input
                      type="text"
                      id="btcAddress"
                      name="btcAddress"
                      value={form.btcAddress}
                      onChange={handleChange}
                      className="w-full text-black  px-4 py-3 text-sm sm:text-base border border-gray-300 focus:ring-emerald-500 rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400"
                      placeholder="1... or 3... or bc1..."
                    />
                  </div>

                  {/* USDT ERC20 */}
                  <div className="space-y-1">
                    <label htmlFor="usdtErc20Address" className="block text-sm font-medium text-gray-700">
                      USDT (ERC20)
                    </label>
                    <input
                      type="text"
                      id="usdtErc20Address"
                      name="usdtErc20Address"
                      value={form.usdtErc20Address}
                      onChange={handleChange}
                      className="w-full text-black  px-4 py-3 text-sm sm:text-base border border-gray-300 focus:ring-emerald-500 rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400"
                      placeholder="0x... (Ethereum network)"
                    />
                  </div>

                  {/* ETH */}
                  <div className="space-y-1">
                    <label htmlFor="ethAddress" className="block text-sm font-medium text-gray-700">
                      Ethereum (ETH)
                    </label>
                    <input
                      type="text"
                      id="ethAddress"
                      name="ethAddress"
                      value={form.ethAddress}
                      onChange={handleChange}
                      className="w-full px-4 text-black  py-3 text-sm sm:text-base border border-gray-300 focus:ring-emerald-500 rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400"
                      placeholder="0x..."
                    />
                  </div>

                  {/* BNB */}
                  <div className="space-y-1">
                    <label htmlFor="bnbAddress" className="block text-sm font-medium text-gray-700">
                      BNB (BEP20)
                    </label>
                    <input
                      type="text"
                      id="bnbAddress"
                      name="bnbAddress"
                      value={form.bnbAddress}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-black  text-sm sm:text-base border border-gray-300 focus:ring-emerald-500 rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400"
                      placeholder="0x... or bnb1..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-xs sm:text-sm text-gray-700">
                I agree to the <Link href="/terms" className="text-emerald-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center text-sm text-gray-600">
              <p>
                Already have an account?{" "}
                <Link 
                  href="/signin" 
                  className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SignUpForm;