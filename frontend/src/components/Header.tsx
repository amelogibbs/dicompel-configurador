import React, { useState } from "react";
import {
  Menu,
  X,
  LogOut,
  ShoppingCart,
  BarChart3,
  Package,
  Wrench,
  ClipboardList,
  Settings,
} from "lucide-react";

interface HeaderProps {
  user: any;
  cartCount: number;
  currentPage: string;
  navigate: (page: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  cartCount,
  currentPage,
  navigate,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "📊 Dashboard", page: "dashboard", icon: BarChart3 },
    { label: "📦 Catálogo", page: "catalog", icon: Package },
    { label: "🔧 Montador Novara", page: "novara", icon: Wrench },
    { label: "📋 Meus Pedidos", page: "orders", icon: ClipboardList },
  ];

  // Adicionar menu de admin se o usuário for admin
  if (user?.perfil === "admin") {
    menuItems.push({
      label: "⚙️ Gerenciar Produtos",
      page: "admin",
      icon: Settings,
    });
  }

  const handleNavigate = (page: string) => {
    navigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* LOGO */}
          <div
            onClick={() => handleNavigate("dashboard")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="bg-blue-600 rounded-lg p-2">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">DICOMPEL</h1>
              <p className="text-xs text-slate-400">Configurador de Produtos</p>
            </div>
          </div>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => handleNavigate(item.page)}
                  className={`px-4 py-2 rounded-lg font-bold uppercase text-sm transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label.split(" ")[1]}
                </button>
              );
            })}
          </nav>

          {/* DIREITA - CARRINHO E USUÁRIO */}
          <div className="flex items-center gap-4">
            {/* CARRINHO */}
            <button
              onClick={() => handleNavigate("cart")}
              className={`relative p-2 rounded-lg transition-all ${
                currentPage === "cart"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* USUÁRIO - DESKTOP */}
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-700">
              <div className="text-right">
                <p className="text-sm font-bold text-white">{user?.nome}</p>
                <p className="text-xs text-slate-400 capitalize">
                  {user?.perfil}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-300 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>

            {/* MENU MOBILE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:bg-slate-700 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* MENU MOBILE EXPANDIDO */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4 border-t border-slate-700 pt-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => handleNavigate(item.page)}
                  className={`w-full px-4 py-3 rounded-lg font-bold uppercase text-sm transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}

            {/* USUÁRIO - MOBILE */}
            <div className="border-t border-slate-700 pt-4 mt-4 space-y-2">
              <p className="text-sm font-bold text-white px-4">{user?.nome}</p>
              <p className="text-xs text-slate-400 px-4 capitalize">
                {user?.perfil}
              </p>
              <button
                onClick={onLogout}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold uppercase transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;