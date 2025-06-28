'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
 
export default function SignOutButton() {
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
        // Redirect after successful sign out
        router.push('/signin')
        router.refresh() // Ensure client state is cleared
      }
    } catch (err) {
        console.log(err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleSignOut}
        disabled={loading}
        className={`px-4 py-2 rounded-md text-white font-medium ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {loading ? 'Signing Out...' : 'Sign Out'}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}