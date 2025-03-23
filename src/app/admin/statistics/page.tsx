"use client";

import { useEffect, useState, JSX } from "react";
import Link from "next/link";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  FaArrowLeft,
  FaHome,
  FaChartPie,
  FaChartBar,
  FaListOl,
  FaClipboardList,
  FaCalendarAlt,
  FaUserAlt,
} from "react-icons/fa";

// Enregistrement de Chart.js et du plugin pour les labels
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  ChartDataLabels
);

interface StatisticsData {
  totalSales: number;
  totalArticles: number;
  totalAchats: number;
  totalUsers: number;
  totalFamilies: number;
  familyList: { famille: string }[];
  averageDailySales: number;
  salesByFamily: { [family: string]: number };
  monthlySales: { month: string; sales: number }[];
  weeklySales: { week: string; sales: number }[];
  dailySales: { date: string; sales: number }[];
  yearlySales: { year: string; sales: number }[];
  topSellingArticles: { titre: string; quantity: number }[];
  leastSellingArticles: { titre: string; quantity: number }[];
  lowStockArticles: { titre: string; quantité: number }[];
  sufficientStockArticles: { titre: string; quantité: number }[];
  discountedArticles: { titre: string; quantité: number }[];
  validatedPurchases: { 
    totalMontant: number; 
    createdAt: string; 
    nom: string; 
    prenom: string; 
    telephone: string;
  }[];
  usersDetails: { name: string; role: string }[];
  clients: { telephone: string; _min: { nom: string; prenom: string } }[];
  salesToday: number;
}

type StatTab =
  | "overview"
  | "articlesDetails"
  | "salesByFamily"
  | "timeSales"
  | "topArticles"
  | "clients";

type TimeFilter = "yearly" | "monthly" | "weekly" | "daily";

