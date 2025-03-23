import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { id, remise } = await request.json();
    if (!id || remise === undefined) {
      return NextResponse.json({ error: "L'id et la remise sont requis" }, { status: 400 });
    }
    const updatedArticle = await prisma.article.update({
      where: { id: id },
      data: { remise: remise },
    });
    return NextResponse.json(updatedArticle, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'article :", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'article" }, { status: 500 });
  }
}
