import React from 'react';
import { Info } from 'lucide-react';

interface Step2Props {
  products: any[];
  onSelect: (plate: any) => void;
  onBack: () => void;
}

const Step2_PlateSelection = ({ products, onSelect, onBack }: Step2Props) => {
  const plates = products.filter(
    (p: any) => p.Category?.toLowerCase() === 'placa'
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Passo 2: Escolha a Placa</h2>

      {/* GRID DE PLACAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plates.map((plate) => (
          <div
            key={plate.ProductID}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => onSelect(plate)}
          >
            {/* BADGES */}
            <div className="relative p-4 bg-slate-50">
              <div className="flex gap-2 flex-wrap">
                <div className="bg-slate-800 text-white px-3 py-1 rounded text-xs font-bold">
                  {plate.ProductCode}
                </div>
              </div>
              <button className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-slate-100">
                <Info className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            {/* IMAGEM */}
            <div className="h-32 bg-slate-100 flex items-center justify-center p-4">
              {plate.ImageData ? (
                <img src={plate.ImageData} alt={plate.ProductCode} className="h-full w-full object-contain" />
              ) : (
                <div className="text-slate-400 text-sm">Sem imagem</div>
              )}
            </div>

            {/* CONTEÚDO */}
            <div className="p-4 space-y-3">
              <p className="text-blue-600 font-bold text-sm">NOVARA</p>
              <p className="text-slate-800 text-sm font-semibold line-clamp-2">{plate.ProductName}</p>

              {/* BOTÕES */}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-bold text-sm hover:bg-slate-50 flex items-center justify-center gap-2">
                  <Info className="h-4 w-4" />
                  DETALHES
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(plate);
                  }}
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

      {plates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">Nenhuma placa encontrada</p>
        </div>
      )}

      {/* BOTÕES DE NAVEGAÇÃO */}
      <div className="flex gap-4 pt-4 border-t">
        <button
          onClick={onBack}
          className="flex-1 h-10 font-bold uppercase tracking-widest bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors"
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
};

export default Step2_PlateSelection;