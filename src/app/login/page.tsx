import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from '../../lib/authOptions'
import AuthForm from "../../components/AuthForm";
import Link from "next/link";

interface LoginPageProps {
  searchParams: Promise<{ message?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/home");
  }

  const { message } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col justify-between p-10">
      <Link href="/" className="self-start text-2xl">&lt;/&gt;</Link>
      <div className="flex flex-col justify-center items-center">
        {message && (
          <div className="max-w-md mx-auto mb-4 p-3 border border-green-300 text-green-300 rounded">
            {message}
          </div>
        )}

        <AuthForm type="login" />

        <div className="text-center mt-4">
          <p className="text-gray-600">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-gray-400 hover:text-green-800">
              Sign up
            </a>
          </p>
        </div>
      </div>
      <div></div>
    </div>
  );
}