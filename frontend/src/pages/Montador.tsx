import React, { useState } from "react";
import { Zap, Plus, Trash2, ShoppingCart, AlertCircle } from "lucide-react";

interface MontadorItem {
  id: string;
  nome: string;
  quantidade: number;
}

interface MontadorProps {
  user: any;
}

const Montador: React.FC<MontadorProps> = ({ user }) => {
  const [items, setItems] = useState<MontadorItem[]>([]);
  const [nomeProduto, setNomeProduto] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [nomeCliente, setNomeCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");

  const handleAddItem = () => {
    if (!nomeProduto.trim()) {
      alert("❌ Digite o nome do produto!");
      return;
    }

    const novoItem: MontadorItem = {
      id: Date.now().toString(),
      nome: nomeProduto,
      quantidade: quantidade,
    };

    setItems([...items, novoItem]);
    setNomeProduto("");
    setQuantidade(1);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleAddToCart = () => {
    if (items.length === 0) {
      alert("❌ Adicione pelo menos um produto!");
      return;
    }

    if (!nomeCliente.trim()) {
      alert("❌ Digite o nome do cliente!");
      return;
    }

    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      items.forEach((item) => {
        const existingItem = cart.find((c: any) => c.name === item.nome);

        if (existingItem) {
          existingItem.quantity += item.quantidade;
        } else {
          cart.push({
            id: item.id,
            code: `CUSTOM-${item.id}`,
            name: item.nome,
            quantity: item.quantidade,
            price: 0,
          });
        }
      });

      localStorage.setItem("cart", JSON.stringify(cart));
      alert("✅ Produtos adicionados ao carrinho!");

      setItems([]);
      setNomeProduto("");
      setQuantidade(1);
      setNomeCliente("");
      setEmailCliente("");
      setTelefoneCliente("");
    } catch (err) {
      console.error("Erro ao adicionar ao carrinho:", err);
      alert("Erro ao adicionar ao carrinho");
    }
  };

  const totalQuantidade = items.reduce((sum, item) => sum + item.quantidade, 0);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">
          <Zap className="inline mr-2 h-8 w-8" />
          Montador Novara
        </h1>
        <p className="text-slate-600 mt-2">
          Monte seus produtos personalizados e adicione ao carrinho
        </p>
      </div>

      {/* FORMULÁRIO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA ESQUERDA - DADOS DO CLIENTE */}
        <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-lg space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">👤 Cliente</h2>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Nome do Cliente *
            </label>
            <input
              type="text"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              placeholder="Nome completo"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={emailCliente}
              onChange={(e) => setEmailCliente(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              value={telefoneCliente}
              onChange={(e) => setTelefoneCliente(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* COLUNA CENTRAL E DIREITA - PRODUTOS */}
        <div className="lg:col-span-2 space-y-6">
          {/* ADICIONAR PRODUTO */}
          <div className="bg-white rounded-lg p-6 shadow-lg space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">📦 Produtos</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={nomeProduto}
                  onChange={(e) => setNomeProduto(e.target.value)}
                  placeholder="Ex: Interruptor Simples"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Quantidade *
                </label>
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAddItem}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Adicionar
                </button>
              </div>
            </div>
          </div>

          {/* LISTA DE PRODUTOS */}
          <div className="bg-white rounded-lg p-6 shadow-lg space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">
              📋 Produtos Adicionados ({items.length})
            </h2>

            {items.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600">Nenhum produto adicionado ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{item.nome}</p>
                      <p className="text-sm text-slate-600">
                        Quantidade: {item.quantidade}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total de Produtos:</span>
                  <span className="text-blue-600">{items.length}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Quantidade Total:</span>
                  <span className="text-green-600">{totalQuantidade}</span>
                </div>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <button
              onClick={handleAddToCart}
              className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center justify-center gap-2 text-lg"
            >
              <ShoppingCart className="h-6 w-6" />
              Adicionar ao Carrinho
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Montador;