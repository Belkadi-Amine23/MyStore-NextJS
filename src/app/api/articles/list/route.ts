import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
      const articles = await prisma.article.findMany();
  
      // Vérifier que l'image a une URL correcte
      const articlesAvecImage = articles.map(article => ({
        ...article,
        imageUrl: article.imageUrl // L'URL est déjà complète
      }));
  
      return NextResponse.json(articlesAvecImage, { status: 200 });
    } catch (error) {
      console.error("Erreur lors de la récupération des articles :", error);
      return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
  }
  