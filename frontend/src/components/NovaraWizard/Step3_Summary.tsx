import React from 'react';
import { X, ShoppingCart, RotateCcw, Info } from 'lucide-react';

interface Step3Props {
  kit: any;
  onModuleRemove: (index: number) => void;
  onQuantityChange: (index: number, quantity: number) => void;
  onBack: () => void;
  onAddToCart: () => void;
  onReset: () => void;
}

const Step3_Summary = ({
  kit,
  onModuleRemove,
  onQuantityChange,
  onBack,
  onAddToCart,
  onReset
}: Step3Props) => {
  const totalItems = kit.modules.reduce((sum: number, m: any) => sum + m.quantity, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Passo 3: Resumo do Kit Montado</h2>

      {/* PLACA BASE */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <p className="text-xs font-bold text-green-900 mb-2">PLACA BASE</p>
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-slate-800">{kit.plate.ProductCode}</p>
            <p className="text-sm text-slate-600">{kit.plate.ProductName}</p>
          </div>
          {kit.plate.ImageData && (
            <img src={kit.plate.ImageData} alt="placa" className="w-20 h-20 object-contain" />
          )}
        </div>
      </div>

      {/* MÓDULOS */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-slate-700">MÓDULOS ADICIONADOS ({totalItems})</p>
        {kit.modules.map((module: any, idx: number) => (
          <div key={idx} className="p-4 bg-slate-50 rounded-lg border flex justify-between items-start">
            <div className="flex-1">
              <p className="font-bold text-slate-800">{module.productCode}</p>
              <p className="text-sm text-slate-600">{module.productName}</p>
              <p className="text-xs text-slate-500 mt-1">{module.color} • {module.amperage}</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={module.quantity}
                onChange={(e) => onQuantityChange(idx, parseInt(e.target.value))}
                className="w-12 px-2 py-1 border rounded text-center"
              />
              <button
                onClick={() => onModuleRemove(idx)}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* BOTÕES */}
      <div className="flex gap-4 pt-4 border-t">
        <button
          onClick={onBack}
          className="flex-1 h-10 font-bold uppercase tracking-widest bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors"
        >
          ← Voltar
        </button>
        <button
          onClick={onAddToCart}
          className="flex-1 h-10 font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          + ADICIONAR
        </button>
        <button
          onClick={onReset}
          className="flex-1 h-10 font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Recomeçar
        </button>
      </div>
    </div>
  );
};

export default Step3_Summary;