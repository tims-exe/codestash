import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import AuthForm from '../../components/AuthForm'
import Link from "next/link";


export default async function SignupPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/home')
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-10">
      <Link href="/" className="self-start text-2xl">&lt;/&gt;</Link>
      <div className="flex flex-col justify-center items-center">      
      <AuthForm type="signup" />
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-gray-400 hover:text-green-800">
              Login
            </a>
          </p>
        </div>
      </div>
      <div></div>
    </div>
  )
}