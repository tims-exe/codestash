/* eslint-disable @typescript-eslint/no-unused-vars */
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
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