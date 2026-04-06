import React from 'react';
import { StoreIcon, CreditCardIcon, ShieldCheckIcon } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { formatDate } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';
export default function Settings() {
  const { user } = useAuth();
  // Mock Organization Data
  const organization = {
    name: 'Burger House',
    planExpiresAt: Date.now() + 1000 * 60 * 60 * 24 * 15,
    planName: 'Pro'
  };
  const isPlanActive = organization.planExpiresAt > Date.now();
  return (
    <PageContainer maxWidth="lg">
      <Header title="Configurações" />

      <div className="space-y-6">
        {/* Organization Info */}
        <Card>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="p-2 bg-primary-light text-primary rounded-lg">
              <StoreIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              Dados do Restaurante
            </h2>
          </div>

          <div className="space-y-4 max-w-md">
            <Input
              label="Nome do Restaurante"
              defaultValue={organization.name} />
            
            <Input label="CNPJ (Opcional)" placeholder="00.000.000/0000-00" />
            <Input label="Telefone" placeholder="(00) 00000-0000" />
            <Button className="mt-2">Salvar Alterações</Button>
          </div>
        </Card>

        {/* Subscription Plan */}
        <Card>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <CreditCardIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              Assinatura e Plano
            </h2>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-text-primary">
                  Plano {organization.planName}
                </h3>
                <Badge variant={isPlanActive ? 'success' : 'danger'}>
                  {isPlanActive ? 'Ativo' : 'Expirado'}
                </Badge>
              </div>
              <p className="text-text-secondary">
                Sua assinatura atual é válida até{' '}
                <span className="font-medium text-text-primary">
                  {formatDate(organization.planExpiresAt)}
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary">Mudar Plano</Button>
              <Button>Renovar Assinatura</Button>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              Segurança
            </h2>
          </div>

          <div className="space-y-4 max-w-md">
            <Input label="Senha Atual" type="password" />
            <Input label="Nova Senha" type="password" />
            <Input label="Confirmar Nova Senha" type="password" />
            <Button className="mt-2">Atualizar Senha</Button>
          </div>
        </Card>
      </div>
    </PageContainer>);

}