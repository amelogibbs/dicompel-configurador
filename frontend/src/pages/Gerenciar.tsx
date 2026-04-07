import React, { useState, useEffect } from "react";
import { Settings, Plus, Edit2, Trash2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface Product {
  ProductID: string;
  ProductCode: string;
  ProductName: string;
  Category: string;
  Brand: string;
  Line: string;
  TechnicalSpecs: string;
  ImageData: string;
}

interface GerenciarProps {
  user: any;
}

const Gerenciar: React.FC<GerenciarProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    category: "Geral",
    line: "",
    imageUrl: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      console.log("📦 Carregando produtos...");
      setLoading(true);
      setError(null);

      const response = await fetch("http://127.0.0.1:8000/products");

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      console.log("✅ Produtos carregados:", data.length);
      setProducts(data);
      setLoading(false);
    } catch (err: any) {
      console.error("❌ Erro ao carregar produtos:", err);
      setError(err.message || "Erro ao carregar produtos");
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.description || !formData.line) {
      alert("❌ Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      console.log("📝 Salvando produto...");

      const url = editingProduct
        ? `http://127.0.0.1:8000/products/${editingProduct.ProductID}`
        : "http://127.0.0.1:8000/products";

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingProduct ? "✅ Produto atualizado!" : "✅ Produto cadastrado!");
        setFormData({
          code: "",
          description: "",
          category: "Geral",
          line: "",
          imageUrl: "",
        });
        setEditingProduct(null);
        setShowForm(false);
        loadProducts();
      } else {
        alert("❌ Erro: " + data.message);
      }
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      alert("Erro ao salvar produto");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.ProductCode,
      description: product.ProductName,
      category: product.Category,
      line: product.Line,
      imageUrl: product.ImageData,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja deletar este produto?")) {
      return;
    }

    try {
      console.log("🗑️  Deletando produto:", id);

      const response = await fetch(`http://127.0.0.1:8000/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Produto deletado!");
        loadProducts();
      } else {
        alert("❌ Erro: " + data.message);
      }
    } catch (err) {
      console.error("Erro ao deletar produto:", err);
      alert("Erro ao deletar produto");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      code: "",
      description: "",
      category: "Geral",
      line: "",
      imageUrl: "",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-white mt-4">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">
              <Settings className="inline mr-2 h-8 w-8" />
              Gerenciar Produtos
            </h1>
            <p className="text-slate-600 mt-2">
              Total: <span className="font-bold">{products.length}</span>
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            {showForm ? "Cancelar" : "Novo Produto"}
          </button>
        </div>
      </div>

      {/* MENSAGEM DE ERRO */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-bold">Erro ao carregar produtos</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* FORMULÁRIO */}
      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow-lg space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">
            {editingProduct ? "Editar Produto" : "Novo Produto"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CÓDIGO */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Código *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Ex: DC-1200"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* DESCRIÇÃO */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Descrição/Nome *
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nome do produto"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* CATEGORIA */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Categoria
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Geral">Geral</option>
                  <option value="Elétrica">Elétrica</option>
                  <option value="Iluminação">Iluminação</option>
                  <option value="Tomadas">Tomadas</option>
                  <option value="Interruptores">Interruptores</option>
                </select>
              </div>

              {/* LINHA */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Linha *
                </label>
                <input
                  type="text"
                  name="line"
                  value={formData.line}
                  onChange={handleInputChange}
                  placeholder="Ex: Novara, Premium"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* URL IMAGEM */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  URL da Imagem
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* BOTÕES */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold uppercase transition-colors"
              >
                💾 {editingProduct ? "Atualizar" : "Cadastrar"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold uppercase transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTA DE PRODUTOS */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg p-12 shadow-lg text-center space-y-4">
          <Settings className="h-16 w-16 mx-auto text-slate-300" />
          <h2 className="text-2xl font-bold text-slate-800">
            Nenhum produto cadastrado
          </h2>
          <p className="text-slate-600">
            Clique em "Novo Produto" para adicionar um.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.ProductID}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {/* HEADER */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* CÓDIGO */}
                      <div>
                        <p className="text-sm font-bold text-slate-600 uppercase">
                          Código
                        </p>
                        <p className="text-2xl font-bold text-slate-800">
                          {product.ProductCode}
                        </p>
                      </div>

                      {/* NOME */}
                      <div className="border-l border-slate-300 pl-4">
                        <p className="text-sm font-bold text-slate-600 uppercase">
                          Nome
                        </p>
                        <p className="text-slate-800 font-bold mt-1">
                          {product.ProductName}
                        </p>
                      </div>

                      {/* CATEGORIA */}
                      <div className="border-l border-slate-300 pl-4">
                        <p className="text-sm font-bold text-slate-600 uppercase">
                          Categoria
                        </p>
                        <p className="text-slate-800 font-bold mt-1">
                          {product.Category}
                        </p>
                      </div>

                      {/* LINHA */}
                      <div className="border-l border-slate-300 pl-4">
                        <p className="text-sm font-bold text-slate-600 uppercase">
                          Linha
                        </p>
                        <p className="text-slate-800 font-bold mt-1">
                          {product.Line}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BOTÕES */}
                  <div className="flex gap-2 flex-wrap">
                    {/* BOTÃO DETALHE */}
                    <button
                      onClick={() => {
                        if (expandedProduct === product.ProductID) {
                          setExpandedProduct(null);
                        } else {
                          setExpandedProduct(product.ProductID);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap text-sm ${
                        expandedProduct === product.ProductID
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                      }`}
                    >
                      {expandedProduct === product.ProductID ? "Ocultar" : "Detalhe"}
                      {expandedProduct === product.ProductID ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {/* BOTÃO EDITAR */}
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      Editar
                    </button>

                    {/* BOTÃO DELETAR */}
                    <button
                      onClick={() => handleDelete(product.ProductID)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar
                    </button>
                  </div>
                </div>
              </div>

              {/* DETALHES (EXPANDIDO) */}
              {expandedProduct === product.ProductID && (
                <div className="p-6 bg-slate-50 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Código
                      </p>
                      <p className="text-lg font-bold text-slate-800 mt-2">
                        {product.ProductCode}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Categoria
                      </p>
                      <p className="text-lg font-bold text-slate-800 mt-2">
                        {product.Category}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Linha
                      </p>
                      <p className="text-lg font-bold text-slate-800 mt-2">
                        {product.Line}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Marca
                      </p>
                      <p className="text-lg font-bold text-slate-800 mt-2">
                        {product.Brand || "N/A"}
                      </p>
                    </div>
                  </div>

                  {product.TechnicalSpecs && (
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Especificações Técnicas
                      </p>
                      <p className="text-slate-800 mt-2 whitespace-pre-wrap">
                        {product.TechnicalSpecs}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gerenciar;