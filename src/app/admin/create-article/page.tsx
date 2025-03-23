"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaUpload, FaCheckCircle, FaArrowLeft } from "react-icons/fa";

const CreateArticle = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !price || !quantity || !category || !image) {
      setMessage("Veuillez remplir tous les champs !");
      setSuccess(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("category", category);
    formData.append("image", image);

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Article créé avec succès !");
        setSuccess(true);

        setTitle("");
        setDescription("");
        setPrice("");
        setQuantity("");
        setCategory("");
        setImage(null);
        setPreview(null);

        // Effacer le message après 3 secondes
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ Erreur : ${data.message}`);
        setSuccess(false);
      }
    } catch (error) {
      setMessage("❌ Une erreur est survenue !");
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 relative">
      {/* Bouton de retour vers /admin en haut à droite */}
      <Link
        href="/admin"
        className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-md hover:shadow-xl transition-all"
      >
        <FaArrowLeft />
        <span>Retour</span>
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Créer un Article</h2>

        {/* Message de succès ou d'erreur */}
        {message && (
          <div
            className={`flex items-center gap-2 p-4 mb-4 rounded-lg text-white text-sm font-semibold transition-opacity duration-500 ${
              success ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {success ? <FaCheckCircle className="text-lg" /> : "❌"}
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
          />
          {/* Champ de description agrandi */}
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 h-40" // Hauteur augmentée
          />
          <input
            type="number"
            placeholder="Prix"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
          />
          <input
            type="number"
            placeholder="Quantité"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
          >
            <option value="">Sélectionner une famille</option>
            <option value="Electronique">Électronique</option>
            <option value="Vêtements">Vêtements</option>
            <option value="Accessoires">Accessoires</option>
          </select>
          <label className="flex flex-col items-center justify-center gap-2 border-dashed border-2 border-gray-300 p-4 rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <FaUpload className="text-gray-600 text-lg" />
            <span className="text-gray-600">Uploader une image</span>
          </label>
          {preview && <img src={preview} alt="Aperçu" className="w-full h-auto rounded-lg border mt-2" />}
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all">
            Créer l'article
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateArticle;
