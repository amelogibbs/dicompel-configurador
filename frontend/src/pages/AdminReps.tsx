import React, { useState } from 'react';
import { userService } from '../services/api';
import { Button } from '../components/Button';
import { Plus, Trash2 } from 'lucide-react';

export const AdminReps = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState<'REPRESENTANTE' | 'SUPERVISOR'>('REPRESENTANTE');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setMessage('Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      await userService.createRep({
        name,
        email,
        password,
        perfil
      });

      setMessage('✅ Representante criado com sucesso!');
      setName('');
      setEmail('');
      setPassword('');
      setPerfil('REPRESENTANTE');

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Erro ao criar representante');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Cadastrar Representante</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="João Silva"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="joao@dicompel.com"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Perfil
          </label>
          <select
            value={perfil}
            onChange={(e) => setPerfil(e.target.value as 'REPRESENTANTE' | 'SUPERVISOR')}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="REPRESENTANTE">Representante</option>
            <option value="SUPERVISOR">Supervisor</option>
          </select>
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-center font-bold ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          {loading ? 'Criando...' : 'Criar Representante'}
        </Button>
      </form>
    </div>
  );
};

export default AdminReps;