"use client";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  titre: string;
  imageUrl: string;
  prix: number;
  quantite: number;
}

export default function PanierPage() {
  const [cart, setCart] = useState<Product[]>([]);

  // Récupérer les articles du localStorage au chargement de la page
  useEffect(() => {
    const storedCart = localStorage.getItem("panier");
    console.log("Données récupérées du localStorage:", storedCart);

    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          const validCart = parsedCart.map((item) => ({
            ...item,
            quantite: item.quantite ?? 1,
          }));
          setCart(validCart);
        }
      } catch (error) {
        console.error("Erreur de parsing du localStorage:", error);
      }
    }
  }, []);

  // Mettre à jour localStorage quand le panier change
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("panier", JSON.stringify(cart));
    }
  }, [cart]);

  const updateQuantity = (index: number, change: number) => {
    setCart((prevCart) =>
      prevCart.map((item, i) =>
        i === index ? { ...item, quantite: Math.max(1, item.quantite + change) } : item
      )
    );
  };

  const removeItem = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.prix * item.quantite, 0);

  // États pour les modales
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  // Stocke l'ID formaté de la commande (bon d'achat)
  const [purchaseId, setPurchaseId] = useState("");

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    wilaya: "",
    ville: "",
    telephone: "",
  });

  const [errors, setErrors] = useState({
    nom: false,
    prenom: false,
    wilaya: false,
    ville: false,
    telephone: false,
  });

  // Ouvrir la modale de saisie des infos
  const openModal = () => setShowModal(true);

  // Fermer la modale et réinitialiser le formulaire
  const closeModal = () => {
    setShowModal(false);
    setFormData({ nom: "", prenom: "", wilaya: "", ville: "", telephone: "" });
    setErrors({ nom: false, prenom: false, wilaya: false, ville: false, telephone: false });
  };

  // Gérer le changement des champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Valider le formulaire avant de passer à la confirmation
  const handleValidate = () => {
    const newErrors = {
      nom: formData.nom.trim() === "",
      prenom: formData.prenom.trim() === "",
      wilaya: formData.wilaya.trim() === "",
      ville: formData.ville.trim() === "",
      telephone: formData.telephone.trim() === "",
    };
    setErrors(newErrors);
    if (!Object.values(newErrors).includes(true)) {
      setShowConfirm(true); // Ouvrir la boîte de confirmation
    }
  };

  // Confirmer la commande et insérer les données dans la base
  const handleConfirmOrder = async () => {
    try {
      if (!cart.length) return alert("Votre panier est vide !");
      const orderData = {
        ...formData,
        totalMontant: totalAmount.toFixed(2),
        articles: cart.map((item) => ({
          id: item.id,
          quantité: item.quantite,
          prix: item.prix,
        })),
      };
      const response = await fetch("/api/achat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      // Lire la réponse en texte et la parser si non vide
      const result = await response.json();
      if (response.ok) {
        console.log("Commande enregistrée :", result);
        // Générer la référence du bon d'achat à partir de result.id et de l'année actuelle
        const yearSuffix = new Date().getFullYear().toString().slice(-2);
        const id = result.id ?? 0;
        const formattedId = `${String(id).padStart(7, "0")}/${yearSuffix}`;
        setPurchaseId(formattedId);
        // Fermer les modales et afficher la modale pour demander le bon d'achat
        setShowConfirm(false);
        setShowModal(false);
        setShowSuccess(true);
  // Afficher le message de succès 2 secondes avant d'afficher la modale de choix
  setTimeout(() => {
    setShowSuccess(false);
    setShowReceiptModal(true);
  }, 2000);
      } else {
        alert(`Erreur : ${result.error}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'insertion de la commande :", error);
      alert("Une erreur est survenue lors du traitement de votre commande.");
    }
  };

  // Fonction pour finaliser la commande (vider le panier et rediriger)
  const finalizeOrder = () => {
    sessionStorage.setItem("clearCart", "true");
    setTimeout(() => {
      setShowTicketModal(false); // Remplacer setShowPurchaseReceipt par setShowTicketModal
      window.location.href = "/client";
    }, 3000);
  };
  

  // Fonction pour lancer l'impression ou la sauvegarde en PDF
  const printVoucher = () => {
    window.print();
    // Après impression, finaliser la commande
    finalizeOrder();
  };

  // ➤ Vider le panier après redirection si nécessaire
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("clearCart") === "true") {
      localStorage.removeItem("panier");
      sessionStorage.removeItem("clearCart");
      setCart([]);
    }
  }, []);


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">🛒 Mon Panier</h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-500">Votre panier est vide.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-6">
          <table className="min-w-full w-full text-center border-collapse">
            <thead>
              <tr className="bg-blue-700 text-white text-lg">
                <th className="p-4">Image</th>
                <th className="p-4">Article</th>
                <th className="p-4">Prix</th>
                <th className="p-4">Quantité</th>
                <th className="p-4">Total</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr key={`${item.id}-${index}`} className="border-b text-gray-700">
                  <td className="p-4">
                    <img src={item.imageUrl} alt={item.titre} className="w-16 h-16 object-cover rounded-md" />
                  </td>
                  <td className="p-4 font-semibold">{item.titre}</td>
                  <td className="p-4 text-blue-600">{item.prix} €</td>
                  <td className="p-4">
                    <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => updateQuantity(index, -1)}>
                      -
                    </button>
                    <span className="mx-2 text-lg">{item.quantite}</span>
                    <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => updateQuantity(index, 1)}>
                      +
                    </button>
                  </td>
                  <td className="p-4 font-semibold text-green-600">{(item.prix * item.quantite).toFixed(2)} €</td>
                  <td className="p-4">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded" onClick={() => removeItem(index)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Montant total et boutons */}
      {cart.length > 0 && (
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Montant total : <span className="text-green-600">{totalAmount.toFixed(2)} €</span>
          </h2>
          <div className="mt-4 md:mt-0 space-x-4">
            <button onClick={() => (window.location.href = "/client")} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-lg transition">
              ⬅ Retour à l'accueil
            </button>
            <button onClick={openModal} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg transition">
              🛍️ Acheter
            </button>
          </div>
        </div>
      )}

      {/* MODALE DE SAISIE DES INFORMATIONS */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">📝 Informations de livraison</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="nom"
                placeholder="Nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.nom ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.nom && <p className="text-red-500 text-sm">Ce champ est obligatoire</p>}
              <input
                type="text"
                name="prenom"
                placeholder="Prénom"
                value={formData.prenom}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.prenom ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.prenom && <p className="text-red-500 text-sm">Ce champ est obligatoire</p>}
              <input
                type="text"
                name="wilaya"
                placeholder="Wilaya"
                value={formData.wilaya}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.wilaya ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.wilaya && <p className="text-red-500 text-sm">Ce champ est obligatoire</p>}
              <input
                type="text"
                name="ville"
                placeholder="Ville"
                value={formData.ville}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.ville ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.ville && <p className="text-red-500 text-sm">Ce champ est obligatoire</p>}
              <input
                type="tel"
                name="telephone"
                placeholder="Numéro de téléphone"
                value={formData.telephone}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.telephone ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.telephone && <p className="text-red-500 text-sm">Ce champ est obligatoire</p>}
            </div>
            <p className="text-xl font-bold text-gray-800 text-center mt-4">
              💰 Montant total : <span className="text-green-600">{totalAmount.toFixed(2)} €</span>
            </p>
            <div className="flex justify-between mt-6">
              <button onClick={closeModal} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                ❌ Annuler
              </button>
              <button onClick={handleValidate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                ✅ Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DE CONFIRMATION */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-80 p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800">
              Voulez-vous vraiment confirmer cette commande ?
            </h2>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                ❌ Non
              </button>
              <button onClick={handleConfirmOrder} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                ✅ Oui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE pour demander au client s'il veut un bon d'achat */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🛍️ Voulez-vous prendre votre bon d'achat ?</h2>
            <div className="flex justify-center gap-4">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                onClick={() => {
                  setShowReceiptModal(false);
                  setShowTicketModal(true);
                }}
              >
                Oui
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                onClick={() => {
                  setShowReceiptModal(false);
                  localStorage.removeItem("panier"); // Supprime le panier
                  window.location.href = "/client";
                }}
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE du bon d'achat */}
{showTicketModal && purchaseId !== "" && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-[400px] p-6 text-center">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🎟️ Bon d'achat</h2>
      <p className="text-gray-700 mt-4">
        <strong>Référence :</strong> {purchaseId}
      </p>
      <p className="text-gray-700">
        <strong>Nom :</strong> {formData.nom} {formData.prenom}
      </p>
      <p className="text-gray-700">
        <strong>Adresse :</strong> {formData.ville}, {formData.wilaya}
      </p>
      <p className="text-gray-700">
        <strong>Téléphone :</strong> {formData.telephone}
      </p>
      <hr className="my-4" />
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Article</th>
            <th className="p-2">Qté</th>
            <th className="p-2">Prix</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{item.titre}</td>
              <td className="p-2">{item.quantite}</td>
              <td className="p-2">{(item.prix * item.quantite).toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="text-xl font-semibold text-green-600 mt-4">
        Total : {totalAmount.toFixed(2)} €
      </h3>
      <p className="text-gray-600 italic text-center mt-4">
        Merci pour votre confiance !
      </p>
      {/* Boutons masqués lors de l'impression */}
      <div className="flex flex-col gap-4 mt-6 no-print">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          onClick={() => {
            window.print();
            finalizeOrder();
          }}
        >
          Imprimer / Sauvegarder
        </button>
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          onClick={finalizeOrder}
        >
          Fermer
        </button>
      </div>
    </div>
    
  </div>
  
)}


      {/* MESSAGE DE SUCCÈS */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-green-500 text-white text-lg font-bold p-6 rounded-lg shadow-lg">
            🎉 Commande confirmée avec succès !
          </div>
        </div>
      )}

<style jsx>{`
  @media print {
    .no-print {
      display: none;
    }
  }
`}</style>
    </div>
    
  );
}
function setShowPurchaseReceipt(arg0: boolean) {
  throw new Error("Function not implemented.");
}

