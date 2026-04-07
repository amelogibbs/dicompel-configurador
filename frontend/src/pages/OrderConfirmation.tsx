import React, { useState, useEffect } from "react";
import { CheckCircle, Download, Eye, ArrowRight } from "lucide-react";

interface OrderConfirmationProps {
  orderData: {
    order_id: string;
    numero_pedido: string;
    totalItems: number;
    totalQuantity: number;
  } | null;
  navigate: (page: string) => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  orderData,
  navigate,
}) => {
  const [loading, setLoading] = useState(false);

  if (!orderData) {
    return (
      <div className="bg-white rounded-lg p-12 shadow-lg text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">
          Nenhum pedido para confirmar
        </h2>
        <button
          onClick={() => navigate("catalog")}
          className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold uppercase transition-colors"
        >
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    const content = `
CONFIRMAÇÃO DE PEDIDO
================================
Número do Pedido: ${orderData.numero_pedido}
ID do Pedido: ${orderData.order_id}
Total de Itens: ${orderData.totalItems}
Quantidade Total: ${orderData.totalQuantity}
Data: ${new Date().toLocaleDateString("pt-BR")}
Hora: ${new Date().toLocaleTimeString("pt-BR")}

================================
Seu pedido foi criado com sucesso!
Você pode acompanhá-lo em "Meus Pedidos"
    `;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute("download", `confirmacao-${orderData.numero_pedido}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* CARD DE SUCESSO */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-12 shadow-lg text-center space-y-6 border-2 border-green-200">
        {/* ÍCONE */}
        <div className="flex justify-center">
          <div className="relative">
            <CheckCircle className="h-24 w-24 text-green-600 animate-bounce" />
            <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping"></div>
          </div>
        </div>

        {/* TÍTULO */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-green-700">
            Pedido Confirmado! ✅
          </h1>
          <p className="text-lg text-green-600">
            Seu pedido foi criado com sucesso
          </p>
        </div>

        {/* DETALHES DO PEDIDO */}
        <div className="bg-white rounded-lg p-6 space-y-4 border border-green-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase">
                Número do Pedido
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {orderData.numero_pedido}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase">
                ID do Pedido
              </p>
              <p className="text-2xl font-bold text-slate-800">
                #{orderData.order_id}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase">
                Total de Itens
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {orderData.totalItems}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase">
                Quantidade Total
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {orderData.totalQuantity}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-slate-600">
              Data e Hora: {new Date().toLocaleDateString("pt-BR")} às{" "}
              {new Date().toLocaleTimeString("pt-BR")}
            </p>
          </div>
        </div>

        {/* PRÓXIMOS PASSOS */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 space-y-3">
          <h3 className="font-bold text-blue-900">📋 Próximos Passos:</h3>
          <ul className="text-left space-y-2 text-blue-800">
            <li className="flex items-center gap-2">
              <span className="text-lg">1️⃣</span>
              <span>Seu pedido foi enviado para o representante</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">2️⃣</span>
              <span>Você pode acompanhá-lo em "Meus Pedidos"</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">3️⃣</span>
              <span>O representante irá processar sua solicitação</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">4️⃣</span>
              <span>Você receberá uma confirmação quando aprovado</span>
            </li>
          </ul>
        </div>

        {/* BOTÕES */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center justify-center gap-2"
          >
            <Download className="h-5 w-5" />
            Baixar Confirmação
          </button>

          <button
            onClick={() => navigate("orders")}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="h-5 w-5" />
            Ver Meus Pedidos
          </button>

          <button
            onClick={() => navigate("catalog")}
            className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight className="h-5 w-5" />
            Continuar Comprando
          </button>
        </div>
      </div>

      {/* INFORMAÇÕES ADICIONAIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-lg space-y-3">
          <h3 className="font-bold text-slate-800">📧 Suporte</h3>
          <p className="text-sm text-slate-600">
            Dúvidas sobre seu pedido? Entre em contato com nosso suporte.
          </p>
          <a
            href="mailto:suporte@dicompel.com.br"
            className="text-blue-600 hover:text-blue-700 font-bold text-sm"
          >
            suporte@dicompel.com.br
          </a>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg space-y-3">
          <h3 className="font-bold text-slate-800">📞 Representante</h3>
          <p className="text-sm text-slate-600">
            Seu representante irá entrar em contato em breve.
          </p>
          <p className="text-blue-600 font-bold text-sm">
            Acompanhe em "Meus Pedidos"
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg space-y-3">
          <h3 className="font-bold text-slate-800">⏱️ Prazo</h3>
          <p className="text-sm text-slate-600">
            Seu pedido será processado em até 24 horas.
          </p>
          <p className="text-green-600 font-bold text-sm">✅ Confirmado</p>
        </div>
      </div>
    </div>
  );
};

export { OrderConfirmation };
export default OrderConfirmation;