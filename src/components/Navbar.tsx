'use client'

import Link from 'next/link'
import React from 'react'
import { signOut } from 'next-auth/react'

const Navbar = () => {
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: '/',
      redirect: true
    })
  }

  return (
    <div className='flex justify-between items-center'>
      <Link href="/" className="self-start text-2xl">&lt;/&gt;</Link>
      <button 
        onClick={handleSignOut}
        className="self-start text-xl hover:text-red-500 transition-colors duration-200 cursor-pointer"
      >
        Sign Out
      </button>
    </div>
  )
}

export default Navbar
