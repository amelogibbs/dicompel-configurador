import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import { productService } from "../services/api";

interface Product {
  ProductID?: string;
  ProductCode: string;
  ProductName: string;
  Category: string;
  Line: string;
  ImageData?: string;
  TechnicalSpecs?: string;
}

interface AdminProductsProps {
  navigate: (page: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Product>({
    ProductCode: "",
    ProductName: "",
    Category: "",
    Line: "",
    ImageData: "",
    TechnicalSpecs: "",
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [lines, setLines] = useState<string[]>([]);

  // Carregar produtos
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);

      // Extrair categorias e linhas únicas
      const uniqueCategories = [...new Set(data.map((p: Product) => p.Category).filter(Boolean))];
      const uniqueLines = [...new Set(data.map((p: Product) => p.Line).filter(Boolean))];

      setCategories(uniqueCategories);
      setLines(uniqueLines);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ProductCode || !formData.ProductName || !formData.Category || !formData.Line) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingId) {
        // Atualizar produto
        await productService.update(editingId, formData);
        alert("Produto atualizado com sucesso!");
      } else {
        // Criar novo produto
        await productService.create(formData);
        alert("Produto criado com sucesso!");
      }

      setFormData({
        ProductCode: "",
        ProductName: "",
        Category: "",
        Line: "",
        ImageData: "",
        TechnicalSpecs: "",
      });
      setShowForm(false);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      alert("Erro ao salvar produto");
    }
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.ProductID || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja deletar este produto?")) {
      return;
    }

    try {
      await productService.delete(id);
      alert("Produto deletado com sucesso!");
      loadProducts();
    } catch (err) {
      console.error("Erro ao deletar produto:", err);
      alert("Erro ao deletar produto");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      ProductCode: "",
      ProductName: "",
      Category: "",
      Line: "",
      ImageData: "",
      TechnicalSpecs: "",
    });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.ProductCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ProductName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12 text-white">Carregando produtos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">
            Gerenciar Produtos
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
          >
            <Plus className="h-5 w-5" />
            Novo Produto
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por código ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingId ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button
                onClick={handleCancel}
                className="text-slate-500 hover:text-slate-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* CÓDIGO */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Código do Produto *
                </label>
                <input
                  type="text"
                  name="ProductCode"
                  value={formData.ProductCode}
                  onChange={handleInputChange}
                  placeholder="Ex: DC-1200/19"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* NOME */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  name="ProductName"
                  value={formData.ProductName}
                  onChange={handleInputChange}
                  placeholder="Ex: 1 Interruptor Simples + Tomada Universal"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* CATEGORIA */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Categoria *
                </label>
                <select
                  name="Category"
                  value={formData.Category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Nova Categoria">+ Adicionar nova</option>
                </select>
              </div>

              {/* LINHA */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Linha *
                </label>
                <select
                  name="Line"
                  value={formData.Line}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione uma linha</option>
                  {lines.map((line) => (
                    <option key={line} value={line}>
                      {line}
                    </option>
                  ))}
                  <option value="Nova Linha">+ Adicionar nova</option>
                </select>
              </div>

              {/* ESPECIFICAÇÕES TÉCNICAS */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Especificações Técnicas
                </label>
                <textarea
                  name="TechnicalSpecs"
                  value={formData.TechnicalSpecs}
                  onChange={handleInputChange}
                  placeholder="Ex: 10A, Branco, 4x2"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* IMAGEM */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  URL da Imagem
                </label>
                <input
                  type="text"
                  name="ImageData"
                  value={formData.ImageData}
                  onChange={handleInputChange}
                  placeholder="Cole a URL da imagem aqui"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {formData.ImageData && (
                  <img
                    src={formData.ImageData}
                    alt="Preview"
                    className="mt-4 h-32 object-contain"
                  />
                )}
              </div>

              {/* BOTÕES */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                >
                  {editingId ? "Atualizar" : "Criar"} Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABELA DE PRODUTOS */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-800">Código</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-800">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-800">Categoria</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-800">Linha</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-800">Especificações</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-slate-800">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.ProductID} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">
                    {product.ProductCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {product.ProductName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {product.Category}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {product.Line}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {product.TechnicalSpecs?.substring(0, 30)}...
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.ProductID || "")}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Nenhum produto encontrado
          </div>
        )}
      </div>

      {/* RODAPÉ */}
      <div className="text-center text-slate-500 text-sm">
        Total: {filteredProducts.length} de {products.length} produtos
      </div>
    </div>
  );
};

export default AdminProducts;