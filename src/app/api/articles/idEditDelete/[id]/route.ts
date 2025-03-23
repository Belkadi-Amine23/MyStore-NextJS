import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Si besoin de rendre la route "force-dynamic"
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: any) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id: Number(id) },
    });
    if (!article) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    return NextResponse.json(article, { status: 200 });
  } catch (error) {
    console.error("Erreur GET article :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: any) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  try {
    const text = await request.text();
    if (!text) {
      return NextResponse.json({ error: "Payload vide ou invalide" }, { status: 400 });
    }

    const data = JSON.parse(text);
    const dataToUpdate = {
      ...data,
      prix: parseFloat(data.prix),
      quantité: parseInt(data.quantité, 10),
      remise: parseFloat(data.remise),
    };

    if (
      isNaN(dataToUpdate.prix) ||
      isNaN(dataToUpdate.quantité) ||
      isNaN(dataToUpdate.remise)
    ) {
      return NextResponse.json(
        { error: "Les champs prix, quantité et remise doivent être des nombres valides" },
        { status: 400 }
      );
    }

    const updatedArticle = await prisma.article.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'article :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  try {
    await prisma.article.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Article supprimé" }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article :", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'article" },
      { status: 500 }
    );
  }
}
