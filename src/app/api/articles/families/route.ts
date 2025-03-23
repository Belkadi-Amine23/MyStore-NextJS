import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Récupère les valeurs distinctes de la colonne "famille"
    const familiesData = await prisma.article.findMany({
      distinct: ['famille'],
      select: { famille: true },
    });
    // Extraction d'un tableau de chaînes
    const families = familiesData.map(item => item.famille);
    return NextResponse.json(families, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des familles :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
