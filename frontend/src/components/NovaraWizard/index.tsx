import React, { useState, useEffect } from 'react';
import { ShoppingCart, RotateCcw, Search, Info } from 'lucide-react';
import { productService } from '../../services/api';
import Step1_ModuleSelection from './Step1_ModuleSelection';
import Step2_PlateSelection from './Step2_PlateSelection';
import Step3_Summary from './Step3_Summary';

interface SelectedModule {
  productId: string;
  productCode: string;
  productName: string;
  color: string;
  amperage: string;
  quantity: number;
}

interface KitAssembly {
  modules: SelectedModule[];
  plate: any;
}

const NovaraWizard = ({ navigate }: { navigate: (page: string) => void }) => {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kit, setKit] = useState<KitAssembly>({
    modules: [],
    plate: null
  });

  useEffect(() => {
    loadNovaraProducts();
  }, []);

  const loadNovaraProducts = async () => {
    try {
      const allProducts = await productService.getAll();
      const novaraProducts = allProducts.filter(
        (p: any) => p.Line?.toLowerCase() === 'novara'
      );
      setProducts(novaraProducts);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      setLoading(false);
    }
  };

  const handleModuleAdd = (module: SelectedModule) => {
    setKit({
      ...kit,
      modules: [...kit.modules, { ...module, quantity: 1 }]
    });
  };

  const handleModuleRemove = (index: number) => {
    setKit({
      ...kit,
      modules: kit.modules.filter((_, i) => i !== index)
    });
  };

  const handleModuleQuantityChange = (index: number, quantity: number) => {
    const newModules = [...kit.modules];
    newModules[index].quantity = quantity;
    setKit({ ...kit, modules: newModules });
  };

  const handlePlateSelect = (plate: any) => {
    setKit({ ...kit, plate });
    setStep(3);
  };

  const handleAddToCart = () => {
    console.log("Kit montado:", kit);
    alert("Kit adicionado ao carrinho!");
  };

  const handleReset = () => {
    setKit({ modules: [], plate: null });
    setStep(1);
  };

  if (loading) {
    return <div className="text-center py-12 text-white">Carregando produtos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">
            🔧 Monte Sua Novara
          </h1>
          <button
            onClick={() => navigate('catalog')}
            className="text-slate-500 hover:text-slate-800 font-bold"
          >
            ← Voltar
          </button>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="flex items-center gap-4 mb-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  s === step
                    ? 'bg-blue-600 text-white scale-110'
                    : s < step
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 transition-all ${
                    s < step ? 'bg-green-600' : 'bg-slate-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* STEP LABELS */}
        <div className="flex justify-between text-sm font-bold text-slate-600">
          <span>Passo 1: Módulos</span>
          <span>Passo 2: Placa</span>
          <span>Passo 3: Resumo</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* MAIN CONTENT */}
        <div className="lg:col-span-3">
          {step === 1 && (
            <Step1_ModuleSelection
              products={products}
              onModuleAdd={handleModuleAdd}
              onNext={() => kit.modules.length > 0 && setStep(2)}
            />
          )}

          {step === 2 && (
            <Step2_PlateSelection
              products={products}
              onSelect={handlePlateSelect}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3_Summary
              kit={kit}
              onModuleRemove={handleModuleRemove}
              onQuantityChange={handleModuleQuantityChange}
              onBack={() => setStep(2)}
              onAddToCart={handleAddToCart}
              onReset={handleReset}
            />
          )}
        </div>

        {/* SIDEBAR - KIT PREVIEW */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-lg sticky top-4 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">📦 Seu Kit</h3>

            {/* MÓDULOS */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-600">MÓDULOS ({kit.modules.length})</p>
              {kit.modules.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">
                  Nenhum módulo
                </p>
              ) : (
                kit.modules.map((mod, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded border text-xs">
                    <p className="font-bold text-slate-800">{mod.productCode}</p>
                    <p className="text-slate-600">{mod.color} • {mod.amperage}</p>
                    <p className="text-slate-500">Qtd: {mod.quantity}</p>
                  </div>
                ))
              )}
            </div>

            {/* PLACA */}
            {kit.plate ? (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-bold text-green-900">PLACA</p>
                <p className="text-sm font-bold text-slate-800">{kit.plate.ProductCode}</p>
                <p className="text-xs text-slate-600 mt-1">{kit.plate.ProductName}</p>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 rounded-lg border border-dashed border-slate-300 text-center">
                <p className="text-xs text-slate-500">Nenhuma placa</p>
              </div>
            )}

            {/* BOTÕES */}
            <div className="space-y-2 pt-4 border-t">
              {kit.plate && kit.modules.length > 0 && (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full h-10 font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    + ADICIONAR
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full h-10 font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors text-sm"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Recomeçar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovaraWizard;