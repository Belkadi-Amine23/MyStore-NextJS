"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaHome, FaEdit, FaChartBar, FaShoppingCart, FaSignOutAlt } from "react-icons/fa";

interface Article {
  id: number;
  titre: string;
  description: string;
  prix: number;
  remise?: number;
}

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [remiseValues, setRemiseValues] = useState<{ [key: number]: number }>({});
  const [pendingCount, setPendingCount] = useState<number>(0);
  const router = useRouter();

  // Récupération des données (articles et nombre d'achats en attente)
  useEffect(() => {
    fetch("/api/home")
      .then((res) => res.text())
      .then((text) => {
        let data = { articles: [], pendingCount: 0 };
        try {
          data = text ? JSON.parse(text) : { articles: [], pendingCount: 0 };
        } catch (error) {
          console.error("Erreur lors du parsing JSON :", error);
        }
        setArticles(data.articles);
        setPendingCount(data.pendingCount);
      })
      .catch((error) => console.error("Erreur dans la requête /api/home :", error));
  }, []);

  const handleApplyRemise = (id: number) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === id
          ? { ...article, remise: remiseValues[id] || 0 }
          : article
      )
    );
    // Vous pouvez ajouter un appel API ici pour persister la remise en base.
  };

  const handleLogout = () => {
    alert("Vous avez été déconnecté !");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 p-4 text-white flex justify-between items-center">
        <nav className="flex items-center space-x-4">
          <Link href="/admin" className="hover:underline flex items-center">
            <FaHome className="mr-1" /> Home
          </Link>
          <Link href="/admin/create-article" className="hover:underline flex items-center">
            <FaEdit className="mr-1" /> Créer un article
          </Link>
          <Link href="/admin/statistics" className="hover:underline flex items-center">
            <FaChartBar className="mr-1" /> Voir les statistiques
          </Link>
          <Link href="/admin/achats" className="hover:underline flex items-center relative">
            <FaShoppingCart className="mr-1" /> Achats en attente
            {pendingCount > 0 && (
              <span className="absolute top-0 right-[-10px] bg-red-600 text-white text-xs font-bold px-1 rounded-full">
                {pendingCount}
              </span>
            )}
          </Link>
        </nav>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded flex items-center">
          <FaSignOutAlt className="mr-1" /> Déconnexion
        </button>
      </header>

      {/* Body */}
      <main className="flex-grow p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50">
        {articles.length === 0 ? (
          <p>Aucun article trouvé.</p>
        ) : (
          articles.map((article) => (
            <div key={article.id} className="border p-4 rounded shadow-lg bg-white">
              <h2 className="text-xl font-bold text-gray-800">{article.titre}</h2>
              <p className="text-gray-600">{article.description}</p>
              <p className="text-lg font-semibold mt-2">Prix: {article.prix}€</p>
              {article.remise ? (
                <p className="text-red-500 font-semibold">Remise: {article.remise}%</p>
              ) : (
                <p className="text-gray-500">Pas de remise</p>
              )}
              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Remise %"
                  className="border px-2 py-1 rounded w-20"
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
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Appliquer
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 p-4 text-center flex justify-center space-x-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Précédent
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Suivant
        </button>
      </footer>
    </div>
  );
}
