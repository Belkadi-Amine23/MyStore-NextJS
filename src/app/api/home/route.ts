import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        titre: true,
        description: true,
        prix: true,
        remise: true,
        imageUrl: true,
        quantité: true, // Ajout de la quantité
      },
    });

    const pendingAchats = await prisma.achat.findMany({
      where: { validé: false },
      select: { id: true },
    });

    const jsonResponse = { articles, pendingCount: pendingAchats.length };
    console.log("Réponse API :", jsonResponse);
    return NextResponse.json(jsonResponse, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
