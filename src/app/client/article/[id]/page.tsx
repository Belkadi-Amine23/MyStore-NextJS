"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Article {
  id: number;
  titre: string;
  description: string;
  prix: number;
  remise: number;
  imageUrl: string;
}

export default function ArticlePage() {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (!params?.id) return;

    async function fetchArticle() {
      try {
        const response = await fetch(`/api/articles/${params.id}`);
        if (!response.ok) throw new Error("Article introuvable");
        const data: Article = await response.json();
        setArticle(data);
      } catch (error) {
        console.error("Erreur lors du chargement de l'article", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [params?.id]);

  if (loading) return <div className="text-center text-gray-500 mt-10">Chargement...</div>;
  if (!article) return <div className="text-center text-red-500 mt-10">Article introuvable.</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full bg-white shadow-lg rounded-lg overflow-hidden grid grid-cols-2">
        {/* Partie gauche : Image en pleine hauteur */}
        <div className="h-full">
          <img src={article.imageUrl} alt={article.titre} className="w-full h-full object-cover" />
        </div>

        {/* Partie droite : Informations de l'article */}
        <div className="p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900">{article.titre}</h2>
          <p className="text-gray-700 mt-4">{article.description}</p>

          <div className="mt-6">
            <span className="text-xl font-semibold text-gray-800">
              Prix: <span className="text-green-600">{article.prix} €</span>
            </span>
            {article.remise > 0 && (
              <span className="ml-4 text-sm bg-red-500 text-white px-3 py-1 rounded-full">
                -{article.remise}%
              </span>
            )}
          </div>

          <button 
            onClick={() => router.push("/client")}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition"
          >
            Retour à l'Accueil
          </button>
        </div>
      </div>
    </div>
  );
}
