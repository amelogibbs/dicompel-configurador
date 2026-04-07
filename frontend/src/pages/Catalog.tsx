import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, X, Package, Filter, ChevronDown, ChevronUp } from "lucide-react";

interface Product {
  ProductID: string;
  ProductCode: string;
  ProductName: string;
  Category: string;
  Brand: string;
  Line: string;
  TechnicalSpecs: string;
  ImageData: string;
  imageUrl: string;
}

interface CatalogProps {
  setCartCount: (count: number) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ setCartCount }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedLine, setSelectedLine] = useState("Todas");
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [categories, setCategories] = useState<string[]>([]);
  const [lines, setLines] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState("nome");

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, selectedLine, selectedBrand, sortBy, products]);

  const loadProducts = async () => {
    try {
      console.log("📦 Carregando produtos...");
      const response = await fetch("http://127.0.0.1:8000/products");
      const data = await response.json();

      console.log("Produtos carregados:", data.length);

      setProducts(data);

      // Extrair categorias, linhas e marcas únicas
      const uniqueCategories = [
        "Todas",
        ...new Set(data.map((p: Product) => p.Category).filter(Boolean)),
      ];
      const uniqueLines = [
        "Todas",
        ...new Set(data.map((p: Product) => p.Line).filter(Boolean)),
      ];
      const uniqueBrands = [
        "Todas",
        ...new Set(data.map((p: Product) => p.Brand).filter(Boolean)),
      ];

      setCategories(uniqueCategories);
      setLines(uniqueLines);
      setBrands(uniqueBrands);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.ProductCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.Brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoria
    if (selectedCategory !== "Todas") {
      filtered = filtered.filter((p) => p.Category === selectedCategory);
    }

    // Filtrar por linha
    if (selectedLine !== "Todas") {
      filtered = filtered.filter((p) => p.Line === selectedLine);
    }

    // Filtrar por marca
    if (selectedBrand !== "Todas") {
      filtered = filtered.filter((p) => p.Brand === selectedBrand);
    }

    // Ordenar
    if (sortBy === "nome") {
      filtered.sort((a, b) => a.ProductName.localeCompare(b.ProductName));
    } else if (sortBy === "codigo") {
      filtered.sort((a, b) => a.ProductCode.localeCompare(b.ProductCode));
    } else if (sortBy === "marca") {
      filtered.sort((a, b) => a.Brand.localeCompare(b.Brand));
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const existingItem = cart.find((item: any) => item.id === product.ProductID);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: product.ProductID,
          code: product.ProductCode,
          name: product.ProductName,
          quantity: 1,
          price: 0,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      setCartCount(cart.length);

      alert(`✅ ${product.ProductCode} adicionado ao carrinho!`);
    } catch (err) {
      console.error("Erro ao adicionar ao carrinho:", err);
      alert("Erro ao adicionar ao carrinho");
    }
  };

  const handleShowDetails = (product: Product) => {
    console.log("📋 Mostrando detalhes do produto:", product.ProductCode);
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Todas");
    setSelectedLine("Todas");
    setSelectedBrand("Todas");
    setSortBy("nome");
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedCategory !== "Todas" ||
    selectedLine !== "Todas" ||
    selectedBrand !== "Todas";

  if (loading) {
    return <div className="text-center py-12 text-white">Carregando produtos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">
          <Package className="inline mr-2 h-8 w-8" />
          Catálogo de Produtos
        </h1>
      </div>

      {/* BUSCA E FILTROS */}
      <div className="bg-white rounded-lg p-6 shadow-lg space-y-4">
        {/* BUSCA PRINCIPAL */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Código, nome ou marca do produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* BOTÃO FILTROS AVANÇADOS */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold transition-colors"
        >
          <Filter className="h-5 w-5" />
          Filtros Avançados
          {showAdvancedFilters ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* FILTROS AVANÇADOS (EXPANDIDO) */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            {/* CATEGORIA */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                📁 Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* LINHA */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                📦 Linha
              </label>
              <select
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {lines.map((line) => (
                  <option key={line} value={line}>
                    {line}
                  </option>
                ))}
              </select>
            </div>

            {/* MARCA */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                🏷️ Marca
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* ORDENAR */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                ↕️ Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="nome">Nome (A-Z)</option>
                <option value="codigo">Código</option>
                <option value="marca">Marca</option>
              </select>
            </div>
          </div>
        )}

        {/* RESULTADO E BOTÃO LIMPAR */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-slate-600">
            Mostrando <span className="font-bold">{filteredProducts.length}</span> de{" "}
            <span className="font-bold">{products.length}</span> produtos
          </p>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-bold text-sm transition-colors"
            >
              ✕ Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* GRID DE PRODUTOS */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg p-12 shadow-lg text-center space-y-4">
          <Package className="h-16 w-16 mx-auto text-slate-300" />
          <h2 className="text-2xl font-bold text-slate-800">
            Nenhum produto encontrado
          </h2>
          <p className="text-slate-600">
            Tente ajustar seus filtros ou termos de busca.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold uppercase transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.ProductID}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* IMAGEM */}
              <div className="relative bg-slate-100 h-48 flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.ProductName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-24 w-24 text-slate-300" />
                )}

                {/* CÓDIGO DO PRODUTO */}
                <div className="absolute top-2 left-2 bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold">
                  {product.ProductCode}
                </div>
              </div>

              {/* CONTEÚDO */}
              <div className="p-4 space-y-3">
                {/* MARCA */}
                <p className="text-sm font-bold text-blue-600">
                  {product.Brand || "N/A"}
                </p>

                {/* NOME */}
                <h3 className="font-bold text-slate-800 line-clamp-2">
                  {product.ProductName}
                </h3>

                {/* CATEGORIA E LINHA */}
                <div className="text-xs text-slate-600 space-y-1">
                  {product.Category && <p>📁 {product.Category}</p>}
                  {product.Line && <p>📦 {product.Line}</p>}
                </div>

                {/* BOTÕES */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleShowDetails(product)}
                    className="flex-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    👁️ Detalhe
                  </button>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE DETALHES */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            {/* HEADER DO MODAL */}
            <div className="sticky top-0 bg-blue-600 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Detalhes do Produto</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* CONTEÚDO DO MODAL */}
            <div className="p-6 space-y-6">
              {/* IMAGEM */}
              {selectedProduct.imageUrl && (
                <div className="bg-slate-100 rounded-lg p-4 flex items-center justify-center h-48">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.ProductName}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}

              {/* INFORMAÇÕES */}
              <div className="space-y-4">
                {/* CÓDIGO */}
                <div className="border-b pb-4">
                  <p className="text-xs font-bold text-slate-600 uppercase">
                    Código do Produto
                  </p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {selectedProduct.ProductCode}
                  </p>
                </div>

                {/* NOME */}
                <div className="border-b pb-4">
                  <p className="text-xs font-bold text-slate-600 uppercase">
                    Nome
                  </p>
                  <p className="text-lg font-bold text-slate-800 mt-1">
                    {selectedProduct.ProductName}
                  </p>
                </div>

                {/* MARCA */}
                <div className="border-b pb-4">
                  <p className="text-xs font-bold text-slate-600 uppercase">
                    Marca
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {selectedProduct.Brand || "N/A"}
                  </p>
                </div>

                {/* CATEGORIA */}
                {selectedProduct.Category && (
                  <div className="border-b pb-4">
                    <p className="text-xs font-bold text-slate-600 uppercase">
                      Categoria
                    </p>
                    <p className="text-lg font-bold text-slate-800 mt-1">
                      {selectedProduct.Category}
                    </p>
                  </div>
                )}

                {/* LINHA */}
                {selectedProduct.Line && (
                  <div className="border-b pb-4">
                    <p className="text-xs font-bold text-slate-600 uppercase">
                      Linha
                    </p>
                    <p className="text-lg font-bold text-slate-800 mt-1">
                      {selectedProduct.Line}
                    </p>
                  </div>
                )}

                {/* ESPECIFICAÇÕES TÉCNICAS */}
                {selectedProduct.TechnicalSpecs && (
                  <div className="border-b pb-4">
                    <p className="text-xs font-bold text-slate-600 uppercase">
                      Especificações Técnicas
                    </p>
                    <p className="text-slate-800 mt-2 whitespace-pre-wrap">
                      {selectedProduct.TechnicalSpecs}
                    </p>
                  </div>
                )}
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    handleCloseModal();
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Adicionar ao Carrinho
                </button>

                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold uppercase transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;