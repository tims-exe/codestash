'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleEnterClick = useCallback(() => {
    if (status === 'loading') return
    setLoading(true)

    if (session) {
      router.push('/home')
    } else {
      router.push('/login')
    }
  }, [status, session, router])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleEnterClick()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleEnterClick])

  return (
    <div className='flex min-h-screen flex-col justify-between items-center p-10'>
      <div className='self-start text-2xl'>&lt;/&gt;</div>
      <div className='flex flex-col justify-start'>
        <p className='text-[50px] pb-4'>
          codestash_
        </p>
        <p className='max-w-[500px]'>
          Organize and store your coding problems in a structured, searchable, and trackable way.
        </p>
        <button 
          onClick={handleEnterClick}
          className='bg-white flex px-7 py-2 justify-center items-center gap-3 rounded-xl w-min self-center mt-10 cursor-pointer'
          disabled={loading}
        >
          <p className='text-black'>
            {loading ? 'Loading...' : 'Enter'}
          </p>
          <Image 
            src="/images/enter_arrow.png"
            alt="enter_arrow"
            width={18}
            height={6.22}
          />
        </button>
      </div>
      <div className=''></div>
    </div>
  )
}