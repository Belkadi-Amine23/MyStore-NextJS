import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Récupérer l'achat
    const achat = await prisma.achat.findUnique({ where: { id: Number(id) }, include: { articles: true } });

    if (!achat) {
      return NextResponse.json({ error: "Achat non trouvé" }, { status: 404 });
    }

    // Diminuer la quantité des articles achetés
    const articles = typeof achat.articles === 'string' ? JSON.parse(achat.articles) : [];
    for (const article of articles) {
      await prisma.article.update({
        where: { id: article.id },
        data: { quantité: { decrement: article.quantité } },
      });
    }

    // Valider l'achat
    await prisma.achat.update({
      where: { id: Number(id) },
      data: { validé: true },
    });

    return NextResponse.json({ message: "Achat validé" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la validation" }, { status: 500 });
  }
}
