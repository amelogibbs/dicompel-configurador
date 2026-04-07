import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { ArrowLeft, Trash2, Download } from 'lucide-react';

interface Order {
  numero_pedido: string;
  cliente: string;
  email: string;
  telefone: string;
  representante: string;
  observacoes: string;
  itens: Array<{
    product_id: string;
    quantity: number;
  }>;
  created_at: string;
  status: string;
}

export const Orders = ({ navigate }: { navigate: (page: string) => void }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const saved = JSON.parse(localStorage.getItem("dicompel_orders") || "[]");
    setOrders(saved);
  };

  const deleteOrder = (numeroPedido: string) => {
    const updated = orders.filter(o => o.numero_pedido !== numeroPedido);
    setOrders(updated);
    localStorage.setItem("dicompel_orders", JSON.stringify(updated));
  };

  const exportOrder = (order: Order) => {
    const text = `
PEDIDO: ${order.numero_pedido}
DATA: ${new Date(order.created_at).toLocaleDateString('pt-BR')}
STATUS: ${order.status}

CLIENTE: ${order.cliente}
EMAIL: ${order.email}
TELEFONE: ${order.telefone}
REPRESENTANTE: ${order.representante}

OBSERVAÇÕES: ${order.observacoes}

ITENS:
${order.itens.map(i => `- Produto ID: ${i.product_id} | Quantidade: ${i.quantity}`).join('\n')}
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedido_${order.numero_pedido}.txt`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* BOTÃO DE VOLTAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('catalog')}
          className="flex items-center text-slate-500 hover:text-blue-600 font-bold transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Voltar ao Catálogo
        </button>
      </div>

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
          Meus Pedidos
        </h2>
        <p className="text-slate-600 text-sm">
          Total de pedidos: {orders.length}
        </p>
      </div>

      {/* LISTA DE PEDIDOS */}
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed p-10">
          <p className="text-slate-400 mb-8">Nenhum pedido realizado ainda.</p>
          <Button onClick={() => navigate('catalog')}>Ir para o Catálogo</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.numero_pedido}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {order.numero_pedido}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${
                    order.status === 'PENDENTE'
                      ? 'bg-yellow-100 text-yellow-700'
                      : order.status === 'CONFIRMADO'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase">
                    Cliente
                  </p>
                  <p className="text-slate-900 font-bold">{order.cliente}</p>
                </div>

                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase">
                    E-mail
                  </p>
                  <p className="text-slate-900 font-bold">{order.email}</p>
                </div>

                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase">
                    Telefone
                  </p>
                  <p className="text-slate-900 font-bold">{order.telefone}</p>
                </div>

                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase">
                    Representante
                  </p>
                  <p className="text-slate-900 font-bold">{order.representante}</p>
                </div>
              </div>

              {order.observacoes && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">
                    Observações
                  </p>
                  <p className="text-slate-700 text-sm">{order.observacoes}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">
                  Itens ({order.itens.length})
                </p>
                <div className="space-y-1">
                  {order.itens.map((item, idx) => (
                    <p key={idx} className="text-sm text-slate-700">
                      • Produto ID: <span className="font-bold">{item.product_id}</span> | Qtd:{' '}
                      <span className="font-bold">{item.quantity}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => exportOrder(order)}
                >
                  <Download className="h-4 w-4 mr-2" /> Exportar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700"
                  onClick={() => deleteOrder(order.numero_pedido)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Deletar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;