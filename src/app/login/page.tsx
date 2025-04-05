"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

// Composant affichant des dessins symboliques liés à la connexion
const LoginSymbols = () => (
  <>
    {/* Cadenas symbolique en haut à gauche */}
    <svg
      className="absolute top-8 left-8 w-12 h-12 opacity-70 animate-bounce"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.1046 0 2-.8954 2-2V7a2 2 0 10-4 0v2c0 1.1046.8954 2 2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11V7a7 7 0 0114 0v4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" />
    </svg>

    {/* Clé symbolique en bas à droite */}
    <svg
      className="absolute bottom-8 right-8 w-12 h-12 opacity-70 animate-pulse"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-4.553a2 2 0 10-2.828-2.828L12.172 7.172a4 4 0 00-1.172 2.828v.828M7 7h.01M6 12h12" />
    </svg>
  </>
);

export default function LoginPage() {
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

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      const role = data.role;

      setSuccess(true);
      setTimeout(() => {
        if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/client");
        }
      }, 2000);
    } else {
      setError("Identifiants incorrects !");
      setTimeout(() => {
        setError("");
      }, 2000);
    }
  };

  // Fonction pour générer des particules animées pour un effet spatial
  const renderParticles = () => {
    return [...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute bg-white rounded-full opacity-50 animate-twinkle"
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
        @keyframes twinkle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-teal-900 to-black relative overflow-hidden">
        {/* Particules animées */}
        {mounted && (
          <div className="absolute inset-0 pointer-events-none">
            {renderParticles()}
          </div>
        )}

        {/* Dessins symboliques liés à la connexion */}
        {mounted && <LoginSymbols />}

        {/* Overlay du message de succès */}
        {success && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl animate-bounce">
              <h2 className="text-3xl font-bold text-blue-600">
                Connexion réussie !
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
            Connexion
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Email */}
            <div className="relative animate-slideUp" style={{ animationDelay: "0.2s" }}>
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-400">
                <FiMail size={20} />
              </span>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-4 pl-10 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {/* Champ Mot de passe avec toggle */}
            <div className="relative animate-slideUp" style={{ animationDelay: "0.4s" }}>
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-400">
                <FiLock size={20} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="w-full p-4 pl-10 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-teal-400 cursor-pointer"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-teal-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-teal-700 transition duration-300 transform hover:scale-105 active:scale-95 shadow-lg animate-pulse"
            >
              Se connecter
            </button>
          </form>
          <p className="text-center text-gray-400 mt-6">
            Pas encore inscrit ?{" "}
            <Link
              href="/register"
              className="text-teal-400 hover:text-teal-300 transition duration-300"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
