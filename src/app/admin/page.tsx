"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaHome,
  FaEdit,
  FaChartBar,
  FaShoppingCart,
  FaSignOutAlt,
  FaEye,
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

interface Article {
  id: number;
  titre: string;
  description: string;
  prix: number;
  remise?: number;
  imageUrl: string;
  quantité: number;
}

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [remiseValues, setRemiseValues] = useState<{ [key: number]: number }>({});
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const articlesParPage: number = 3;
  const indexDepart: number = (page - 1) * articlesParPage;
  const articlesAffiches: Article[] = articles.slice(
    indexDepart,
    indexDepart + articlesParPage
  );

  // Fonction de récupération des articles et du nombre d'achats en attente
  const fetchData = async () => {
    try {
      const res = await fetch("/api/home");
      const text = await res.text();
      let data = { articles: [], pendingCount: 0 };
      try {
        data = text ? JSON.parse(text) : { articles: [], pendingCount: 0 };
      } catch (error) {
        console.error("Erreur lors du parsing JSON :", error);
      }
      setArticles(data.articles);
      setPendingCount(data.pendingCount);
      setLoading(false);
    } catch (error) {
      console.error("Erreur dans la requête /api/home :", error);
      setLoading(false);
    }
  };

  // Récupération initiale et polling toutes les 5 secondes
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 5000); // toutes les 5 secondes (ajuste si besoin)
    return () => clearInterval(interval);
  }, []);

  // Lorsque l'utilisateur clique sur "Appliquer", on met à jour la remise de l'article
  const handleApplyRemise = async (id: number) => {
    try {
      const remiseValue = remiseValues[id] || 0;
      const response = await fetch("/api/articles/AdminRemise", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, remise: remiseValue }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la remise");
      }
      const updatedArticle = await response.json();
      // Mettre à jour le state avec l'article mis à jour
      setArticles((prev) =>
        prev.map((article) =>
          article.id === id ? updatedArticle : article
        )
      );
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour de la remise");
    }
  };

  const handleLogout = () => {
    alert("Vous avez été déconnecté !");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 to-blue-600 p-4 text-white flex justify-between items-center shadow-lg">
        <nav className="flex items-center space-x-6">
          <Link href="/admin" className="flex items-center hover:scale-105 transition-transform">
            <FaHome className="mr-1 text-2xl text-yellow-300" /> 
            <span className="font-bold">Accueil</span>
          </Link>
          <Link href="/admin/create-article" className="flex items-center hover:scale-105 transition-transform">
            <FaEdit className="mr-1 text-2xl text-green-300" /> 
            <span className="font-bold">Créer</span>
          </Link>
          <Link href="/admin/statistics" className="flex items-center hover:scale-105 transition-transform">
            <FaChartBar className="mr-1 text-2xl text-orange-300" /> 
            <span className="font-bold">Statistiques</span>
          </Link>
          <Link href="/admin/achats" className="relative flex items-center hover:scale-105 transition-transform">
            <FaShoppingCart className="mr-1 text-2xl text-red-300" /> 
            <span className="font-bold">Achats</span>
            {pendingCount > 0 && (
              <span className="absolute top-[-8px] right-[-8px] bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                {pendingCount}
                <span className="absolute inset-0 rounded-full bg-red-600 opacity-75 animate-ping"></span>
              </span>
            )}
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 px-4 py-2 rounded-full flex items-center gap-2 transition-colors shadow-lg"
        >
          <FaSignOutAlt className="text-xl" /> Déconnexion
        </button>
      </header>

      {/* Body */}
      <main className="flex-grow p-6 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <FaSpinner className="animate-spin text-6xl text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articlesAffiches.map((article) => {
              // Calcul du nouveau prix si une remise est appliquée
              const nouveauPrix =
                article.remise && article.remise > 0
                  ? (article.prix - (article.prix * article.remise) / 100).toFixed(2)
                  : null;
              return (
                <div key={article.id} className="border p-4 rounded shadow-lg bg-white flex flex-col">
                  {/* Image de l'article */}
                  <div className="w-full h-96 flex items-center justify-center overflow-hidden rounded-md mb-4">
                    <img
                      src={article.imageUrl}
                      alt={article.titre}
                      className="w-11/12 h-11/12 object-contain"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{article.titre}</h2>
                  {/* Description avec "Voir plus" */}
                  <div className="relative mt-2 text-sm text-gray-600 overflow-hidden">
                    <p className="line-clamp-3">{article.description}</p>
                    {article.description.length > 100 && (
                      <Link href={`/admin/article/${article.id}`} className="text-blue-500 hover:underline">
                        Voir plus
                      </Link>
                    )}
                  </div>
                  {/* Affichage du prix */}
                  <div className="mt-2">
                    {article.remise && article.remise > 0 ? (
                      <p className="text-lg font-semibold">
                        Prix: <span className="line-through text-gray-500">{article.prix}€</span>{" "}
                        <span className="text-red-500">{nouveauPrix}€</span>
                      </p>
                    ) : (
                      <p className="text-lg font-semibold">Prix: {article.prix}€</p>
                    )}
                  </div>
                  <p className="text-lg font-semibold">Quantité: {article.quantité}</p>
                  {/* Affichage de la remise actuelle */}
                  {article.remise && article.remise > 0 ? (
                    <p className="text-red-500 font-semibold">Remise: {article.remise}%</p>
                  ) : (
                    <p className="text-gray-500">Pas de remise</p>
                  )}
                  {/* Ligne de boutons */}
                  <div className="mt-4 flex items-center">
                    <input
                      type="number"
                      placeholder="Remise %"
                      className="border px-3 py-1 rounded w-32"
                      value={remiseValues[article.id] || ""}
                      onChange={(e) =>
                        setRemiseValues({
                          ...remiseValues,
                          [article.id]: Number(e.target.value),
                        })
                      }
                    />
                    <button
                      onClick={() => handleApplyRemise(article.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded ml-2"
                    >
                      Appliquer
                    </button>
                    <Link 
                      href={`/admin/article/${article.id}`}
                      className="ml-auto bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-1 shadow transition"
                    >
                      <FaEye /> Voir l'article
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Pagination */}
      <footer className="bg-gray-200 p-4 text-center flex justify-center items-center space-x-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400 transition flex items-center gap-2"
        >
          <FaArrowLeft />
          <span>Précédent</span>
        </button>
        <span className="px-4 py-2 text-lg font-semibold">Page {page}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={indexDepart + articlesParPage >= articles.length}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400 transition flex items-center gap-2"
        >
          <span>Suivant</span>
          <FaArrowRight />
        </button>
      </footer>
    </div>
  );
}
