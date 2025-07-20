'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { FiLogOut } from 'react-icons/fi'

interface SignOutButtonProps {
  className?: string;
}

export default function SignOutButton({ className = '' }: SignOutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignOut = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await signOut()
      
      if (result.error) {
        setError(result.error)
      } else {
        router.push('/signin')
        router.refresh()
      }
    } catch (err) {
      console.log(err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleSignOut}
        disabled={loading}
        className={`w-full text-left px-4 py-3 text-sm hover:bg-green-900 hover:bg-opacity-50 transition-colors flex items-center space-x-2 text-white ${className}`}
      >
        <FiLogOut className="text-green-400" />
        <span>{loading ? 'Signing Out...' : 'Sign Out'}</span>
      </button>
      
      {error && (
        <p className="mt-2 px-4 text-sm text-red-400">{error}</p>
      )}
    </>
  )
}