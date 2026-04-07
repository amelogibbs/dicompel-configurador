import React, { useState } from 'react';
import { Search, Info } from 'lucide-react';

interface Step1Props {
  products: any[];
  onModuleAdd: (module: any) => void;
  onNext: () => void;
}

const Step1_ModuleSelection = ({ products, onModuleAdd, onNext }: Step1Props) => {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedAmperage, setSelectedAmperage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModules, setSelectedModules] = useState<any[]>([]);

  const modules = products.filter(
    (p: any) => p.Category?.toLowerCase() !== 'placa'
  );

  let filteredModules = modules.filter((m: any) => {
    if (searchTerm && !m.ProductCode?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !m.ProductName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedColor && !m.ProductName?.includes(selectedColor)) return false;
    if (selectedAmperage && !m.ProductName?.includes(selectedAmperage)) return false;
    return true;
  });

  const colors = [...new Set(modules.map((m: any) => m.ProductName?.match(/\b(Branco|Preto|Cinza|Bege)\b/)?.[0]).filter(Boolean))];
  const amperages = [...new Set(modules.map((m: any) => m.ProductName?.match(/\b(\d+A)\b/)?.[0]).filter(Boolean))];

  const handleAddModule = (module: any) => {
    const newModule = {
      productId: module.ProductID,
      productCode: module.ProductCode,
      productName: module.ProductName,
      color: selectedColor || 'Padrão',
      amperage: selectedAmperage || 'Padrão',
      quantity: 1
    };
    onModuleAdd(newModule);
    setSelectedModules([...selectedModules, newModule]);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Passo 1: Escolha os Módulos</h2>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Código ou nome do produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Cor</label>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
          >
            <option value="">Todas as cores</option>
            {colors.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Amperagem</label>
          <select
            value={selectedAmperage}
            onChange={(e) => setSelectedAmperage(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
          >
            <option value="">Todas as amperagens</option>
            {amperages.map((amp) => (
              <option key={amp} value={amp}>{amp}</option>
            ))}
          </select>
        </div>
      </div>

      {/* GRID DE MÓDULOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredModules.map((module) => (
          <div key={module.ProductID} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* BADGES */}
            <div className="relative p-4 bg-slate-50">
              <div className="flex gap-2 flex-wrap">
                <div className="bg-slate-800 text-white px-3 py-1 rounded text-xs font-bold">
                  {module.ProductCode}
                </div>
                {module.TechnicalSpecs && (
                  <div className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">
                    {module.TechnicalSpecs.match(/\d+A/)?.[0] || "N/A"}
                  </div>
                )}
              </div>
              <button className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-slate-100">
                <Info className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            {/* IMAGEM */}
            <div className="h-32 bg-slate-100 flex items-center justify-center p-4">
              {module.ImageData ? (
                <img src={module.ImageData} alt={module.ProductCode} className="h-full w-full object-contain" />
              ) : (
                <div className="text-slate-400 text-sm">Sem imagem</div>
              )}
            </div>

            {/* CONTEÚDO */}
            <div className="p-4 space-y-3">
              <p className="text-blue-600 font-bold text-sm">NOVARA</p>
              <p className="text-slate-800 text-sm font-semibold line-clamp-2">{module.ProductName}</p>

              {/* BOTÕES */}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-bold text-sm hover:bg-slate-50 flex items-center justify-center gap-2">
                  <Info className="h-4 w-4" />
                  DETALHES
                </button>
                <button
                  onClick={() => handleAddModule(module)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                >
                  <span>+</span>
                  ADICIONAR
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">Nenhum módulo encontrado</p>
        </div>
      )}

      {/* BOTÃO PRÓXIMO */}
      <div className="flex gap-4 pt-4 border-t">
        <button
          onClick={onNext}
          disabled={selectedModules.length === 0}
          className={`flex-1 h-10 font-bold uppercase tracking-widest rounded-lg transition-colors ${
            selectedModules.length === 0
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Próximo: Escolher Placa →
        </button>
      </div>
    </div>
  );
};

export default Step1_ModuleSelection;