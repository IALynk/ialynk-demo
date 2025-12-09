import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // session Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const isLoginPage = pathname.startsWith("/login");

  // Public route, pas besoin de session
  if (isLoginPage) {
    res.headers.set("x-pathname", pathname);
    return res;
  }

  // Non connecté → Redirection login
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Va chercher le rôle dans Users
  const { data: userData } = await supabase
    .from("Users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  const role = userData?.role || "agent";

  // Protection pages admin
  if (pathname.startsWith("/admin") && role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Envoyer le pathname au layout pour la sidebar
  res.headers.set("x-pathname", pathname);
  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/reglages/:path*",
    "/contacts/:path*",
    "/messages/:path*",
    "/tickets/:path*",
    "/assistant/:path*",
    "/calendrier/:path*",
    "/appels/:path*",
    "/admin/:path*", // pages admin protégées
  ],
};