export default function AdvancedStatisticsPage() {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<StatTab>("overview");
  const [detailModal, setDetailModal] = useState<{ title: string; content: JSX.Element } | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("monthly");
  // État de pagination pour les modales affichant des listes
  const [modalPage, setModalPage] = useState<number>(1);
  // États pour la rubrique Clients (filtrage et tri)
  const [clientSearch, setClientSearch] = useState<string>("");
  const [clientSortColumn, setClientSortColumn] = useState<"nom" | "date">("nom");
  const [clientSortOrder, setClientSortOrder] = useState<"asc" | "desc">("asc");

  // Réinitialiser la page de la modal à chaque changement de modal
  useEffect(() => {
    setModalPage(1);
  }, [detailModal]);

  useEffect(() => {
    fetch("/api/statistics")
      .then((res) => res.json())
      .then((data: StatisticsData) => {
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des statistiques:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="text-6xl animate-spin text-blue-600">⏳</div>
      </div>
    );
  }
  if (!stats) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-100 to-purple-100">
        <p className="text-xl text-gray-700">Aucune donnée disponible</p>
      </div>
    );
  }

  // Préparation du camembert avec pourcentage
  const totalSalesByFamily = Object.values(stats.salesByFamily).reduce((a, b) => a + b, 0);
  const pieData = {
    labels: Object.keys(stats.salesByFamily),
    datasets: [
      {
        data: Object.values(stats.salesByFamily),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#8E44AD",
          "#27AE60",
          "#E74C3C",
          "#F39C12",
          "#2ECC71",
        ],
      },
    ],
  };
  const pieOptions = {
    plugins: {
      datalabels: {
        color: "#fff",
        formatter: (value: number) => {
          const percentage = ((value / totalSalesByFamily) * 100).toFixed(1);
          return percentage + "%";
        },
        font: { weight: "bold" as const },
      },
      legend: { display: true, position: "bottom" as const },
    },
    maintainAspectRatio: false,
  };

  // Graphique temporel
  let timeLabels: string[] = [];
  let timeData: number[] = [];
  if (timeFilter === "yearly") {
    timeLabels = stats.yearlySales.map((item) => item.year);
    timeData = stats.yearlySales.map((item) => item.sales);
  } else if (timeFilter === "monthly") {
    timeLabels = stats.monthlySales.map((item) => item.month);
    timeData = stats.monthlySales.map((item) => item.sales);
  } else if (timeFilter === "weekly") {
    timeLabels = stats.weeklySales.map((item) => item.week);
    timeData = stats.weeklySales.map((item) => item.sales);
  } else if (timeFilter === "daily") {
    timeLabels = stats.dailySales.map((item) => item.date);
    timeData = stats.dailySales.map((item) => item.sales);
  }
  const timeBarData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Ventes",
        data: timeData,
        backgroundColor: "#36A2EB",
      },
    ],
  };

  // Graphique Top Articles (amélioré)
  const lineData = {
    labels: stats.topSellingArticles.map((item) => item.titre),
    datasets: [
      {
        label: "Quantité vendue",
        data: stats.topSellingArticles.map((item) => item.quantity),
        borderColor: "#FF6384",
        backgroundColor: "rgba(255,99,132,0.2)",
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Fonction pour ouvrir et fermer les modales de détails
  const openModal = (title: string, content: JSX.Element) => {
    setDetailModal({ title, content });
  };
  const closeModal = () => setDetailModal(null);

  // Fonction utilitaire pour paginer un tableau (5 éléments par page)
  const paginate = (data: any[], pageSize: number, pageNumber: number) => {
    return data.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  };

  // Filtrer et trier les achats clients
  const filterAndSortPurchases = () => {
    let filtered = stats.validatedPurchases.filter((purchase) =>
      purchase.nom.toLowerCase().includes(clientSearch.toLowerCase()) ||
      purchase.prenom.toLowerCase().includes(clientSearch.toLowerCase()) ||
      purchase.telephone.includes(clientSearch)
    );
    if (clientSortColumn === "nom") {
      filtered = filtered.sort((a, b) => {
        const nameA = a.nom.toLowerCase();
        const nameB = b.nom.toLowerCase();
        if (nameA < nameB) return clientSortOrder === "asc" ? -1 : 1;
        if (nameA > nameB) return clientSortOrder === "asc" ? 1 : -1;
        return 0;
      });
    } else if (clientSortColumn === "date") {
      filtered = filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return clientSortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    }
    return filtered;
  };


  // Vue d'ensemble : 9 rubriques interactives
  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Total des Ventes */}
      <div
        onClick={() =>
          openModal("Détails des Achats Validés", (
            <div>
              <p className="mb-2">
                Total des ventes : <span className="font-bold">{stats.totalSales}€</span>
              </p>
              <p className="mb-2">
                Nombre d'achats validés : <span className="font-bold">{stats.totalAchats}</span>
              </p>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">Date</th>
                    <th className="border p-2">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(stats.validatedPurchases, 5, 1).map((purchase, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{new Date(purchase.createdAt).toLocaleDateString()}</td>
                      <td className="border p-2">{purchase.totalMontant}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        }
        className="cursor-pointer bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1 hover:shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-gray-700">Ventes Validées</h2>
        <p className="text-4xl font-bold text-blue-600">{stats.totalSales}€</p>
        <p className="text-sm text-gray-500 mt-2 underline">Voir plus</p>
      </div>
      {/* 2. Articles en Stock */}
      <div
        onClick={() =>
          openModal("Détails Articles en Stock", (
            <div>
              <p className="mb-2">
                Total articles en stock : <span className="font-bold">{stats.totalArticles}</span>
              </p>
              <div className="mb-2">
                <h3 className="font-semibold">Faible Stock :</h3>
                <ul className="list-disc ml-4">
                  {stats.lowStockArticles.map((art, i) => (
                    <li key={i}>{art.titre} - {art.quantité}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Stock Suffisant :</h3>
                <ul className="list-disc ml-4">
                  {stats.sufficientStockArticles.map((art, i) => (
                    <li key={i}>{art.titre} - {art.quantité}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        }
        className="cursor-pointer bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1 hover:shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-gray-700">Articles en Stock</h2>
        <p className="text-4xl font-bold text-green-600">{stats.totalArticles}</p>
        <p className="text-sm text-gray-500 mt-2 underline">Voir plus</p>
      </div>
      {/* 3. Nombre de Familles */}
      <div
        onClick={() =>
          openModal("Liste des Familles", (
            <div>
              <p className="mb-2">
                Nombre total de familles : <span className="font-bold">{stats.totalFamilies}</span>
              </p>
              {renderClientsModalContent()}
            </div>
          ))
        }
        className="cursor-pointer bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1 hover:shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-gray-700">Familles de Produits</h2>
        <p className="text-4xl font-bold text-indigo-600">{stats.totalFamilies}</p>
        <p className="text-sm text-gray-500 mt-2 underline">Voir toutes</p>
      </div>
      {/* 4. Total des Utilisateurs */}
      <div
        onClick={() =>
          openModal("Détails Utilisateurs", (
            <div>
              <p className="mb-2">
                Nombre total d'utilisateurs : <span className="font-bold">{stats.totalUsers}</span>
              </p>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">Nom</th>
                    <th className="border p-2">Rôle</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.usersDetails.map((user, i) => (
                    <tr key={i}>
                      <td className="border p-2">{user.name}</td>
                      <td className="border p-2">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        }
        className="cursor-pointer bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1 hover:shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-gray-700">Utilisateurs</h2>
        <p className="text-4xl font-bold text-yellow-600">{stats.totalUsers}</p>
        <p className="text-sm text-gray-500 mt-2 underline">Voir plus</p>
      </div>
      {/* 5. Moyenne des Ventes Quotidiennes */}
      <div
        onClick={() =>
          openModal("Détails Ventes Quotidiennes", (
            <div>
              <p className="mb-2">
                Moyenne quotidienne : <span className="font-bold">{stats.averageDailySales.toFixed(2)}€</span>
              </p>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">Date</th>
                    <th className="border p-2">Ventes</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(stats.dailySales, 5, 1).map((sale, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{sale.date}</td>
                      <td className="border p-2">{sale.sales}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        }
        className="cursor-pointer bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1 hover:shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-gray-700">Ventes Quotidiennes Moy.</h2>
        <p className="text-4xl font-bold text-red-600">{stats.averageDailySales.toFixed(2)}€</p>
        <p className="text-sm text-gray-500 mt-2 underline">Voir plus</p>
      </div>
      {/* 6. Total Achats Réalisés */}
      <div
        onClick={() =>
          openModal("Détails Achats Réalisés", (
            <div>
              <p className="mb-2">
                Nombre d'achats validés : <span className="font-bold">{stats.totalAchats}</span>
              </p>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">Date</th>
                    <th className="border p-2">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(stats.validatedPurchases, 5, 1).map((purchase, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{new Date(purchase.createdAt).toLocaleDateString()}</td>
                      <td className="border p-2">{purchase.totalMontant}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        }
        className="cursor-pointer bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1 hover:shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-gray-700">Achats Validés</h2>
        <p className="text-4xl font-bold text-purple-600">{stats.totalAchats}</p>
        <p className="text-sm text-gray-500 mt-2 underline">Voir plus</p>
      </div>
      {/* 7. Ventes par Famille (camembert) */}
      <div
        onClick={() =>
          openModal("Détails Ventes par Famille", (
            <div>
              <p className="mb-2">
                Total ventes par famille : <span className="font-bold">{totalSalesByFamily}€</span>
              </p>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">Famille</th>
                    <th className="border p-2">Ventes</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.salesByFamily).slice(0, 5).map(([fam, ventes], idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{fam}</td>
                      <td className="border p-2">{ventes}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        }
        className="cursor-pointer bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1 hover:shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-gray-700">Ventes par Famille</h2>
        <div className="h-40 relative">
          <Pie data={pieData} options={pieOptions} />
        </div>
        <p className="text-sm text-gray-500 mt-2 underline">Voir plus</p>
      </div>
      {/* 8. Ventes Temporelles (Filtrable) */}
      <div
        onClick={() =>
          openModal("Détails Ventes Temporelles", (
            <div>
              <p className="mb-2">Détails des ventes selon différents intervalles.</p>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">Intervalle</th>
                    <th className="border p-2">Ventes</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(stats.monthlySales, 5, 1).map((item, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{item.month}</td>
                      <td className="border p-2">{item.sales}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        }
        className="cursor-pointer bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1 hover:shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-gray-700">Ventes Temporelles</h2>
        <div className="h-40">
          <Bar
            data={timeBarData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "top" } },
            }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2 underline">Voir plus</p>
      </div>
      {/* 9. Top Articles */}
      <div
        onClick={() =>
          openModal("Détails Top Articles", (
            <div>
              <p className="mb-2">Top articles vendus :</p>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">Article</th>
                    <th className="border p-2">Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topSellingArticles.map((art, i) => (
                    <tr key={i}>
                      <td className="border p-2">{art.titre}</td>
                      <td className="border p-2">{art.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        }
        className="cursor-pointer bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1 hover:shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-gray-700">Top Articles Vendus</h2>
        <div className="h-40">
          <Line
            data={lineData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "top" } },
              scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2 underline">Voir plus</p>
      </div>
      {/* Nouvelle rubrique "Clients" */}
      <div
        onClick={() =>
          openModal("Détails Clients", renderClientsModalContent())
        }
        className="cursor-pointer bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1 hover:shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-gray-700">Clients</h2>
        <p className="text-4xl font-bold text-pink-600">{stats.clients.length}</p>
        <p className="text-sm text-gray-500 mt-2 underline">Voir détails</p>
      </div>
    </div>
  );

  // Modal pour la rubrique Clients (tableau avec filtrage, tri, pagination et un camembert)
  const renderClientsModalContent = () => {
    const pageSize = 5;
    const filtered = stats.validatedPurchases.filter((purchase) =>
      purchase.nom.toLowerCase().includes(clientSearch.toLowerCase()) ||
      purchase.prenom.toLowerCase().includes(clientSearch.toLowerCase()) ||
      purchase.telephone.includes(clientSearch)
    );
    // Tri basique selon la colonne sélectionnée
    const sorted = [...filtered].sort((a, b) => {
      if (clientSortColumn === "nom") {
        const nameA = a.nom.toLowerCase();
        const nameB = b.nom.toLowerCase();
        return clientSortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else { // tri par date
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return clientSortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });
    const totalPages = Math.ceil(sorted.length / pageSize);
    const paginated = paginate(sorted, pageSize, modalPage);

    // Préparer des données pour le camembert des clients (nombre d'achats par client)
    const clientCounts: { [key: string]: number } = {};
    sorted.forEach((p) => {
      const key = `${p.prenom} ${p.nom}`;
      clientCounts[key] = (clientCounts[key] || 0) + 1;
    });
    const clientPieData = {
      labels: Object.keys(clientCounts),
      datasets: [
        {
          data: Object.values(clientCounts),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#8E44AD",
            "#27AE60",
            "#E74C3C",
            "#F39C12",
            "#2ECC71",
          ],
        },
      ],
    };

    return (
      <>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher par nom ou téléphone"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            className="px-4 py-2 border rounded w-full"
          />
          <div className="mt-2 flex gap-4">
            <button
              onClick={() => {
                setClientSortColumn("nom");
                setClientSortOrder(clientSortOrder === "asc" ? "desc" : "asc");
              }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Trier par Nom
            </button>
            <button
              onClick={() => {
                setClientSortColumn("date");
                setClientSortOrder(clientSortOrder === "asc" ? "desc" : "asc");
              }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Trier par Date
            </button>
          </div>
        </div>
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Nom</th>
              <th className="border p-2">Prénom</th>
              <th className="border p-2">Téléphone</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Montant</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((purchase, idx) => (
              <tr key={idx}>
                <td className="border p-2">{purchase.nom}</td>
                <td className="border p-2">{purchase.prenom}</td>
                <td className="border p-2">{purchase.telephone}</td>
                <td className="border p-2">{new Date(purchase.createdAt).toLocaleDateString()}</td>
                <td className="border p-2">{purchase.totalMontant}€</td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="mt-4 flex justify-between">
            <button
              disabled={modalPage === 1}
              onClick={() => setModalPage(modalPage - 1)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-gray-600">
              Page {modalPage} sur {totalPages}
            </span>
            <button
              disabled={modalPage === totalPages}
              onClick={() => setModalPage(modalPage + 1)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Répartition des Achats par Client</h3>
          <div className="relative h-64">
            <Pie data={clientPieData} options={pieOptions} />
          </div>
        </div>
      </>
    );
  };

  // Détails Articles enrichis (peut être adapté)
  const renderArticlesDetails = () => (
    <div className="space-y-6">
      {renderOverview()}
      <div className="bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1">
        <h2 className="text-xl font-semibold mb-4">Détails Articles</h2>
        <p className="mb-2 font-semibold">Faible Stock :</p>
        {stats.lowStockArticles.length > 0 ? (
          <ul className="list-disc ml-4">
            {stats.lowStockArticles.map((art, i) => (
              <li key={i}>{art.titre} - {art.quantité}</li>
            ))}
          </ul>
        ) : (
          <p>Aucun article en faible stock.</p>
        )}
        <p className="mt-4 mb-2 font-semibold">Articles en Remise :</p>
        {stats.discountedArticles.length > 0 ? (
          <ul className="list-disc ml-4">
            {stats.discountedArticles.map((art, i) => (
              <li key={i}>{art.titre} - {art.quantité}</li>
            ))}
          </ul>
        ) : (
          <p>Aucun article en remise.</p>
        )}
        <p className="mt-4 mb-2 font-semibold">Articles les Moins Vendus :</p>
        {stats.leastSellingArticles.length > 0 ? (
          <ul className="list-disc ml-4">
            {stats.leastSellingArticles.map((art, i) => (
              <li key={i}>{art.titre} - {art.quantity}</li>
            ))}
          </ul>
        ) : (
          <p>Aucun article trouvé.</p>
        )}
      </div>
    </div>
  );

  // Contenu dynamique selon l'onglet sélectionné
  const renderContent = () => {
    switch (selectedTab) {
      case "overview":
        return renderOverview();
      case "articlesDetails":
        return renderArticlesDetails();
      case "salesByFamily":
        return (
          <div className="bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1" style={{ height: "300px" }}>
            <h2 className="text-xl font-semibold mb-4">Ventes par Famille</h2>
            <div className="relative h-full">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        );
      case "timeSales":
        return (
          <div className="bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1">
            <h2 className="text-xl font-semibold mb-4">
              Ventes {timeFilter === "yearly" ? "Annuelles" : timeFilter === "monthly" ? "Mensuelles" : timeFilter === "weekly" ? "Hebdomadaires" : "Quotidiennes"}
            </h2>
            <div className="mb-4 flex space-x-4">
              {(["yearly", "monthly", "weekly", "daily"] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded transition ${
                    timeFilter === filter ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-blue-100"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
            <div className="h-64">
              <Bar
                data={timeBarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "top" } },
                }}
              />
            </div>
          </div>
        );
      case "topArticles":
        return (
          <div className="bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1">
            <h2 className="text-xl font-semibold mb-4">Top Articles Vendus</h2>
            <div className="h-64">
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "top" } },
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                }}
              />
            </div>
          </div>
        );
      case "clients":
        return (
          <div className="bg-white p-6 rounded-lg shadow-xl transition transform hover:-translate-y-1">
            <h2 className="text-xl font-semibold mb-4">Statistiques Clients</h2>
            {renderClientsModalContent()}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* En-tête */}
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-gray-800">Statistiques du Magasin</h1>
        <Link
          href="/admin"
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-shadow shadow-2xl"
        >
          <FaArrowLeft className="mr-2 text-2xl" /> Retour
        </Link>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Menu latéral */}
        <aside className="md:w-1/4 bg-white p-6 rounded-xl shadow-2xl transition transform hover:-translate-y-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Menu</h2>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setSelectedTab("overview")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-300 ${
                  selectedTab === "overview" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                }`}
              >
                <FaHome className="inline-block mr-2 text-xl" /> Vue d'ensemble
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedTab("articlesDetails")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-300 ${
                  selectedTab === "articlesDetails" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                }`}
              >
                <FaClipboardList className="inline-block mr-2 text-xl" /> Détails Articles
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedTab("salesByFamily")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-300 ${
                  selectedTab === "salesByFamily" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                }`}
              >
                <FaChartPie className="inline-block mr-2 text-xl" /> Ventes par Famille
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedTab("timeSales")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-300 ${
                  selectedTab === "timeSales" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                }`}
              >
                <FaCalendarAlt className="inline-block mr-2 text-xl" /> Ventes Temporelles
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedTab("topArticles")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-300 ${
                  selectedTab === "topArticles" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                }`}
              >
                <FaListOl className="inline-block mr-2 text-xl" /> Top Articles
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedTab("clients")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-300 ${
                  selectedTab === "clients" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                }`}
              >
                <FaUserAlt className="inline-block mr-2 text-xl" /> Clients
              </button>
            </li>
          </ul>
        </aside>

        {/* Contenu dynamique */}
        <section className="md:w-3/4 space-y-8">{renderContent()}</section>
      </div>

      {/* Fenêtre Modale de Détails */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-2xl transform transition-all">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">{detailModal.title}</h2>
              <button onClick={closeModal} className="text-gray-600 hover:text-gray-800 text-3xl">&times;</button>
            </div>
            <div className="mt-4 max-h-96 overflow-y-auto">{detailModal.content}</div>
            <div className="mt-6 text-right">
              <button onClick={closeModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-shadow shadow-lg">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
