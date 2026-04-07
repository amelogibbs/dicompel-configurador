import React, { useState, useEffect } from "react";
import { LogOut, Menu, X } from "lucide-react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Catalog from "./pages/Catalog";
import Montador from "./pages/Montador";
import MyOrders from "./pages/MyOrders";
import Gerenciar from "./pages/Gerenciar";
import Representatives from "./pages/Representatives";

interface User {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("login");
  const [cartCount, setCartCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentPage("dashboard");
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setCurrentPage("login");
    setShowMenu(false);
  };

  const navigate = (page: string) => {
    setCurrentPage(page);
    setShowMenu(false);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* HEADER */}
      <header className="bg-slate-900 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">LI</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">DICOMPEL</h1>
              <p className="text-slate-400 text-xs">Configurador de Produtos</p>
            </div>
          </div>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate("dashboard")}
              className={`px-4 py-2 rounded-lg font-bold uppercase transition-colors text-sm ${
                currentPage === "dashboard"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              📊 Dashboard
            </button>

            <button
              onClick={() => navigate("catalog")}
              className={`px-4 py-2 rounded-lg font-bold uppercase transition-colors text-sm ${
                currentPage === "catalog"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              📦 Catálogo
            </button>

            <button
              onClick={() => navigate("montador")}
              className={`px-4 py-2 rounded-lg font-bold uppercase transition-colors text-sm ${
                currentPage === "montador"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              🔧 Montador
            </button>

            <button
              onClick={() => navigate("myorders")}
              className={`px-4 py-2 rounded-lg font-bold uppercase transition-colors text-sm ${
                currentPage === "myorders"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              📋 Meus Pedidos
            </button>

            <button
              onClick={() => navigate("representatives")}
              className={`px-4 py-2 rounded-lg font-bold uppercase transition-colors text-sm ${
                currentPage === "representatives"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              👥 Representantes
            </button>

            {user.perfil === "admin" && (
              <button
                onClick={() => navigate("gerenciar")}
                className={`px-4 py-2 rounded-lg font-bold uppercase transition-colors text-sm ${
                  currentPage === "gerenciar"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                ⚙️ Gerenciar
              </button>
            )}
          </nav>

          {/* USER INFO E LOGOUT */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-white font-bold">{user.nome}</p>
              <p className="text-slate-400 text-xs">{user.perfil}</p>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center gap-2 text-sm"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>

            {/* MENU MOBILE */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden text-white"
            >
              {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* MENU MOBILE EXPANDIDO */}
        {showMenu && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700 p-4 space-y-2">
            <button
              onClick={() => navigate("dashboard")}
              className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
            >
              📊 Dashboard
            </button>

            <button
              onClick={() => navigate("catalog")}
              className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
            >
              📦 Catálogo
            </button>

            <button
              onClick={() => navigate("montador")}
              className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
            >
              🔧 Montador
            </button>

            <button
              onClick={() => navigate("myorders")}
              className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
            >
              📋 Meus Pedidos
            </button>

            <button
              onClick={() => navigate("representatives")}
              className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
            >
              👥 Representantes
            </button>

            {user.perfil === "admin" && (
              <button
                onClick={() => navigate("gerenciar")}
                className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
              >
                ⚙️ Gerenciar
              </button>
            )}
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === "dashboard" && <Dashboard user={user} />}
        {currentPage === "catalog" && <Catalog setCartCount={setCartCount} />}
        {currentPage === "montador" && <Montador user={user} />}
        {currentPage === "myorders" && <MyOrders user={user} navigate={navigate} />}
        {currentPage === "representatives" && <Representatives user={user} />}
        {currentPage === "gerenciar" && <Gerenciar user={user} />}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-slate-400">
          <p>© 2026 DICOMPEL - Configurador de Produtos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;