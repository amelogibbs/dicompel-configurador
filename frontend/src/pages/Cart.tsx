import React, { useState, useEffect } from "react";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { orderService, productService } from "../services/api";

interface CartItem {
  id: string;
  code: string;
  name: string;
  quantity: number;
  price?: number;
}

interface CartProps {
  user: any;
  setCartCount: (count: number) => void;
  navigate: (page: string) => void;
  setOrderData: (data: any) => void;
}

const Cart: React.FC<CartProps> = ({
  user,
  setCartCount,
  navigate,
  setOrderData,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const [selectedRep, setSelectedRep] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Carregar itens do localStorage
  useEffect(() => {
    loadCart();
    loadReps();
  }, []);

  const loadCart = () => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const items = JSON.parse(stored);
        setCartItems(items);
        setCartCount(items.length);
      } else {
        setCartItems([]);
        setCartCount(0);
      }
    } catch (err) {
      console.error("Erro ao carregar carrinho:", err);
      setCartItems([]);
      setCartCount(0);
    }
  };

  const loadReps = async () => {
    try {
      // Dados mock de representantes
      const mockReps = [
        { id: "1", nome: "João Silva" },
        { id: "2", nome: "Maria Santos" },
        { id: "3", nome: "Pedro Oliveira" },
        { id: "4", nome: "Ana Costa" },
        { id: "5", nome: "Carlos Mendes" },
      ];

      setRepresentatives(mockReps);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar representantes:", err);
      setRepresentatives([]);
      setLoading(false);
    }
  };

  const handleRemoveItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    setCartCount(updated.length);
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleSubmitOrder = async () => {
    if (!selectedRep) {
      alert("Selecione um representante");
      return;
    }

    if (cartItems.length === 0) {
      alert("Carrinho vazio");
      return;
    }

    setSubmitting(true);
    try {
      // Estrutura correta do pedido
      const order = {
        representativeId: selectedRep,
        userId: user?.id || 1,
        items: cartItems.map((item) => ({
          productId: item.id,
          productCode: item.code,
          productName: item.name,
          quantity: item.quantity,
          price: item.price || 0,
        })),
        status: "PENDING",
        totalItems: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        createdAt: new Date().toISOString(),
      };

      console.log("Enviando pedido:", order);

      const response = await orderService.create(order);

      console.log("Pedido criado:", response);

      // ✅ NOVO: Salvar dados do pedido ANTES de navegar
      if (response.success) {
        const orderData = {
          order_id: response.order_id,
          numero_pedido: response.numero_pedido,
          totalItems: cartItems.length,
          totalQuantity: cartItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
        };

        console.log("📦 Dados do pedido:", orderData);
        setOrderData(orderData); // ✅ Chamar a função

        // Limpar carrinho
        setCartItems([]);
        localStorage.removeItem("cart");
        setCartCount(0);

        // ✅ Navegar DEPOIS de salvar os dados
        setTimeout(() => {
          navigate("order-confirmation");
        }, 300);
      } else {
        alert("Erro ao criar pedido: " + response.message);
      }
    } catch (err: any) {
      console.error("Erro ao enviar pedido:", err);
      console.error("Detalhes do erro:", err.response?.data);
      alert(
        `Erro ao enviar pedido: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Verificar se carrinho está vazio
  const isEmpty = cartItems.length === 0;

  if (loading) {
    return <div className="text-center py-12 text-white">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">
          <ShoppingCart className="inline mr-2 h-8 w-8" />
          Meu Carrinho
        </h1>
      </div>

      {/* CARRINHO VAZIO */}
      {isEmpty ? (
        <div className="bg-white rounded-lg p-12 shadow-lg text-center space-y-4">
          <ShoppingCart className="h-16 w-16 mx-auto text-slate-300" />
          <h2 className="text-2xl font-bold text-slate-800">
            Seu carrinho está vazio
          </h2>
          <p className="text-slate-600">
            Adicione produtos para gerar sua cotação.
          </p>
          <button
            onClick={() => navigate("catalog")}
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold uppercase transition-colors"
          >
            Ir para o Catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ITENS DO CARRINHO */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Itens ({cartItems.length})
            </h2>

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{item.code}</p>
                  <p className="text-sm text-slate-600">{item.name}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="p-1 hover:bg-slate-200 rounded"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value))
                      }
                      className="w-12 text-center border rounded px-2 py-1"
                    />
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="p-1 hover:bg-slate-200 rounded"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMO E REPRESENTANTE */}
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 h-fit sticky top-4">
            <h2 className="text-xl font-bold text-slate-800">Resumo</h2>

            <div className="space-y-2 pb-4 border-b">
              <div className="flex justify-between text-slate-600">
                <span>Total de itens:</span>
                <span className="font-bold">{cartItems.length}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Quantidade total:</span>
                <span className="font-bold">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
            </div>

            {/* SELEÇÃO DE REPRESENTANTE */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Representante
              </label>
              <select
                value={selectedRep}
                onChange={(e) => setSelectedRep(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um representante</option>
                {representatives.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    {rep.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* BOTÕES */}
            <div className="space-y-2 pt-4">
              <button
                onClick={handleSubmitOrder}
                disabled={submitting || !selectedRep}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-bold uppercase transition-colors"
              >
                {submitting ? "Enviando..." : "Enviar Pedido"}
              </button>

              <button
                onClick={() => navigate("catalog")}
                className="w-full px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold uppercase transition-colors"
              >
                Continuar Comprando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { Cart };
export default Cart;