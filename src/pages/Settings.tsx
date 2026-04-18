import { useEffect, useState } from 'react';
import { StoreIcon, CreditCardIcon, ShieldCheckIcon, UserIcon } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { formatDate } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationsApi } from '../api/organizations';
import { authApi } from '../api/auth';
import { toast } from 'sonner';

function PasswordChangeCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const changePasswordMutation = useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) =>
      authApi.changePassword(current, next),
    onSuccess: () => {
      toast.success('Senha atualizada com sucesso');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao atualizar senha';
      toast.error(msg);
    },
  });

  const handleSubmit = () => {
    if (!currentPassword) {
      toast.error('Informe a senha atual');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      toast.error('A nova senha deve ter pelo menos 4 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('A confirmação da nova senha não corresponde');
      return;
    }
    changePasswordMutation.mutate({ current: currentPassword, next: newPassword });
  };

  return (
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
        <Input
          label="Senha Atual"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
        <Input
          label="Nova Senha"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Input
          label="Confirmar Nova Senha"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Button
          className="mt-2"
          onClick={handleSubmit}
          isLoading={changePasswordMutation.isPending}
        >
          Atualizar Senha
        </Button>
      </div>
    </Card>
  );
}

export default function Settings() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: organization } = useQuery({
    queryKey: ['my-organization'],
    queryFn: () => organizationsApi.getMyOrg(),
    enabled: !isAdmin,
  });

  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    if (organization?.name) {
      setOrgName(organization.name);
    }
  }, [organization?.name]);

  const updateOrgMutation = useMutation({
    mutationFn: (name: string) => organizationsApi.updateMyOrg({ name }),
    onSuccess: () => {
      toast.success('Dados do estabelecimento atualizados');
      queryClient.invalidateQueries({ queryKey: ['my-organization'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao atualizar';
      toast.error(msg);
    },
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
              <Input label="Nome" value={user?.name || ''} disabled readOnly />
              <Input label="Email" value={user?.email || ''} disabled readOnly />
              <Badge variant="primary">Super Admin</Badge>
            </div>
          </Card>

          {/* Security */}
          <PasswordChangeCard />
        </div>
      </PageContainer>
    );
  }

  const isPlanActive = organization?.planExpiresAt
    ? organization.planExpiresAt > Date.now()
    : false;
  const canEditOrg = user?.role === 'ADMIN';

  const handleSaveOrg = () => {
    const trimmed = orgName.trim();
    if (!trimmed) {
      toast.error('Informe o nome do estabelecimento');
      return;
    }
    updateOrgMutation.mutate(trimmed);
  };

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
              Dados do Estabelecimento
            </h2>
          </div>

          <div className="space-y-4 max-w-md">
            <Input
              label="Nome do Estabelecimento"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              disabled={!canEditOrg}
            />
            {canEditOrg && (
              <Button
                className="mt-2"
                onClick={handleSaveOrg}
                isLoading={updateOrgMutation.isPending}
              >
                Salvar Alterações
              </Button>
            )}
            {!canEditOrg && (
              <p className="text-sm text-text-secondary italic">
                Apenas administradores podem alterar os dados do estabelecimento.
              </p>
            )}
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
        <PasswordChangeCard />
      </div>
    </PageContainer>
  );
}
