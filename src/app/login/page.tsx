import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import Layout from '../../components/Layout'
import AuthForm from '../../components/AuthForm'

interface LoginPageProps {
  searchParams: { message?: string }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/home')
  }

  return (
    <Layout>
      {searchParams.message && (
        <div className="max-w-md mx-auto mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {searchParams.message}
        </div>
      )}
      <AuthForm type="login" />
      <div className="text-center mt-4">
        <p className="text-gray-600">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:text-blue-800">
            Sign up here
          </a>
        </p>
      </div>
    </Layout>
  )
}