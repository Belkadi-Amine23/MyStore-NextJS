"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaSave,
  FaSpinner,
} from "react-icons/fa";

export default function ArticleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [article, setArticle] = useState({
    id: 0,
    titre: "",
    description: "",
    prix: 0,
    remise: 0,
    imageUrl: "",
    quantité: 0,
    famille: "",
  });
  const [formData, setFormData] = useState({ ...article });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Liste des familles pour le select
  const [families, setFamilies] = useState<string[]>([]);
  useEffect(() => {
    fetch(`/api/articles/families`)
      .then((res) => res.json())
      .then((data: string[]) => setFamilies(data))
      .catch((error) =>
        console.error("Erreur lors du chargement des familles:", error)
      );
  }, []);

  // Récupération des détails de l'article
  useEffect(() => {
    if (!id) return;
    fetch(`/api/articles/idEditDelete/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setArticle(data);
        setFormData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement de l'article:", error);
        setLoading(false);
      });
  }, [id]);

  // Gestion des changements dans les inputs et select
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Passage en mode édition
  const handleEditClick = () => {
    setEditing(true);
  };

  // État des modales et du message de succès
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Sauvegarder avec confirmation (via modal)
  const handleSaveClick = async () => {
    if (!formData || Object.keys(formData).length === 0) {
      console.error("formData est vide ou invalide :", formData);
      setSuccessMessage("Erreur : aucune donnée à sauvegarder");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return;
    }
    try {
      const response = await fetch(`/api/articles/idEditDelete/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'article");
      }
      const updated = await response.json();
      setArticle(updated);
      setFormData(updated);
      setEditing(false);
      setSuccessMessage("Article modifié avec succès !");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/admin");
      }, 3000);
    } catch (error) {
      console.error(error);
      setSuccessMessage("Erreur lors de la sauvegarde");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  // Supprimer avec confirmation (via modal)
  const handleDeleteClick = async () => {
    try {
      const response = await fetch(`/api/articles/idEditDelete/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }
      setSuccessMessage("Article supprimé avec succès !");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/admin");
      }, 3000);
    } catch (error) {
      console.error(error);
      setSuccessMessage("Erreur lors de la suppression de l'article");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {/* Bouton de retour */}
      <header className="mb-6">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center text-blue-600 hover:text-blue-800 font-semibold"
        >
          <FaArrowLeft className="mr-2" /> Retour à l'accueil admin
        </button>
      </header>

      {/* Loading spinner */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Détails de l'article</h1>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image */}
            <div className="md:w-1/2 flex justify-center items-center">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt={formData.titre}
                  className="w-full max-w-[550px] h-auto max-h-[550px] object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-200 rounded-lg">
                  <span className="text-gray-500">Pas d'image</span>
                </div>
              )}
            </div>
            {/* Informations */}
            <div className="md:w-1/2 space-y-4">
              <div>
                <label className="block font-semibold">Titre</label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full p-2 border rounded ${
                    editing ? "bg-white" : "bg-gray-100"
                  }`}
                />
              </div>
              <div>
                <label className="block font-semibold">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full p-2 border rounded ${
                    editing ? "bg-white" : "bg-gray-100"
                  }`}
                  rows={4}
                />
              </div>
              <div className="flex space-x-4">
                <div className="w-1/3">
                  <label className="block font-semibold">Prix (€)</label>
                  <input
                    type="number"
                    name="prix"
                    value={formData.prix}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full p-2 border rounded ${
                      editing ? "bg-white" : "bg-gray-100"
                    }`}
                  />
                </div>
                <div className="w-1/3">
                  <label className="block font-semibold">Quantité</label>
                  <input
                    type="number"
                    name="quantité"
                    value={formData.quantité}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full p-2 border rounded ${
                      editing ? "bg-white" : "bg-gray-100"
                    }`}
                  />
                </div>
                <div className="w-1/3">
                  <label className="block font-semibold">Remise (%)</label>
                  <input
                    type="number"
                    name="remise"
                    value={formData.remise}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full p-2 border rounded ${
                      editing ? "bg-white" : "bg-gray-100"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold">Famille</label>
                <select
                  name="famille"
                  value={formData.famille}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full p-2 border rounded ${
                    editing ? "bg-white" : "bg-gray-100"
                  }`}
                >
                  {families.map((famille) => (
                    <option key={famille} value={famille}>
                      {famille}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="mt-6 flex justify-end space-x-4">
            {editing ? (
              <button
                onClick={() => setShowSaveConfirm(true)}
                className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition shadow-lg"
              >
                <FaSave className="mr-2" /> Sauvegarder
              </button>
            ) : (
              <button
                onClick={handleEditClick}
                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition shadow-lg"
              >
                <FaEdit className="mr-2" /> Modifier
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition shadow-lg"
            >
              <FaTrash className="mr-2" /> Supprimer
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmation pour sauvegarder */}
      {showSaveConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-center text-green-600">
              Confirmer la sauvegarde
            </h2>
            <p className="mb-6 text-center">Confirmez-vous la sauvegarde des modifications ?</p>
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => setShowSaveConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded-full transition"
              >
                Non
              </button>
              <button
                onClick={() => {
                  setShowSaveConfirm(false);
                  handleSaveClick();
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-full transition"
              >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation pour suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-center text-red-600">
              Confirmer la suppression
            </h2>
            <p className="mb-6 text-center">Confirmez-vous la suppression de cet article ?</p>
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded-full transition"
              >
                Non
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleDeleteClick();
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-full transition"
              >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4 animate-fadeIn">
            <h2 className="text-3xl font-bold mb-4 text-center">Succès</h2>
            <p className="text-xl text-center mb-6">{successMessage}</p>
            <p className="text-center text-sm">Vous allez être redirigé vers l'administration...</p>
          </div>
        </div>
      )}
    </div>
  );
}
