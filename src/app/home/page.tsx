import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import Layout from '../../components/Layout'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Welcome Home!
        </h1>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Hello, {session.user?.name}!
          </h2>
          <div className="bg-gray-50 p-6 rounded-md">
            <h3 className="font-semibold mb-4 text-gray-700">Your Profile:</h3>
            <div className="space-y-2 text-left">
              <p className="text-gray-600">
                <strong>Username:</strong> {session.user?.name}
              </p>
              <p className="text-gray-600">
                <strong>User ID:</strong> {session.user?.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}