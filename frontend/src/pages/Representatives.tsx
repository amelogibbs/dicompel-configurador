import React, { useState, useEffect } from "react";
import { Users, Plus, Edit2, Trash2, Eye, EyeOff, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface Representative {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  regiao: string;
  comissao: number;
  ativo: boolean;
  criado_em: string;
}

interface RepresentativesProps {
  user: any;
}

const Representatives: React.FC<RepresentativesProps> = ({ user }) => {
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRep, setEditingRep] = useState<Representative | null>(null);
  const [expandedRep, setExpandedRep] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    regiao: "",
    comissao: 0,
    senha: "",
  });

  useEffect(() => {
    loadRepresentatives();
  }, []);

  const loadRepresentatives = async () => {
    try {
      console.log("📋 Carregando representantes...");
      setLoading(true);
      setError(null);

      const response = await fetch("http://127.0.0.1:8000/representatives");

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      console.log("✅ Representantes carregados:", data);

      if (Array.isArray(data)) {
        setRepresentatives(data);
      } else {
        setError("Formato de resposta inválido");
      }

      setLoading(false);
    } catch (err: any) {
      console.error("❌ Erro ao carregar representantes:", err);
      setError(err.message || "Erro ao carregar representantes");
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "comissao" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.telefone || !formData.regiao) {
      alert("❌ Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      console.log("📝 Salvando representante...");

      const url = editingRep
        ? `http://127.0.0.1:8000/representatives/${editingRep.id}`
        : "http://127.0.0.1:8000/representatives";

      const method = editingRep ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingRep ? "✅ Representante atualizado!" : "✅ Representante cadastrado!");
        setFormData({
          nome: "",
          email: "",
          telefone: "",
          regiao: "",
          comissao: 0,
          senha: "",
        });
        setEditingRep(null);
        setShowForm(false);
        loadRepresentatives();
      } else {
        alert("❌ Erro: " + data.message);
      }
    } catch (err) {
      console.error("Erro ao salvar representante:", err);
      alert("Erro ao salvar representante");
    }
  };

  const handleEdit = (rep: Representative) => {
    setEditingRep(rep);
    setFormData({
      nome: rep.nome,
      email: rep.email,
      telefone: rep.telefone,
      regiao: rep.regiao,
      comissao: rep.comissao,
      senha: "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este representante?")) {
      return;
    }

    try {
      console.log("🗑️  Deletando representante:", id);

      const response = await fetch(`http://127.0.0.1:8000/representatives/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Representante deletado!");
        loadRepresentatives();
      } else {
        alert("❌ Erro: " + data.message);
      }
    } catch (err) {
      console.error("Erro ao deletar representante:", err);
      alert("Erro ao deletar representante");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRep(null);
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      regiao: "",
      comissao: 0,
      senha: "",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-white mt-4">Carregando representantes...</p>
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
              <Users className="inline mr-2 h-8 w-8" />
              Representantes
            </h1>
            <p className="text-slate-600 mt-2">
              Total: <span className="font-bold">{representatives.length}</span>
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            {showForm ? "Cancelar" : "Novo Representante"}
          </button>
        </div>
      </div>

      {/* MENSAGEM DE ERRO */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-bold">Erro ao carregar representantes</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* FORMULÁRIO */}
      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow-lg space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">
            {editingRep ? "Editar Representante" : "Novo Representante"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NOME */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Nome completo"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* TELEFONE */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* REGIÃO */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Região *
                </label>
                <input
                  type="text"
                  name="regiao"
                  value={formData.regiao}
                  onChange={handleInputChange}
                  placeholder="Ex: Sul, Sudeste, Nordeste"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* COMISSÃO */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Comissão (%) *
                </label>
                <input
                  type="number"
                  name="comissao"
                  value={formData.comissao}
                  onChange={handleInputChange}
                  placeholder="5.5"
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* SENHA */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Senha {editingRep ? "(deixe em branco para manter)" : "*"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    placeholder="Digite a senha"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!editingRep}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-600 hover:text-slate-800"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold uppercase transition-colors"
              >
                💾 {editingRep ? "Atualizar" : "Cadastrar"}
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

      {/* LISTA DE REPRESENTANTES */}
      {representatives.length === 0 ? (
        <div className="bg-white rounded-lg p-12 shadow-lg text-center space-y-4">
          <Users className="h-16 w-16 mx-auto text-slate-300" />
          <h2 className="text-2xl font-bold text-slate-800">
            Nenhum representante cadastrado
          </h2>
          <p className="text-slate-600">
            Clique em "Novo Representante" para adicionar um.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {representatives.map((rep) => (
            <div
              key={rep.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {/* HEADER */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* NOME */}
                      <div>
                        <p className="text-sm font-bold text-slate-600 uppercase">
                          Representante
                        </p>
                        <p className="text-2xl font-bold text-slate-800">
                          {rep.nome}
                        </p>
                      </div>

                      {/* REGIÃO */}
                      <div className="border-l border-slate-300 pl-4">
                        <p className="text-sm font-bold text-slate-600 uppercase">
                          Região
                        </p>
                        <p className="text-slate-800 font-bold mt-1">
                          {rep.regiao}
                        </p>
                      </div>

                      {/* COMISSÃO */}
                      <div className="border-l border-slate-300 pl-4">
                        <p className="text-sm font-bold text-slate-600 uppercase">
                          Comissão
                        </p>
                        <p className="text-slate-800 font-bold mt-1">
                          {rep.comissao}%
                        </p>
                      </div>

                      {/* STATUS */}
                      <div className="border-l border-slate-300 pl-4">
                        <p className="text-sm font-bold text-slate-600 uppercase">
                          Status
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-1 ${
                            rep.ativo
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {rep.ativo ? "✅ Ativo" : "❌ Inativo"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BOTÕES */}
                  <div className="flex gap-2 flex-wrap">
                    {/* BOTÃO DETALHE */}
                    <button
                      onClick={() => {
                        if (expandedRep === rep.id) {
                          setExpandedRep(null);
                        } else {
                          setExpandedRep(rep.id);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap text-sm ${
                        expandedRep === rep.id
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                      }`}
                    >
                      {expandedRep === rep.id ? "Ocultar" : "Detalhe"}
                      {expandedRep === rep.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {/* BOTÃO EDITAR */}
                    <button
                      onClick={() => handleEdit(rep)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      Editar
                    </button>

                    {/* BOTÃO DELETAR */}
                    <button
                      onClick={() => handleDelete(rep.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold uppercase transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar
                    </button>
                  </div>
                </div>
              </div>

              {/* DETALHES (EXPANDIDO) */}
              {expandedRep === rep.id && (
                <div className="p-6 bg-slate-50 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Email
                      </p>
                      <p className="text-lg font-bold text-slate-800 mt-2">
                        {rep.email}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Telefone
                      </p>
                      <p className="text-lg font-bold text-slate-800 mt-2">
                        {rep.telefone}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Região
                      </p>
                      <p className="text-lg font-bold text-slate-800 mt-2">
                        {rep.regiao}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Comissão
                      </p>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        {rep.comissao}%
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Data de Cadastro
                      </p>
                      <p className="text-lg font-bold text-slate-800 mt-2">
                        {new Date(rep.criado_em).toLocaleDateString("pt-BR")}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Status
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 ${
                          rep.ativo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {rep.ativo ? "✅ Ativo" : "❌ Inativo"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Representatives;