import React from "react";
import { authService } from "../services/api";
import {
  ShoppingCart,
  LogOut,
  Package,
  Users,
  ClipboardList,
  LogIn,
  Menu,
  X,
  UserCog,
  ShoppingBag,
  Upload,
} from "lucide-react";

interface User {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  setUser: (u: User | null) => void;
  cartCount: number;
  newOrdersCount?: number;
  currentPage: string;
  navigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  setUser,
  cartCount,
  newOrdersCount = 0,
  navigate,
  currentPage,
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("catalog");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const getRoleLabel = (perfil: string) => {
    const role = perfil?.toLowerCase();
    if (role === "admin") return "Admin";
    if (role === "supervisor") return "Supervisor";
    return "Rep";
  };

  const getRoleIcon = (perfil: string) => {
    const role = perfil?.toLowerCase();
    if (role === "admin") return <Users className="h-4 w-4 mr-2" />;
    if (role === "supervisor") return <UserCog className="h-4 w-4 mr-2" />;
    return <ClipboardList className="h-4 w-4 mr-2" />;
  };

  const showNotificationBadge =
    (user?.perfil?.toLowerCase() === "admin" || user?.perfil?.toLowerCase() === "supervisor") &&
    newOrdersCount > 0;

  const firstName = (user?.nome || "").split(" ")[0];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate("catalog")}
            >
              <Package className="h-8 w-8 text-blue-400 mr-2" />
              <div>
                <h1 className="text-xl font-bold tracking-wider">DICOMPEL</h1>
                <p className="text-xs text-gray-400">Catálogo Digital</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">

              <button
                onClick={() => navigate("catalog")}
                className={`px-3 py-2 rounded-md text-sm font-medium hover:text-blue-400 ${
                  currentPage === "catalog" ? "text-blue-400" : ""
                }`}
              >
                Catálogo
              </button>

              <button
                onClick={() => navigate("cart")}
                className="relative p-2 rounded-full hover:bg-slate-800 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("orders")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:text-blue-400 ${
                  currentPage === "orders" ? "text-blue-400" : ""
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                Meus Pedidos
              </button>

              {user ? (
                <div className="flex items-center space-x-4 border-l border-slate-700 pl-4 ml-4">

                  <button
                    onClick={() => navigate("dashboard")}
                    className={`relative flex items-center px-3 py-2 rounded-md text-sm font-medium hover:text-blue-400 ${
                      currentPage === "dashboard" ? "text-blue-400" : ""
                    }`}
                  >
                    {getRoleIcon(user.perfil)}
                    Painel {getRoleLabel(user.perfil)}

                    {showNotificationBadge && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-4 w-4 rounded-full bg-red-600 text-[10px] items-center justify-center font-bold">
                          {newOrdersCount > 9 ? "+" : newOrdersCount}
                        </span>
                      </span>
                    )}
                  </button>

                  {user.perfil?.toLowerCase() === "admin" && (
                    <button
                      onClick={() => navigate("admin-products")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:text-blue-400 ${
                        currentPage === "admin-products" ? "text-blue-400" : ""
                      }`}
                    >
                      <Upload className="h-5 w-5" />
                      Gerenciar Produtos
                    </button>
                  )}

                  <div className="text-sm text-gray-300">Olá, {firstName}</div>

                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>

                </div>
              ) : (
                <button
                  onClick={() => navigate("login")}
                  className="ml-4 flex items-center text-sm font-medium text-gray-300 hover:text-white"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Área do Representante
                </button>
              )}

            </div>

            <div className="md:hidden flex items-center space-x-3">

              <button
                onClick={() => navigate("cart")}
                className="relative p-2 rounded-full hover:bg-slate-800"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-slate-800 pb-4 px-4">

            <button
              onClick={() => {
                navigate("catalog");
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-slate-700 hover:text-white"
            >
              Catálogo
            </button>

            <button
              onClick={() => {
                navigate("orders");
                setIsMenuOpen(false);
              }}
              className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-slate-700 hover:text-white"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Meus Pedidos
            </button>

            {user ? (
              <>
                <button
                  onClick={() => {
                    navigate("dashboard");
                    setIsMenuOpen(false);
                  }}
                  className="flex justify-between items-center w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-slate-700 hover:text-white"
                >
                  Painel
                  {showNotificationBadge && (
                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {newOrdersCount}
                    </span>
                  )}
                </button>

                {user.perfil?.toLowerCase() === "admin" && (
                  <button
                    onClick={() => {
                      navigate("admin-products");
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-slate-700 hover:text-white"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Gerenciar Produtos
                  </button>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-slate-700 hover:text-red-300"
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate("login");
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-slate-700 hover:text-white"
              >
                Login Representante
              </button>
            )}

          </div>
        )}

      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-slate-900 text-gray-400 py-6 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">© {new Date().getFullYear()} Dicompel Indústria de Componentes Elétricos e Eletrônicos.</p>
          <p className="text-xs mt-1">Desenvolvido por Coolit Soluções em TI.</p>
        </div>
      </footer>

    </div>
  );
};