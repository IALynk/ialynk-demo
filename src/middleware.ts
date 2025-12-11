import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // 🔥 Routes publiques
  const publicRoutes = ["/login", "/register", "/"];
  const isPublic = publicRoutes.some((r) => pathname.startsWith(r));

  // ✔️ Autoriser les routes publiques
  if (isPublic) {
    res.headers.set("x-pathname", pathname);
    return res;
  }

  // ❌ Non connecté → login
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 🔥 Rôles (Users table)
  const { data: userData } = await supabase
    .from("Users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  const role = userData?.role || "agent";

  // 🔒 Protection admin
  if (pathname.startsWith("/admin") && role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  res.headers.set("x-pathname", pathname);
  return res;
}

export const config = {
  // Middleware appliqué à toutes les routes sauf fichiers statiques & API
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
