"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

interface Article {
  id: number;
  titre: string;
  quantité: number;
  prix: number;
}

interface Achat {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  totalMontant: number;
  articles: { article: Article; quantité: number }[];
}

export default function AchatsAdmin() {
  const [achats, setAchats] = useState<Achat[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/achat")
      .then((res) => res.json())
      .then(setAchats)
      .catch(console.error);
  }, []);

  // ✅ Fonction mise à jour pour valider ou refuser un achat
  const handleAchatAction = async (achatId: number, action: "valider" | "refuser") => {
    try {
      const res = await fetch("/api/achat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achatId, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");

      alert(data.message);
      // ✅ Recharger la liste des achats après modification
      setAchats((prevAchats) => prevAchats.filter((achat) => achat.id !== achatId));
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue");
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Bouton de retour en haut de page */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded shadow transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Retour
        </button>
      </div>
      
      <h1 className="text-2xl font-bold mb-4">Achats en attente</h1>
      <div className="grid grid-cols-1 gap-6">
        {achats.map((achat) => (
          <div key={achat.id} className="border p-4 rounded shadow-lg">
            <h2 className="text-xl font-bold">
              {achat.nom} {achat.prenom} - {achat.telephone}
            </h2>
            <p className="text-lg font-semibold">Total: {achat.totalMontant}€</p>
            <div className="mt-2">
              {achat.articles.map(({ article, quantité }) => (
                <p key={article.id} className="text-gray-700">
                  {article.titre} x{quantité} - {article.prix * quantité}€
                </p>
              ))}
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleAchatAction(achat.id, "valider")}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
              >
                Valider
              </button>
              <button
                onClick={() => handleAchatAction(achat.id, "refuser")}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Refuser
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
