import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function middleware(request) {
	const cookie = await cookies();
	const pathname = request.nextUrl.pathname;

	// Jika belum login dan mengakses url /staff maka dialihkan ke /auth
	if (!cookie.get("access_key")) {
		if (pathname.startsWith("/staff"))
			return NextResponse.redirect(new URL("/auth", request.url));
	}

	// Jika sudah login dan mengakses url /auth maka dialihkan ke /staff
	if (cookie.get("access_key")) {
		if (pathname.startsWith("/auth"))
			return NextResponse.redirect(new URL("/staff", request.url));
	}
}

export const config = {
	matcher: ["/auth", "/staff"],
};
