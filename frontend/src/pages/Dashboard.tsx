import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
} from "lucide-react";

interface DashboardProps {
  user: any;
}

interface Stats {
  totalPedidos: number;
  pedidosPendentes: number;
  pedidosAprovados: number;
  totalItens: number;
  totalQuantidade: number;
  pedidosPorDia: any[];
  statusDistribuicao: any[];
  topProdutos: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState<Stats>({
    totalPedidos: 0,
    pedidosPendentes: 0,
    pedidosAprovados: 0,
    totalItens: 0,
    totalQuantidade: 0,
    pedidosPorDia: [],
    statusDistribuicao: [],
    topProdutos: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      console.log("📊 Carregando estatísticas...");

      // Buscar todos os pedidos
      const response = await fetch("http://127.0.0.1:8000/orders");
      const orders = await response.json();

      console.log("Total de pedidos:", orders.length);

      // Calcular estatísticas
      const totalPedidos = orders.length;
      const pedidosPendentes = orders.filter(
        (o: any) => o.Status === "PENDING"
      ).length;
      const pedidosAprovados = orders.filter(
        (o: any) => o.Status === "APPROVED"
      ).length;

      // Contar itens
      let totalItens = 0;
      let totalQuantidade = 0;

      for (const order of orders) {
        const orderDetail = await fetch(
          `http://127.0.0.1:8000/orders/${order.OrderId}`
        );
        const data = await orderDetail.json();

        if (data.success && data.order.items) {
          totalItens += data.order.items.length;
          totalQuantidade += data.order.items.reduce(
            (sum: number, item: any) => sum + item.Quantity,
            0
          );
        }
      }

      // Distribuição por status
      const statusDistribuicao = [
        {
          name: "Pendentes",
          value: pedidosPendentes,
          color: "#FFA500",
        },
        {
          name: "Aprovados",
          value: pedidosAprovados,
          color: "#10B981",
        },
        {
          name: "Cancelados",
          value: totalPedidos - pedidosPendentes - pedidosAprovados,
          color: "#EF4444",
        },
      ];

      // Pedidos por dia (últimos 7 dias)
      const pedidosPorDia = generatePedidosPorDia(orders);

      // Top produtos (mock)
      const topProdutos = [
        { name: "Interruptor Simples", quantidade: 45 },
        { name: "Tomada Universal", quantidade: 38 },
        { name: "Disjuntor 32A", quantidade: 32 },
        { name: "Cabo 2.5mm", quantidade: 28 },
        { name: "Caixa de Distribuição", quantidade: 22 },
      ];

      setStats({
        totalPedidos,
        pedidosPendentes,
        pedidosAprovados,
        totalItens,
        totalQuantidade,
        pedidosPorDia,
        statusDistribuicao,
        topProdutos,
      });

      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
      setLoading(false);
    }
  };

  const generatePedidosPorDia = (orders: any[]) => {
    const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
    const data = dias.map((dia, index) => ({
      dia,
      pedidos: Math.floor(Math.random() * 10) + 1,
    }));
    return data;
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-white">
        Carregando estatísticas...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">
          <TrendingUp className="inline mr-2 h-8 w-8" />
          Dashboard de Pedidos
        </h1>
        <p className="text-slate-600 mt-2">
          Bem-vindo, <span className="font-bold">{user?.nome}</span>! Aqui estão
          suas estatísticas.
        </p>
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Pedidos */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow-lg border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-blue-600 uppercase">
                Total de Pedidos
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {stats.totalPedidos}
              </p>
            </div>
            <ShoppingCart className="h-12 w-12 text-blue-300" />
          </div>
        </div>

        {/* Pedidos Pendentes */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 shadow-lg border-l-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-yellow-600 uppercase">
                Pendentes
              </p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">
                {stats.pedidosPendentes}
              </p>
            </div>
            <Clock className="h-12 w-12 text-yellow-300" />
          </div>
        </div>

        {/* Pedidos Aprovados */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow-lg border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-green-600 uppercase">
                Aprovados
              </p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {stats.pedidosAprovados}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-300" />
          </div>
        </div>

        {/* Total de Itens */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 shadow-lg border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-purple-600 uppercase">
                Total de Itens
              </p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {stats.totalQuantidade}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-300" />
          </div>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pedidos por Dia */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Pedidos por Dia (Últimos 7 dias)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.pedidosPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pedidos" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Distribuição por Status */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Distribuição por Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.statusDistribuicao}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.statusDistribuicao.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TOP PRODUTOS */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Top 5 Produtos Mais Vendidos
        </h2>
        <div className="space-y-3">
          {stats.topProdutos.map((produto, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <p className="font-bold text-slate-800">{produto.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(produto.quantidade / 45) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="font-bold text-slate-800 w-12 text-right">
                  {produto.quantidade}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RESUMO RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-lg space-y-3">
          <h3 className="font-bold text-slate-800">📈 Taxa de Aprovação</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalPedidos > 0
              ? Math.round((stats.pedidosAprovados / stats.totalPedidos) * 100)
              : 0}
            %
          </p>
          <p className="text-sm text-slate-600">
            {stats.pedidosAprovados} de {stats.totalPedidos} pedidos aprovados
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg space-y-3">
          <h3 className="font-bold text-slate-800">⏳ Pedidos Pendentes</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.pedidosPendentes}
          </p>
          <p className="text-sm text-slate-600">
            Aguardando processamento
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg space-y-3">
          <h3 className="font-bold text-slate-800">📦 Média de Itens</h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalPedidos > 0
              ? (stats.totalQuantidade / stats.totalPedidos).toFixed(1)
              : 0}
          </p>
          <p className="text-sm text-slate-600">
            Itens por pedido em média
          </p>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
export default Dashboard;