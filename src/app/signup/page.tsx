import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import Layout from '../../components/Layout'
import AuthForm from '../../components/AuthForm'

export default async function SignupPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/home')
  }

  return (
    <Layout>
      <AuthForm type="signup" />
      <div className="text-center mt-4">
        <p className="text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-800">
            Login here
          </a>
        </p>
      </div>
    </Layout>
  )
}