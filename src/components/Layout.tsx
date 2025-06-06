'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
  <div className="min-h-screen flex flex-col">
    <nav className="pt-6">
      <div className="mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl text-white">
            &lt;/&gt;
          </Link>

          {/* Right: Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-white px-4 py-2 rounded-md hover:text-green-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>

    {/* Main Content */}
    <main className="flex flex-1 justify-center items-center px-4 sm:px-6 lg:px-8">
      {children}
    </main>
  </div>
)

}