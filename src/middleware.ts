import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware() {
    // This function can be empty since we're handling auth in callbacks
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