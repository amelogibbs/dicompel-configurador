import React, { useState, useEffect } from "react";
import { Eye, ChevronDown, ChevronUp, Package, Calendar, User, AlertCircle, Edit2, Trash2, Send } from "lucide-react";

interface Order {
  OrderId: number;
  OrderNumber: string;
  CustomerName: string;
  CustomerEmail: string;
  CustomerPhone: string;
  Status: string;
  CreatedAt: string;
  items?: any[];
}

interface MyOrdersProps {
  user: any;
  navigate: (page: string) => void;
}

const MyOrders: React.FC<MyOrdersProps> = ({ user, navigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sendingOrder, setSendingOrder] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      console.log("📋 Carregando pedidos...");
      setLoading(true);
      setError(null);

      const response = await fetch("http://127.0.0.1:8000/orders");

      console.log("Status da resposta:", response.status);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      console.log("✅ Resposta recebida:", data);

      if (Array.isArray(data)) {
        console.log("Total de pedidos:", data.length);
        setOrders(data);
      } else {
        console.error("❌ Resposta não é um array:", data);
        setOrders([]);
        setError("Formato de resposta inválido");
      }

      setLoading(false);
    } catch (err: any) {
      console.error("❌ Erro ao carregar pedidos:", err);
      setError(err.message || "Erro ao carregar pedidos");
      setOrders([]);
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId: number) => {
    try {
      console.log("📦 Carregando detalhes do pedido:", orderId);

      const response = await fetch(`http://127.0.0.1:8000/orders/${orderId}`);
      const data = await response.json();

      console.log("Detalhes carregados:", data);

      if (data.success) {
        setSelectedOrder(data.order);
        setExpandedOrder(orderId);
      } else {
        alert("Erro ao carregar detalhes do pedido: " + data.message);
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes:", err);
      alert("Erro ao carregar detalhes do pedido");
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este pedido?")) {
      return;
    }

    try {
      console.log("🗑️  Deletando pedido:", orderId);

      const response = await fetch(`http://127.0.0.1:8000/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      console.log("Resposta delete:", data);

      if (data.success) {
        alert("✅ Pedido deletado com sucesso!");
        setExpandedOrder(null);
        setSelectedOrder(null);
        loadOrders();
      } else {
        alert("❌ Erro ao deletar pedido: " + data.message);
      }
    } catch (err) {
      console.error("Erro ao deletar pedido:", err);
      alert("Erro ao deletar pedido");
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder({ ...order });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingOrder) return;

    try {
      console.log("✏️  Atualizando pedido:", editingOrder.OrderId);

      const response = await fetch(
        `http://127.0.0.1:8000/orders/${editingOrder.OrderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            CustomerName: editingOrder.CustomerName,
            CustomerEmail: editingOrder.CustomerEmail,
            CustomerPhone: editingOrder.CustomerPhone,
            Status: editingOrder.Status,
          }),
        }
      );

      const data = await response.json();

      console.log("Resposta update:", data);

      if (data.success) {
        alert("✅ Pedido atualizado com sucesso!");
        setShowEditModal(false);
        setEditingOrder(null);
        loadOrders();
        setExpandedOrder(null);
      } else {
        alert("❌ Erro ao atualizar pedido: " + data.message);
      }
    } catch (err) {
      console.error("Erro ao atualizar pedido:", err);
      alert("Erro ao atualizar pedido");
    }
  };

  const handleSendOrder = async (orderId: number) => {
    if (!window.confirm("Tem certeza que deseja enviar este pedido para o representante?")) {
      return;
    }

    try {
      setSendingOrder(true);
      console.log("📤 Enviando pedido:", orderId);

      // ✅ CORRIGIDO: Buscar o pedido completo e enviar todos os campos obrigatórios
      const orderToSend = orders.find(o => o.OrderId === orderId);

      if (!orderToSend) {
        alert("Pedido não encontrado");
        setSendingOrder(false);
        return;
      }

      console.log("Pedido a enviar:", orderToSend);

      const response = await fetch(
        `http://127.0.0.1:8000/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            CustomerName: orderToSend.CustomerName,
            CustomerEmail: orderToSend.CustomerEmail,
            CustomerPhone: orderToSend.CustomerPhone,
            Status: "APPROVED",
          }),
        }
      );

      const data = await response.json();

      console.log("Resposta envio:", data);

      if (data.success) {
        alert("✅ Pedido enviado com sucesso para o representante!");
        setSendingOrder(false);
        setExpandedOrder(null);
        setSelectedOrder(null);
        loadOrders();
      } else {
        alert("❌ Erro ao enviar pedido: " + data.message);
        setSendingOrder(false);
      }
    } catch (err) {
      console.error("Erro ao enviar pedido:", err);
      alert("Erro ao enviar pedido");
      setSendingOrder(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "⏳ Pendente";
      case "APPROVED":
        return "✅ Aprovado";
      case "REJECTED":
        return "❌ Rejeitado";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-white mt-4">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">
          <Package className="inline mr-2 h-8 w-8" />
          Meus Pedidos
        </h1>
        <p className="text-slate-600 mt-2">
          Total de pedidos: <span className="font-bold">{orders.length}</span>
        </p>
      </div>

      {/* MENSAGEM DE ERRO */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-bold">Erro ao carregar pedidos</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* LISTA DE PEDIDOS */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg p-12 shadow-lg text-center space-y-4">
          <Package className="h-16 w-16 mx-auto text-slate-300" />
          <h2 className="text-2xl font-bold text-slate-800">
            Nenhum pedido encontrado
          </h2>
          <p className="text-slate-600">
            Você ainda não criou nenhum pedido.
          </p>
          <button
            onClick={() => navigate("catalog")}
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold uppercase transition-colors"
          >
            Ir para o Catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.OrderId}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {/* HEADER DO PEDIDO */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* NÚMERO DO PEDIDO */}
                      <div>
                        <p className="text-sm font-bold text-slate-600 uppercase">
                          Pedido
                        </p>
                        <p className="text-2xl font-bold text-slate-800">
                          {order.OrderNumber}
                        </p>
                      </div>

                      {/* STATUS */}
                      <div className="border-l border-slate-300 pl-4">
                        <p className="text-sm font-bold text-slate-600 uppercase">
                          Status
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-1 ${getStatusColor(
                            order.Status
                          )}`}
                        >
                          {getStatusLabel(order.Status)}
                        </span>
                      </div>

                      {/* DATA */}
                      <div className="border-l border-slate-300 pl-4">
                        <p className="text-sm font-bold text-slate-600 uppercase">
                          Data
                        </p>
                        <p className="text-slate-800 font-bold mt-1">
                          {new Date(order.CreatedAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>

                      {/* CLIENTE */}
                      <div className="border-l border-slate-300 pl-4">
                        <p className="text-sm font-bold text-slate-600 uppercase">
                          Cliente
                        </p>
                        <p className="text-slate-800 font-bold mt-1">
                          {order.CustomerName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BOTÕES DE AÇÃO */}
                  <div className="flex gap-2 flex-wrap">
                  {/* BOTÃO DETALHE */}
                                        <button
                                          onClick={() => {
                                            // ✅ CORRIGIDO: Se já está expandido, oculta. Se não, mostra.
                                            if (expandedOrder === order.OrderId) {
                                              setExpandedOrder(null);
                                              setSelectedOrder(null);
                                            } else {
                                              loadOrderDetails(order.OrderId);
                                            }
                                          }}
                                          className={`px-4 py-2 rounded-lg font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap text-sm ${
                                            expandedOrder === order.OrderId
                                              ? "bg-blue-600 text-white"
                                              : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                                          }`}
                                        >
                                          <Eye className="h-4 w-4" />
                                          {expandedOrder === order.OrderId ? "Ocultar" : "Detalhe"}
                                          {expandedOrder === order.OrderId ? (
                                            <ChevronUp className="h-4 w-4" />
                                          ) : (
                                            <ChevronDown className="h-4 w-4" />
                                          )}
                                        </button>

                    {/* BOTÃO EDITAR (apenas se PENDING) */}
                    {order.Status === "PENDING" && (
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
                      >
                        <Edit2 className="h-4 w-4" />
                        Editar
                      </button>
                    )}

                    {/* BOTÃO ENVIAR (apenas se PENDING) */}
                    {order.Status === "PENDING" && (
                      <button
                        onClick={() => handleSendOrder(order.OrderId)}
                        disabled={sendingOrder}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-bold uppercase transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
                      >
                        <Send className="h-4 w-4" />
                        {sendingOrder ? "Enviando..." : "Enviar"}
                      </button>
                    )}

                    {/* BOTÃO DELETAR (apenas se PENDING) */}
                    {order.Status === "PENDING" && (
                      <button
                        onClick={() => handleDeleteOrder(order.OrderId)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        Deletar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* DETALHES DO PEDIDO (EXPANDIDO) */}
              {expandedOrder === order.OrderId && selectedOrder && (
                <div className="p-6 bg-slate-50 space-y-4">
                  {/* INFORMAÇÕES DO CLIENTE */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Cliente
                      </p>
                      <p className="text-lg font-bold text-slate-800 mt-2">
                        {selectedOrder.CustomerName}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Email
                      </p>
                      <p className="text-lg font-bold text-slate-800 mt-2">
                        {selectedOrder.CustomerEmail || "Não informado"}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Telefone
                      </p>
                      <p className="text-lg font-bold text-slate-800 mt-2">
                        {selectedOrder.CustomerPhone || "Não informado"}
                      </p>
                    </div>
                  </div>

                  {/* ITENS DO PEDIDO */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">
                      📦 Itens do Pedido
                    </h3>

                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <div className="space-y-3">
                        {selectedOrder.items.map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200"
                          >
                            <div className="flex-1">
                              <p className="font-bold text-slate-800">
                                {item.ProductCode}
                              </p>
                              <p className="text-sm text-slate-600">
                                {item.ProductName}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-800">
                                Qtd: {item.Quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600">Nenhum item neste pedido</p>
                    )}
                  </div>

                  {/* RESUMO */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Total de Itens
                      </p>
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        {selectedOrder.items?.length || 0}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Quantidade Total
                      </p>
                      <p className="text-2xl font-bold text-green-600 mt-2">
                        {selectedOrder.items?.reduce(
                          (sum: number, item: any) => sum + item.Quantity,
                          0
                        ) || 0}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Data do Pedido
                      </p>
                      <p className="text-lg font-bold text-slate-800 mt-2">
                        {new Date(selectedOrder.CreatedAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE EDIÇÃO */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
            {/* HEADER DO MODAL */}
            <div className="bg-green-600 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Editar Pedido</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-green-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* CONTEÚDO DO MODAL */}
            <div className="p-6 space-y-4">
              {/* NÚMERO DO PEDIDO (READONLY) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Número do Pedido
                </label>
                <input
                  type="text"
                  value={editingOrder.OrderNumber}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed"
                />
              </div>

              {/* NOME DO CLIENTE */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  value={editingOrder.CustomerName}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      CustomerName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editingOrder.CustomerEmail}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      CustomerEmail: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* TELEFONE */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={editingOrder.CustomerPhone}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      CustomerPhone: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* STATUS */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={editingOrder.Status}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      Status: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="PENDING">⏳ Pendente</option>
                  <option value="APPROVED">✅ Aprovado</option>
                  <option value="REJECTED">❌ Rejeitado</option>
                </select>
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold uppercase transition-colors"
                >
                  💾 Salvar Alterações
                </button>

                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold uppercase transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { MyOrders };
export default MyOrders;