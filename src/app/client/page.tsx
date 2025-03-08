"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaShoppingCart, FaSignOutAlt, FaPercentage, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Link from "next/link";

interface Article {
  id: number;
  titre: string;
  description: string;
  prix: string;
  remise: number;
  imageUrl: string;
}

export default function ClientPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [panier, setPanier] = useState<Article[]>([]);
  const [page, setPage] = useState<number>(1);
  const router = useRouter();
  const articlesParPage: number = 3; // ✅ Limite de 3 articles par page

   // 🔹 Vérifier si la commande a été confirmée et vider le panier si nécessaire
   useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("clearCart") === "true") {
      localStorage.removeItem("panier"); // 🔥 Vider le panier dans Local Storage
      sessionStorage.removeItem("clearCart"); // 🔥 Supprimer l'indicateur
      setPanier([]); // 🔥 Mettre à jour l'état du panier à 0
    }
  }, []);

  // 🔹 Charger les articles du panier depuis localStorage
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/articles/list");
        const data: Article[] = await response.json();
        setArticles(data);
      } catch (error) {
        console.error("Erreur lors du chargement des articles:", error);
      }
    };

    fetchArticles();

    // 🔹 Récupérer le panier depuis le localStorage
    const storedPanier = localStorage.getItem("panier");
    if (storedPanier) {
      setPanier(JSON.parse(storedPanier));
    }
  }, []);

  // 🔹 Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem("panier", JSON.stringify(panier));
  }, [panier]);

  const indexDepart: number = (page - 1) * articlesParPage;
  const articlesAffiches: Article[] = articles.slice(indexDepart, indexDepart + articlesParPage);

  // ✅ Ajouter au panier et sauvegarder dans localStorage
  const ajouterAuPanier = (article: Article) => {
    if (!panier.some((item) => item.id === article.id)) {
      setPanier([...panier, article]);
    }
  };

  // ✅ Retirer du panier et mettre à jour localStorage
  const retirerDuPanier = (id: number) => {
    setPanier(panier.filter((item) => item.id !== id));
  };

  // ✅ Vider le panier lors de la déconnexion
  const handleLogout = () => {
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
      localStorage.removeItem("panier"); // Supprime le panier
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex justify-between items-center shadow-md">
        <nav className="flex gap-6 text-lg">
          <Link href="/client" className="hover:underline">🏠 Accueil</Link>

          <Link href="/panier" className="hover:underline flex items-center">
            <FaShoppingCart className="mr-2" /> Panier ({panier.length})
          </Link>

          <Link href="#" className="hover:underline flex items-center">
            <FaPercentage className="mr-2" /> Remises
          </Link>
        </nav>

        <button onClick={handleLogout} className="bg-red-500 px-5 py-2 rounded-full flex items-center shadow-lg hover:bg-red-600">
          <FaSignOutAlt className="mr-2" /> Déconnexion
        </button>
      </header>

      {/* Body */}
      <main className="flex-grow p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {articlesAffiches.map((article) => (
          <div 
            key={article.id} 
            className="border p-4 rounded-lg shadow-lg bg-white transform hover:scale-105 transition duration-300 flex flex-col justify-between"
          >
            {/* Image bien centrée */}
            <div className="w-full h-96 flex items-center justify-center overflow-hidden rounded-md">
              <img src={article.imageUrl} alt={article.titre} className="w-full h-full object-cover" />
            </div>

            {/* Contenu */}
            <div className="flex flex-col flex-grow p-3">
              <h2 className="text-lg font-bold">{article.titre}</h2>

              {/* Description avec bouton "Voir plus" */}
              <div className="relative mt-2 text-sm text-gray-600 overflow-hidden">
                <p className="line-clamp-3">{article.description}</p>
                {article.description.length > 100 && (
                  <Link href={`/client/article/${article.id}`} className="text-blue-500 hover:underline">
                    Voir plus
                  </Link>
                )}
              </div>

              {/* Prix et remise */}
              <p className="text-blue-600 font-bold text-lg mt-2">{article.prix} €</p>
              {article.remise > 0 && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <FaPercentage className="mr-1" /> Remise : {article.remise}%
                </p>
              )}
            </div>

            {/* Boutons d'ajout/retrait */}
            <div className="mt-auto flex justify-between p-3">
              <button
                onClick={() => ajouterAuPanier(article)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 shadow-md"
              >
                <FaCheckCircle /> Ajouter
              </button>
              <button
                onClick={() => retirerDuPanier(article.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 shadow-md"
              >
                <FaTimesCircle /> Retirer
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Pagination */}
      <footer className="p-5 bg-gray-300 flex justify-center items-center gap-6 shadow-inner">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:bg-gray-400 hover:bg-blue-600 shadow-md"
        >
          ⬅️ Précédent
        </button>
        <span className="px-4 py-2 text-lg font-semibold">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={indexDepart + articlesParPage >= articles.length}
          className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:bg-gray-400 hover:bg-blue-600 shadow-md"
        >
          Suivant ➡️
        </button>
      </footer>
    </div>
  );
}
