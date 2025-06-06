/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AuthFormProps {
  type: 'login' | 'signup'
}

interface FormData {
  username: string
  password: string
}

export default function AuthForm({ type }: AuthFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: ''
  })
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (type === 'signup') {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (response.ok) {
          router.push('/login?message=Account created successfully')
        } else {
          setError(data.message)
        }
      } else {
        const result = await signIn('credentials', {
          username: formData.username,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          setError('Invalid username or password')
        } else {
          router.push('/home')
        }
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[calc(100%-40px)] max-w-[350px] mx-auto mt-8 p-6 bg-neutral-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {type === 'signup' ? 'Sign Up' : 'Login'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 border border-red-500 text-red-400 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm text-neutral-400">
            Username
          </label>
            <input
            type="text"
            id="username"
            name="username"
            autoComplete="off"
            value={formData.username}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={50}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-neutral-500 focus:border-neutral-500"
            />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-neutral-400">
            Password
          </label>
            <input
            type="password"
            id="password"
            name="password"
            autoComplete="off"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-neutral-500 focus:border-neutral-500"
            />

        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black py-2 px-4 rounded-md hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : (type === 'signup' ? 'Sign Up' : 'Login')}
        </button>
      </form>
    </div>
  )
}