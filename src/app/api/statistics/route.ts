import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // 1. Total des ventes (achats validés)
    const totalSalesAgg = await prisma.achat.aggregate({
      _sum: { totalMontant: true },
      where: { validé: true },
    });
    const totalSales = totalSalesAgg._sum.totalMontant || 0;

    // 2. Articles en stock (somme des quantités)
    const articlesAggregate = await prisma.article.aggregate({
      _sum: { quantité: true },
    });
    const totalArticles = articlesAggregate._sum.quantité || 0;

    // 3. Total Achats réalisés (achats validés)
    const totalAchats = await prisma.achat.count({
      where: { validé: true },
    });

    // 4. Total Users et leurs détails (nom et rôle)
    const usersDetails = await prisma.user.findMany({
      select: { name: true, role: true },
    });
    const totalUsers = usersDetails.length;

    // 5. Familles : nombre total et liste distincte
    const familiesGroup = await prisma.article.groupBy({
      by: ["famille"],
    });
    const totalFamilies = familiesGroup.length;
    const familyList = await prisma.article.findMany({
      select: { famille: true },
      distinct: ["famille"],
    });

    // 6. Détails des articles (faible stock, stock suffisant, en remise)
    const allArticles = await prisma.article.findMany({
      select: { id: true, titre: true, quantité: true, remise: true, famille: true },
    });
    const lowStockArticles = allArticles.filter(a => a.quantité < 10);
    const sufficientStockArticles = allArticles.filter(a => a.quantité >= 10);
    const discountedArticles = allArticles.filter(a => a.remise > 0);

    // 7. Top Articles Vendus
    const articleAchatGroupTop = await prisma.articleAchat.groupBy({
      by: ['articleId'],
      _sum: { quantité: true },
      orderBy: { _sum: { quantité: 'desc' } },
      take: 5,
    });
    const topSellingArticles = await Promise.all(
      articleAchatGroupTop.map(async (group) => {
        const article = await prisma.article.findUnique({ where: { id: group.articleId } });
        return { titre: article?.titre || "Inconnu", quantity: group._sum.quantité || 0 };
      })
    );

    // 8. Articles les Moins Vendus
    const articleAchatGroupBottom = await prisma.articleAchat.groupBy({
      by: ['articleId'],
      _sum: { quantité: true },
      orderBy: { _sum: { quantité: 'asc' } },
      take: 5,
    });
    const leastSellingArticles = await Promise.all(
      articleAchatGroupBottom.map(async (group) => {
        const article = await prisma.article.findUnique({ where: { id: group.articleId } });
        return { titre: article?.titre || "Inconnu", quantity: group._sum.quantité || 0 };
      })
    );

    // 9. Ventes par Famille
    const articleAchats = await prisma.articleAchat.findMany({
      where: { achat: { validé: true } },
      include: { article: true },
    });
    const salesByFamily: { [family: string]: number } = {};
    for (const aa of articleAchats) {
      const family = aa.article.famille;
      const saleAmount = aa.prix * aa.quantité;
      salesByFamily[family] = (salesByFamily[family] || 0) + saleAmount;
    }

    // 10. Ventes Temporelles
    const validatedAchats = await prisma.achat.findMany({
      where: { validé: true },
      select: { createdAt: true, totalMontant: true },
    });
    const monthNames = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    const monthlySalesMap: { [month: string]: number } = {};
    const weeklySalesMap: { [week: string]: number } = {};
    const dailySalesMap: { [date: string]: number } = {};
    const yearlySalesMap: { [year: string]: number } = {};

    // Calcul des ventes d'aujourd'hui
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    let salesToday = 0;

    for (const achat of validatedAchats) {
      const dateStr = achat.createdAt.toISOString().split("T")[0];
      const monthIndex = achat.createdAt.getMonth();
      const year = achat.createdAt.getFullYear().toString();
      const week = `S${Math.ceil(achat.createdAt.getDate() / 7)}-${year}`;

      dailySalesMap[dateStr] = (dailySalesMap[dateStr] || 0) + achat.totalMontant;
      weeklySalesMap[week] = (weeklySalesMap[week] || 0) + achat.totalMontant;
      monthlySalesMap[monthNames[monthIndex]] = (monthlySalesMap[monthNames[monthIndex]] || 0) + achat.totalMontant;
      yearlySalesMap[year] = (yearlySalesMap[year] || 0) + achat.totalMontant;

      if (achat.createdAt >= startOfToday && achat.createdAt < startOfTomorrow) {
        salesToday += achat.totalMontant;
      }
    }

    const monthlySales = monthNames.map((month) => ({
      month,
      sales: monthlySalesMap[month] || 0,
    }));
    const weeklySales = Object.entries(weeklySalesMap).map(([week, sales]) => ({ week, sales }));
    const dailySales = Object.entries(dailySalesMap).map(([date, sales]) => ({ date, sales }));
    const yearlySales = Object.entries(yearlySalesMap).map(([year, sales]) => ({ year, sales }));

    // 11. Détails des achats validés (avec nom, prénom, téléphone)
    const validatedPurchases = await prisma.achat.findMany({
      where: { validé: true },
      select: { totalMontant: true, createdAt: true, nom: true, prenom: true, telephone: true },
      orderBy: { createdAt: 'desc' },
    });

    // Moyenne des ventes quotidiennes (jours distincts)
    const distinctDates = new Set(Object.keys(dailySalesMap));
    const averageDailySales = distinctDates.size > 0 ? totalSales / distinctDates.size : 0;

    // 12. Clients : groupBy par numéro de téléphone pour obtenir une liste distincte de clients
    const clients = await prisma.achat.groupBy({
      by: ["telephone"],
      _min: { nom: true, prenom: true },
    });

    const result = {
      totalSales,
      totalArticles,
      totalAchats,
      totalUsers,
      totalFamilies,
      familyList,
      averageDailySales,
      salesByFamily,
      monthlySales,
      weeklySales,
      dailySales,
      yearlySales,
      topSellingArticles,
      leastSellingArticles,
      lowStockArticles,
      sufficientStockArticles,
      discountedArticles,
      validatedPurchases,
      usersDetails,
      clients,
      salesToday,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur dans l'API statistiques :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
