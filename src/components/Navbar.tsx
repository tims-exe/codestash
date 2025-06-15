'use client'

import Link from 'next/link'
import React from 'react'
import { signOut } from 'next-auth/react'


interface NavbarProps {
  userName?: string;
}

const Navbar = ({ userName }: NavbarProps) => {
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
        className="self-start text-xl hover:bg-neutral-800 transition-colors duration-200 cursor-pointer px-5 py-0.5 rounded-xl"
      >
        {userName}
      </button>
    </div>
  )
}

export default Navbar
