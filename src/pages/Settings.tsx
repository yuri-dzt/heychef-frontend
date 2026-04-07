import React from 'react';
import { StoreIcon, CreditCardIcon, ShieldCheckIcon, UserIcon } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { formatDate } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { organizationsApi } from '../api/organizations';

export default function Settings() {
  const { user, isAdmin } = useAuth();

  const { data: organization } = useQuery({
    queryKey: ['my-organization'],
    queryFn: () => organizationsApi.getMyOrg(),
    enabled: !isAdmin,
  });

  if (isAdmin) {
    return (
      <PageContainer maxWidth="lg">
        <Header title="Configurações da Plataforma" />

        <div className="space-y-6">
          {/* Admin Info */}
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="p-2 bg-primary-light text-primary rounded-lg">
                <UserIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">
                Dados do Administrador
              </h2>
            </div>

            <div className="space-y-4 max-w-md">
              <Input label="Nome" defaultValue={user?.name} disabled />
              <Input label="Email" defaultValue={user?.email} disabled />
              <Badge variant="primary">Super Admin</Badge>
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
      </PageContainer>
    );
  }

  const isPlanActive = organization?.planExpiresAt ? organization.planExpiresAt > Date.now() : false;

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
              defaultValue={organization?.name || ''} />

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

          <div className="bg-gray-50 rounded-xl p-6 border border-border space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-text-primary">
                    Plano {organization?.planName || '—'}
                  </h3>
                  <Badge variant={isPlanActive ? 'success' : 'danger'}>
                    {isPlanActive ? 'Ativo' : 'Expirado'}
                  </Badge>
                </div>
                {organization?.plan && (
                  <p className="text-text-secondary text-sm">
                    R$ {((organization.plan.priceCents || 0) / 100).toFixed(2).replace('.', ',')}/mês
                  </p>
                )}
                {organization?.planExpiresAt && (
                  <p className="text-text-secondary mt-1">
                    Válido até{' '}
                    <span className="font-medium text-text-primary">
                      {formatDate(organization.planExpiresAt)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {organization?.plan && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-border">
                <div className="text-sm">
                  <span className="text-text-secondary">Usuários:</span>{' '}
                  <span className="font-medium text-text-primary">{organization.plan.maxUsers ?? '—'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-text-secondary">Mesas:</span>{' '}
                  <span className="font-medium text-text-primary">{organization.plan.maxTables ?? '—'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-text-secondary">Produtos:</span>{' '}
                  <span className="font-medium text-text-primary">{organization.plan.maxProducts ?? '—'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-text-secondary">Categorias:</span>{' '}
                  <span className="font-medium text-text-primary">{organization.plan.maxCategories ?? '—'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-text-secondary">Pedidos/dia:</span>{' '}
                  <span className="font-medium text-text-primary">{organization.plan.maxOrdersPerDay ?? '—'}</span>
                </div>
              </div>
            )}

            <p className="text-sm text-text-secondary italic pt-2">
              Entre em contato com o suporte para alterar seu plano.
            </p>
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