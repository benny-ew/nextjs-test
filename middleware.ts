import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page and public routes without token
        if (
          req.nextUrl.pathname === "/login" ||
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname.startsWith("/api/test-keycloak")
        ) {
          return true;
        }
        
        // For protected routes, require a valid token
        return !!token?.accessToken;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
