"use client";

import { useState } from "react"; 
import { useRouter } from "next/navigation"; 
import Link from "next/link";

interface Article {
  id: number;
  titre: string;
  description: string;
  prix: number;
  remise?: number;
}

const articlesData: Article[] = [
  { id: 1, titre: "Article 1", description: "Description 1", prix: 100 },
  { id: 2, titre: "Article 2", description: "Description 2", prix: 200 },
  { id: 3, titre: "Article 3", description: "Description 3", prix: 150 },
  // Ajoutez d'autres articles ici
];

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>(articlesData);
  const router = useRouter();
  const [remiseValues, setRemiseValues] = useState<{ [key: number]: number }>({});

  const handleApplyRemise = (id: number) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === id
          ? { ...article, remise: remiseValues[id] || 0 }
          : article
      )
    );
  };

  const handleLogout = () => {
    alert("Vous avez été déconnecté !");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 p-4 text-white flex justify-between">
        <nav>
        <nav>
  <Link href="/admin" className="mr-4 hover:underline">Home</Link>
  <Link href="/admin/create-article" className="mr-4 hover:underline">Créer un article</Link>
  <Link href="/admin/statistics" className="mr-4 hover:underline">Voir les statistiques</Link>
  <Link href="/admin/achats" className="mr-4 hover:underline text-yellow-400 font-bold">Achats en attente</Link>
</nav>

        </nav>
        <button  onClick={handleLogout}  className="bg-red-500 px-4 py-2 rounded">Déconnexion</button>
      </header>

      {/* Body */}
      <main className="flex-grow p-6 grid grid-cols-3 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="border p-4 rounded shadow-lg">
            <h2 className="text-xl font-bold">{article.titre}</h2>
            <p className="text-gray-600">{article.description}</p>
            <p className="text-lg font-semibold">Prix: {article.prix}€</p>
            {article.remise && <p className="text-red-500">Remise: {article.remise}%</p>}
            <div className="mt-2 flex space-x-2">
              <input
                type="number"
                placeholder="Remise %"
                className="border px-2 py-1 rounded"
                value={remiseValues[article.id] || ""}
                onChange={(e) =>
                  setRemiseValues({ ...remiseValues, [article.id]: Number(e.target.value) })
                }
              />
              <button
                onClick={() => handleApplyRemise(article.id)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Faire une remise
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 p-4 text-center">
        <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Précédent</button>
        <button className="bg-blue-500 text-white px-3 py-1 rounded">Suivant</button>
      </footer>
    </div>
  );
}
