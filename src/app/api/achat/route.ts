import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  let body: any;
  try {
    // On essaie de parser le corps de la requête
    body = await req.json();
  } catch (err) {
    // Si le parsing échoue (corps vide ou JSON invalide), on renvoie une erreur 400
    return NextResponse.json(
      { error: "Le corps de la requête est vide ou invalide" },
      { status: 400 }
    );
  }
  
  // Vérifier que le body est un objet non null
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Le corps de la requête est vide" },
      { status: 400 }
    );
  }
  
  // Destructuration du body
  const { nom, prenom, wilaya, ville, telephone, totalMontant, articles } = body;

  console.log("Données reçues :", { nom, prenom, wilaya, ville, telephone, totalMontant, articles });

  // Vérification que les données ne sont pas nulles ou incomplètes
  if (!nom || !prenom || !wilaya || !ville || !telephone || !totalMontant || !articles || articles.length === 0) {
    return NextResponse.json(
      { error: "Données invalides ou incomplètes" },
      { status: 400 }
    );
  }

  try {
    // Vérification des stocks avant de créer l'achat
    for (const article of articles) {
      const stock = await prisma.article.findUnique({
        where: { id: article.id },
        select: { titre: true, quantité: true } // Récupérer aussi le titre
      });
    
      if (!stock || stock.quantité < article.quantité) {
        return NextResponse.json(
          {
            error: `Stock insuffisant pour l'article "${stock?.titre || 'Inconnu'}" - RESSAYEZ PLUS TARD !`
          },
          { status: 400 }
        );
      }
    }

    // Création de l'achat
    const achat = await prisma.achat.create({
      data: {
        nom,
        prenom,
        wilaya,
        ville,
        telephone,
        totalMontant: parseFloat(totalMontant), // Convertir en nombre
      },
    });

    console.log("✅ Achat créé avec succès :", achat);

    // Ajout des articles dans `ArticleAchat` et mise à jour des stocks
    for (const article of articles) {
      await prisma.articleAchat.create({
        data: {
          achatId: achat.id,
          articleId: article.id,
          quantité: article.quantité,
          prix: article.prix,
        },
      });

      console.log(`✅ Article ajouté (ID: ${article.id}, Quantité: ${article.quantité})`);

      // Mise à jour du stock de l'article
      await prisma.article.update({
        where: { id: article.id },
        data: { quantité: { decrement: article.quantité } },
      });

      console.log(`✅ Stock mis à jour pour l'article ID: ${article.id}`);
    }

    return NextResponse.json(
      { message: "Achat enregistré avec succès", id: achat.id },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'achat :", error ?? "Erreur inconnue");
    const errorMessage =
      error && typeof error === "object" && "message" in error && error.message
        ? error.message
        : "Erreur inconnue";
    return NextResponse.json(
      { error: "Erreur lors de la création de l'achat", details: errorMessage },
      { status: 500 }
    );
  }
}

// 📌 Récupérer les achats en attente
export async function GET() {
  try {
    const achats = await prisma.achat.findMany({
      where: { validé: false },
      include: {
        articles: {
          include: { article: true },
        },
      },
    });

    // ✅ Vérifier si la réponse est vide
    if (!achats || achats.length === 0) {
      return NextResponse.json([], { status: 200 }); // Retourne un tableau vide au lieu de `null`
    }

    return NextResponse.json(achats, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des achats :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// 📌 Mettre à jour (valider/refuser) un achat
export async function PATCH(req: Request) {
  try {
    const { id, action } = await req.json(); // Récupérer l'ID et l'action (valider/refuser)

    const achat = await prisma.achat.findUnique({
      where: { id: Number(id) },
      include: { articles: true },
    });

    if (!achat) {
      return NextResponse.json({ error: "Achat introuvable" }, { status: 404 });
    }

    if (action === "valider") {
      // Valider l'achat : mettre `validé` à `true` et réduire le stock
      await prisma.achat.update({
        where: { id: Number(id) },
        data: { validé: true },
      });

      for (const articleAchat of achat.articles) {
        await prisma.article.update({
          where: { id: articleAchat.articleId },
          data: { quantité: { decrement: articleAchat.quantité } },
        });
      }

      return NextResponse.json({ message: "Achat validé avec succès" });
    }

    if (action === "refuser") {
      // Refuser l'achat : remettre les articles en stock et supprimer l'achat
      for (const articleAchat of achat.articles) {
        await prisma.article.update({
          where: { id: articleAchat.articleId },
          data: { quantité: { increment: articleAchat.quantité } },
        });
      }

      await prisma.achat.delete({ where: { id: Number(id) } });

      return NextResponse.json({ message: "Achat refusé et stock mis à jour" });
    }

    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'achat" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { achatId, action } = await req.json(); // Récupérer l'ID de l'achat et l'action

    if (!achatId || !["valider", "refuser"].includes(action)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    // 🔹 Trouver l'achat concerné
    const achat = await prisma.achat.findUnique({
      where: { id: achatId },
      include: { articles: true },
    });

    if (!achat) {
      return NextResponse.json({ error: "Achat non trouvé" }, { status: 404 });
    }

    if (action === "valider") {
      // ✅ Valider l'achat (mettre `validé = true`)
      await prisma.achat.update({
        where: { id: achatId },
        data: { validé: true },
      });

      return NextResponse.json({ message: "Achat validé avec succès" }, { status: 200 });
    } else if (action === "refuser") {
      // 🚀 Refuser l'achat et remettre les stocks
      for (const item of achat.articles) {
        await prisma.article.update({
          where: { id: item.articleId },
          data: {
            quantité: {
              increment: item.quantité, // 🔥 Remet les produits en stock
            },
          },
        });
      }

      await prisma.achat.delete({ where: { id: achatId } });

      return NextResponse.json({ message: "Achat refusé et stock mis à jour" }, { status: 200 });
    }
  } catch (error) {
    console.error("Erreur PUT achat:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
