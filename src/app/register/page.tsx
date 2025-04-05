"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

// Composant pour afficher des dessins symboliques liés à l'inscription
const RegistrationSymbols = () => (
  <>
    {/* Crayon symbolique en haut à gauche */}
    <svg
      className="absolute top-10 left-10 w-12 h-12 opacity-70 animate-pulse"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z" />
    </svg>

    {/* Certificat symbolique en bas à droite */}
    <svg
      className="absolute bottom-10 right-10 w-12 h-12 opacity-70 animate-pulse"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 15l-8-3.64V9.39l8 3.64 8-3.64v4.97L12 17z" />
    </svg>
  </>
);

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setError("Erreur lors de l'inscription !");
      setTimeout(() => {
        setError("");
      }, 2000);
    }
  };

  // Générer des particules animées pour un effet supplémentaire
  const renderParticles = () => {
    return [...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute bg-white rounded-full opacity-50 animate-spin-slow"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          animationDelay: `${Math.random() * 5}s`,
        }}
      />
    ));
  };

  return (
    <>
      {/* Styles personnalisés pour les animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
        }
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-green-400 to-green-600 relative overflow-hidden">
        {/* Particules animées */}
        {mounted && (
          <div className="absolute inset-0 pointer-events-none">
            {renderParticles()}
          </div>
        )}

        {/* Dessins symboliques liés à l'inscription */}
        {mounted && <RegistrationSymbols />}

        {/* Overlay du message de succès */}
        {success && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl animate-bounce">
              <h2 className="text-3xl font-bold text-green-700">
                Compte créé avec succès !
              </h2>
            </div>
          </div>
        )}

        {/* Overlay du message d'erreur */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl animate-bounce border-2 border-red-500">
              <h2 className="text-3xl font-bold text-red-600">{error}</h2>
            </div>
          </div>
        )}

        <div className="bg-gray-900 bg-opacity-80 shadow-2xl rounded-2xl p-10 max-w-md w-full relative z-20 transform transition-all duration-500 hover:scale-105 animate-fadeIn">
          <h2 className="text-3xl font-extrabold text-center text-white mb-8 animate-pulse">
            Créer un compte
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Nom */}
            <div
              className="relative animate-slideUp"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-300">
                <FiUser size={20} />
              </span>
              <input
                type="text"
                placeholder="Nom complet"
                className="w-full p-4 pl-10 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            {/* Champ Email */}
            <div
              className="relative animate-slideUp"
              style={{ animationDelay: "0.4s" }}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-300">
                <FiMail size={20} />
              </span>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-4 pl-10 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {/* Champ Mot de passe avec toggle */}
            <div
              className="relative animate-slideUp"
              style={{ animationDelay: "0.6s" }}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-300">
                <FiLock size={20} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="w-full p-4 pl-10 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-300 cursor-pointer"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-800 transition duration-300 transform hover:scale-105 active:scale-95 shadow-lg animate-pulse"
            >
              S'inscrire
            </button>
          </form>
          <p className="text-center text-gray-400 mt-6">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="text-green-300 hover:text-green-200 transition duration-300"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
