import React, { useState, useEffect } from 'react';
import { ChevronRight, ShoppingCart, RotateCcw } from 'lucide-react';
import { productService } from '../services/api';
import Step1_PlateSelection from './NovaraWizard/Step1_PlateSelection';
import Step2_ModuleSelection from './NovaraWizard/Step2_ModuleSelection';
import Step3_Summary from './NovaraWizard/Step3_Summary';
import { Button } from './Button';

interface SelectedModule {
  productId: string;
  productCode: string;
  productName: string;
  color: string;
  amperage: string;
  quantity: number;
}

interface KitAssembly {
  plate: any;
  modules: SelectedModule[];
}

export const NovaraWizard = ({ navigate }: { navigate: (page: string) => void }) => {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kit, setKit] = useState<KitAssembly>({
    plate: null,
    modules: []
  });

  // Carregar produtos Novara
  useEffect(() => {
    loadNovaraProducts();
  }, []);

  const loadNovaraProducts = async () => {
    try {
      const allProducts = await productService.getAll();
      // Filtrar apenas produtos da linha Novara
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

  const handlePlateSelect = (plate: any) => {
    setKit({ ...kit, plate });
    setStep(2);
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

  const handleAddToCart = () => {
    console.log("Kit montado:", kit);
    // Aqui você implementará a lógica de adicionar ao carrinho
    alert("Kit adicionado ao carrinho!");
  };

  const handleReset = () => {
    setKit({ plate: null, modules: [] });
    setStep(1);
  };

  if (loading) {
    return <div className="text-center py-12">Carregando produtos...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">
            🔧 Montador Novara
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Monte sua tomada escolhendo placa, módulos, cores e amperagem
          </p>
        </div>

        <button
          onClick={() => navigate('catalog')}
          className="text-slate-500 hover:text-slate-800 font-bold"
        >
          ← Voltar
        </button>
      </div>

      {/* PROGRESS INDICATOR */}
      <div className="flex items-center gap-4">
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
        <span>Passo 1: Placa</span>
        <span>Passo 2: Módulos</span>
        <span>Passo 3: Resumo</span>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN CONTENT */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <Step1_PlateSelection
              products={products}
              onSelect={handlePlateSelect}
            />
          )}

          {step === 2 && (
            <Step2_ModuleSelection
              products={products}
              selectedPlate={kit.plate}
              onModuleAdd={handleModuleAdd}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <Step3_Summary
              kit={kit}
              onModuleRemove={handleModuleRemove}
              onQuantityChange={handleModuleQuantityChange}
              onBack={() => setStep(2)}
            />
          )}
        </div>

        {/* SIDEBAR - KIT PREVIEW */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border shadow-sm sticky top-4 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">📦 Seu Kit</h3>

            {/* PLACA SELECIONADA */}
            {kit.plate ? (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-bold text-blue-900">PLACA</p>
                <p className="text-sm font-bold text-slate-800">
                  {kit.plate.ProductCode}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {kit.plate.ProductName}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 rounded-lg border border-dashed border-slate-300 text-center">
                <p className="text-xs text-slate-500">Nenhuma placa selecionada</p>
              </div>
            )}

            {/* MÓDULOS SELECIONADOS */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-600">MÓDULOS ({kit.modules.length})</p>
              {kit.modules.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">
                  Nenhum módulo adicionado
                </p>
              ) : (
                kit.modules.map((mod, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded border text-xs">
                    <p className="font-bold text-slate-800">{mod.productCode}</p>
                    <p className="text-slate-600">
                      {mod.color} • {mod.amperage}
                    </p>
                    <p className="text-slate-500">Qtd: {mod.quantity}</p>
                  </div>
                ))
              )}
            </div>

            {/* BOTÕES */}
            <div className="space-y-2 pt-4 border-t">
              {kit.plate && kit.modules.length > 0 && (
                <>
                  <Button
                    onClick={handleAddToCart}
                    className="w-full h-10 font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Adicionar ao Carrinho
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="secondary"
                    className="w-full h-10 font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Recomeçar
                  </Button>
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