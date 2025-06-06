import { withAuth } from "next-auth/middleware"

export default withAuth(
  // Remove the unused middleware function entirely
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect the /home route
        if (req.nextUrl.pathname.startsWith('/home')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/home/:path*']
}