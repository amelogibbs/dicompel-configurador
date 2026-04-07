import React, { useState } from "react";

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("📝 Tentando fazer login...");
      console.log("Email:", email);
      console.log("Senha:", password);

      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      console.log("✅ Resposta recebida:", response.status);

      const data = await response.json();

      console.log("📦 Dados da resposta:", data);

      if (data.success) {
        console.log("✅ Login bem-sucedido!");
        console.log("Usuário:", data.user);

        // Salvar no localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        // Chamar callback
        onLogin(data.user);
      } else {
        console.log("❌ Login falhou:", data.message);
        setError(data.message || "Erro ao fazer login");
      }
    } catch (err: any) {
      console.error("❌ Erro na requisição:", err);
      setError(err.message || "Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-md">
        {/* LOGO */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">LI</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">DICOMPEL</h1>
            <p className="text-slate-500 text-xs">Configurador de Produtos</p>
          </div>
        </div>

        {/* TÍTULO */}
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
          Área do Representante
        </h2>

        {/* FORMULÁRIO */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* MENSAGEM DE ERRO */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center font-semibold">
              ❌ {error}
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              E-mail
            </label>
            <input
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>

          {/* SENHA */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Senha
            </label>
            <input
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              placeholder="Digite sua senha"
              disabled={loading}
            />
          </div>

          {/* BOTÃO ENTRAR */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold uppercase transition-colors text-white ${
              loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "⏳ Entrando..." : "🔓 Entrar"}
          </button>
        </form>

        {/* INFORMAÇÕES DE TESTE */}
        <div className="mt-8 p-4 bg-slate-100 rounded-lg border border-slate-300">
          <p className="text-xs font-bold text-slate-700 mb-2">📝 Dados de Teste:</p>
          <p className="text-xs text-slate-600">
            <strong>Email:</strong> admin@dicompel.com.br
          </p>
          <p className="text-xs text-slate-600">
            <strong>Senha:</strong> admin123
          </p>
        </div>

        {/* FOOTER */}
        <p className="text-center text-slate-500 text-xs mt-6">
          © 2026 DICOMPEL - Todos os direitos reservados
        </p>
      </div>
    </div>
  );
};

export default Login;