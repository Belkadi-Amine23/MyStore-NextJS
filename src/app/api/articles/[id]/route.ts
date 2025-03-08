import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params; // Attendre la résolution de params
    
    if (!params || !params.id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json({ message: "Article non trouvé" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
