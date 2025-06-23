// components/Spinner.tsx
'use client'

import { motion } from 'framer-motion'

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-[3px]',
    lg: 'h-8 w-8 border-[3px]'
  }

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className={`rounded-full border-solid ${sizes[size]} border-gray-200 border-t-blue-500`}
      />
    </div>
  )
}