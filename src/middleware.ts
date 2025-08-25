import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Public paths
const PUBLIC_PATHS = ["/login", "/api/auth", "/_next", "/favicon.ico", "/workspace"];

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;

        // Allow public paths
        if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
            return NextResponse.next();
        }

        // Protected paths: redirect to /login if no token
        if (!req.nextauth.token) {
            const loginUrl = req.nextUrl.clone();
            loginUrl.pathname = "/login";
            loginUrl.search = `?callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`;
            return NextResponse.redirect(loginUrl);
        }

        // Otherwise, allow access
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

// Middleware applies to everything except public paths
export const config = {
    matcher: ["/pin-manager/:path*",],
};
