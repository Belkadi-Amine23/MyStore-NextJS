"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaShoppingCart, FaPercentage } from "react-icons/fa";

interface Article {
  id: number;
  titre: string;
  description: string;
  prix: string;
  remise: number;
  imageUrl: string;
}

export default function ArticleDetails() {
  const [article, setArticle] = useState<Article | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const articleId = searchParams.get("id");

  useEffect(() => {
    if (articleId) {
      const fetchArticle = async () => {
        try {
          const response = await fetch(`/api/articles/${articleId}`);
          const data: Article = await response.json();
          setArticle(data);
        } catch (error) {
          console.error("Erreur lors du chargement de l'article :", error);
        }
      };
      fetchArticle();
    }
  }, [articleId]);

  if (!article) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-600">
        Chargement de l'article...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Carte détaillée */}
      <div className="bg-white shadow-2xl rounded-lg p-6 max-w-4xl w-full flex flex-col md:flex-row items-center md:items-start">
        {/* Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={article.imageUrl}
            alt={article.titre}
            className="rounded-lg w-full h-80 object-cover shadow-lg"
          />
        </div>

        {/* Détails */}
        <div className="w-full md:w-1/2 p-6 flex flex-col">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{article.titre}</h1>
          <p className="text-gray-600 text-lg mb-4">{article.description}</p>

          {/* Prix et remise */}
          <div className="flex items-center mb-4">
            <span className="text-2xl font-semibold text-blue-600">{article.prix} €</span>
            {article.remise > 0 && (
              <span className="ml-3 text-sm text-red-500 flex items-center">
                <FaPercentage className="mr-1" /> -{article.remise}%
              </span>
            )}
          </div>

          {/* Bouton Ajouter au panier */}
          <button
            className="bg-green-500 text-white px-5 py-3 rounded-lg text-lg flex items-center justify-center gap-2 hover:bg-green-600 shadow-md transition"
          >
            <FaShoppingCart /> Ajouter au panier
          </button>
        </div>
      </div>

      {/* Bouton Retour */}
      <button
        onClick={() => router.push("/client")}
        className="mt-8 bg-gray-800 text-white px-6 py-3 rounded-full text-lg flex items-center gap-2 hover:bg-gray-900 shadow-md transition"
      >
        <FaArrowLeft /> Retour à l'accueil
      </button>
    </div>
  );
}
