import { auth } from "@/server/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
	const isAuthenticated = !!req.auth;
	const isAuthPage = req.nextUrl.pathname.startsWith("/login");
	const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
	const isInvitePage = req.nextUrl.pathname.startsWith("/invite");

	// Redirect authenticated users away from login page
	if (isAuthPage && isAuthenticated) {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	// Redirect unauthenticated users from dashboard to login
	if (isDashboard && !isAuthenticated) {
		return NextResponse.redirect(new URL("/login", req.url));
	}

	// Redirect unauthenticated users from invite pages to login
	if (isInvitePage && !isAuthenticated) {
		const callbackUrl = encodeURIComponent(req.nextUrl.pathname);
		return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
	}

	return NextResponse.next();
});

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

