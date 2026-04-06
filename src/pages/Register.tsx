import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MailIcon,
  LockIcon,
  UserIcon,
  StoreIcon } from
'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { authApi } from '../api/auth';
export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.register(formData);
      toast.success('Restaurante registrado com sucesso!');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao registrar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="HeyChef" className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Criar Conta
          </h1>
          <p className="text-text-secondary mt-2">
            Comece a usar o HeyChef hoje mesmo
          </p>
        </div>

        <Card className="shadow-xl shadow-black/5 border-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nome do Restaurante"
              name="organizationName"
              placeholder="Ex: Burger House"
              value={formData.organizationName}
              onChange={handleChange}
              leftIcon={<StoreIcon className="w-5 h-5" />}
              required />
            

            <Input
              label="Seu Nome"
              name="name"
              placeholder="João Silva"
              value={formData.name}
              onChange={handleChange}
              leftIcon={<UserIcon className="w-5 h-5" />}
              required />
            

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<MailIcon className="w-5 h-5" />}
              required />
            

            <Input
              label="Senha"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              leftIcon={<LockIcon className="w-5 h-5" />}
              required
              minLength={8} />
            

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}>
                
                Criar minha conta
              </Button>
            </div>

            <p className="text-xs text-text-muted text-center mt-4">
              Ao se registrar, você concorda com nossos Termos de Serviço e
              Política de Privacidade.
            </p>
          </form>
        </Card>

        <p className="text-center mt-8 text-text-secondary text-sm">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="text-primary hover:text-primary-hover font-medium">
            
            Fazer login
          </Link>
        </p>
      </div>
    </div>);

}