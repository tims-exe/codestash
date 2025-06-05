'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <h1 className="text-4xl mb-8">CodeStash_</h1>
      <div className="flex space-x-4">
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
        <button
          onClick={() => router.push('/signup')}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Signup
        </button>
      </div>
    </div>
  )
}