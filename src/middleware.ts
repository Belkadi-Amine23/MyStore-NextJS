import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || "mon_secret_jwt";
const secretKeyUint8Array = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
  console.log("--- MIDDLEWARE EXECUTION START ---");
  const { pathname } = request.nextUrl;
  console.log("[Middleware] Demande pour :", pathname);

  const protectedRoutes = ['/admin', '/client'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    console.log("[Middleware] Route non protégée, passage.");
    return NextResponse.next();
  }

  console.log("[Middleware] Route protégée détectée:", pathname);

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  console.log("[Middleware] accessToken trouvé:", accessToken ? "Oui" : "Non");
  console.log("[Middleware] refreshToken trouvé:", refreshToken ? "Oui" : "Non");

  if (!accessToken) {
    if (!refreshToken) {
      console.log("[Middleware] Aucun token détecté pour", pathname, "-> Redirection vers /login");
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (accessToken) {
    try {
      await jwtVerify(accessToken, secretKeyUint8Array);
      console.log("[Middleware] accessToken valide (jose) pour", pathname, "-> Autorisation");
      return NextResponse.next();
    } catch (error) {
      console.log("[Middleware] accessToken invalide (jose) pour", pathname, "| Erreur :", error instanceof Error ? error.message : "Erreur inconnue");
      if (!refreshToken) {
        console.log("[Middleware] refreshToken absent pour", pathname, "-> Redirection vers /login");
        const loginUrl = new URL("/login", request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('accessToken');
        return response;
      }
    }
  }

  if (refreshToken) {
    try {
      const { payload } = await jwtVerify(refreshToken, secretKeyUint8Array);
      console.log("[Middleware] refreshToken valide (jose) pour", pathname, "-> Renouvellement de l'accessToken");

      const newAccessToken = await new SignJWT({ userId: payload.userId, role: payload.role })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1m')
        .sign(secretKeyUint8Array);

      const response = NextResponse.next();
      response.cookies.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      return response;

    } catch (error) {
      console.log("[Middleware] refreshToken invalide (jose) pour", pathname, "| Erreur :", error instanceof Error ? error.message : "Erreur inconnue", "-> Redirection vers /login");
      const loginUrl = new URL("/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }
  }
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/client/:path*", "/client"], 
};