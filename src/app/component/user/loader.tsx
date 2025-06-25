// components/ui/loader.tsx
import { motion } from 'framer-motion'

interface LoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  className?: string
}

export const Loader = ({ size = 'md', color = 'currentColor', className = '' }: LoaderProps) => {
  const sizeMap = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const circleSize = sizeMap[size]

  return (
    <motion.div
      className={`relative ${circleSize} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <svg
        className={`${circleSize} animate-pulse`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="1, 30"
          initial={{ pathLength: 0.25, rotate: 0 }}
          animate={{
            pathLength: [0.25, 0.75, 0.25],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </svg>
    </motion.div>
  )
}

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 z-50 flex items-center justify-center">
      <div className="text-center">
        <Loader size="xl" color="#3B82F6" />
        <motion.p
          className="mt-4 text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Loading...
        </motion.p>
      </div>
    </div>
  )
}