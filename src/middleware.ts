import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Auth Supabase (automatique via cookies)
  const supabase = createMiddlewareClient({ req, res });

  // Récupération de la session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const isLoginPage = pathname.startsWith("/login");

  // 1️⃣ NON CONNECTÉ → redirection /login
  if (!session && !isLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 2️⃣ CONNECTÉ → empêcher l'accès à /login
  if (session && isLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/reglages/:path*",
    "/contacts/:path*",
    "/messages/:path*",
    "/tickets/:path*",
  ],
};
