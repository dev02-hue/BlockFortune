// components/FloatingDocButton.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaFileAlt } from 'react-icons/fa'
import { usePathname } from 'next/navigation'

export default function FloatingDocButton() {
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Check if current path is NOT user or admin page
    const isUserOrAdminPage = pathname?.startsWith('/user') || pathname?.startsWith('/savio')
    setVisible(!isUserOrAdminPage)
  }, [pathname])

  if (!visible) return null

  return (
    <div className=" ">
      <Link
        href="https://docs.google.com/document/d/15Hnu51-BX90Fjq0OyoX1u4Lx5R2MrJwW4LxwpGpvqQo/edit?tab=t.p4pwqbyuwzns"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110"
        aria-label="View Documentation"
      >
        <FaFileAlt className="w-6 h-6" />
        <span className="sr-only">Documentation</span>
      </Link>
      <div className="absolute right-16 bottom-2 w-max px-3 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        View Documentation
      </div>
    </div>
  )
}