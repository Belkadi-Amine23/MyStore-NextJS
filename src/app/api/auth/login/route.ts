import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const SECRET = process.env.JWT_SECRET || "mon_secret_jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
    }

    // Générer les tokens JWT
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      SECRET,
      { expiresIn: "7d" }
    );

    // Stocker les tokens dans des cookies sécurisés
    const accessCookie = serialize("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    const refreshCookie = serialize("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    // Réponse avec les cookies et le rôle de l'utilisateur
    const response = NextResponse.json(
      { message: "Connexion réussie", role: user.role },
      { status: 200 }
    );

    response.headers.append("Set-Cookie", accessCookie);
    response.headers.append("Set-Cookie", refreshCookie);

    return response;
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
