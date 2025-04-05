// app/api/logout/route.ts
import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST(req: Request) {
  // Supprimer le cookie accessToken
  const accessCookie = serialize("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0, // Expire immédiatement le cookie
  });

  // Supprimer le cookie refreshToken
  const refreshCookie = serialize("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0, // Expire immédiatement le cookie
  });

  const response = NextResponse.json({ message: "Déconnexion réussie" }, { status: 200 });
  response.headers.append("Set-Cookie", accessCookie);
  response.headers.append("Set-Cookie", refreshCookie);

  return response;
}