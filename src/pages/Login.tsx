import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MailIcon, LockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Login realizado com sucesso!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error('Email ou senha incorretos');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="HeyChef" className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            HeyChef
          </h1>
          <p className="text-text-secondary mt-2">
            Gestão inteligente para seu restaurante
          </p>
        </div>

        <Card className="shadow-xl shadow-black/5 border-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<MailIcon className="w-5 h-5" />}
              required />
            

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<LockIcon className="w-5 h-5" />}
              required />
            

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary" />
                
                <span className="text-text-secondary">Lembrar-me</span>
              </label>
              <a
                href="#"
                className="text-primary hover:text-primary-hover font-medium">
                
                Esqueceu a senha?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}>
              
              Entrar no painel
            </Button>
          </form>
        </Card>

        <p className="text-center mt-8 text-text-secondary text-sm">
          Ainda não tem uma conta?{' '}
          <Link
            to="/register"
            className="text-primary hover:text-primary-hover font-medium">
            
            Registre seu restaurante
          </Link>
        </p>

        <div className="mt-8 text-center text-xs text-text-muted">
          <p>Dica: Use qualquer email/senha para testar o protótipo</p>
        </div>
      </div>
    </div>);

}