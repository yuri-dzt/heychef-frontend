import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MailIcon,
  LockIcon,
  UserIcon,
  KeyIcon,
  ShieldAlertIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error('VITE_API_URL environment variable is not set.');
}

export default function AdminSetup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    secretKey: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${apiUrl}/admin/setup`, {
        secretKey: formData.secretKey,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success('Administrador criado com sucesso! Redirecionando para login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        'Erro ao configurar administrador. Verifique a chave secreta e tente novamente.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-950 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <ShieldAlertIcon className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Configuração Inicial
          </h1>
          <p className="text-gray-400 mt-2 text-center">
            Criação do primeiro administrador da plataforma
          </p>
        </div>

        <Card className="shadow-2xl shadow-black/40 border border-gray-800 bg-gray-900">
          <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-xs text-red-300">
              Esta página só deve ser utilizada uma única vez, na configuração inicial
              da plataforma. Após criar o primeiro administrador, desative este endpoint.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nome"
              name="name"
              placeholder="Nome do administrador"
              value={formData.name}
              onChange={handleChange}
              leftIcon={<UserIcon className="w-5 h-5" />}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="admin@heychef.com"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<MailIcon className="w-5 h-5" />}
              required
            />

            <Input
              label="Senha"
              name="password"
              type="password"
              placeholder="Mínimo 4 caracteres"
              value={formData.password}
              onChange={handleChange}
              leftIcon={<LockIcon className="w-5 h-5" />}
              required
              minLength={4}
            />

            <Input
              label="Chave Secreta"
              name="secretKey"
              type="password"
              placeholder="SECRET_KEY configurada no backend"
              value={formData.secretKey}
              onChange={handleChange}
              leftIcon={<KeyIcon className="w-5 h-5" />}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                variant="danger"
                isLoading={isLoading}
              >
                Criar administrador
              </Button>
            </div>
          </form>
        </Card>

        <p className="text-center mt-8 text-gray-500 text-xs">
          Acesso restrito. Registre-se apenas se você tiver a chave secreta da plataforma.
        </p>
      </div>
    </div>
  );
}
