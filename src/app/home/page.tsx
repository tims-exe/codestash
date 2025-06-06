import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import Layout from '@/components/Layout'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <Layout>
    <div className="max-w-2xl mx-auto text-center flex flex-col justify-center items-center">
        <div className="bg-neutral-900 p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-white">
            Hello, {session.user?.name}!
            </h2>
            
        </div>
    </div>
    </Layout>
  )
}