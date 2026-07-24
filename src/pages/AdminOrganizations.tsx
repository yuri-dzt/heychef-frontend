import React, { useState } from 'react';
import {
  BuildingIcon,
  UsersIcon,
  CalendarIcon,
  RefreshCwIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorState } from '../components/ErrorState';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { organizationsApi } from '../api/organizations';
import { plansApi, type Plan } from '../api/plans';
import { formatCurrency } from '../utils/format';
import type { Organization } from '../types';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function daysUntil(ts: number): number {
  return Math.ceil((ts - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function AdminOrganizations() {
  const queryClient = useQueryClient();
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
  const [renewOrg, setRenewOrg] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [planDrafts, setPlanDrafts] = useState<Record<string, string>>({});
  const [planConfirm, setPlanConfirm] = useState<
    { orgId: string; orgName: string; planId: string } | null
  >(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    planId: '',
  });

  const { data: organizations = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.list,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: plansApi.list,
  });

  const createMutation = useMutation({
    mutationFn: organizationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Estabelecimento criado');
      setIsCreateOpen(false);
      setCreateForm({ name: '', adminName: '', adminEmail: '', adminPassword: '', planId: '' });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao criar estabelecimento';
      toast.error(msg);
    },
  });

  const assignPlanMutation = useMutation({
    mutationFn: ({ orgId, planId }: { orgId: string; planId: string }) =>
      plansApi.assignToOrg(orgId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Plano atribuído');
      setPlanConfirm(null);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao atribuir plano';
      toast.error(msg);
    },
  });

  const renewMutation = useMutation({
    mutationFn: (id: string) => organizationsApi.renewPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Plano renovado por mais 30 dias');
      setRenewOrg(null);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao renovar plano';
      toast.error(msg);
    },
  });

  if (isError) {
    return (
      <PageContainer>
        <Header title="Estabelecimentos" />
        <ErrorState onRetry={() => refetch()} />
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Header title="Estabelecimentos" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header
        title="Estabelecimentos"
        actions={
          <Button onClick={() => setIsCreateOpen(true)} leftIcon={<PlusIcon className="w-4 h-4" />}>
            Novo Estabelecimento
          </Button>
        }
      />

      <div className="space-y-4">
        {organizations.map((org) => {
          const days = daysUntil(org.planExpiresAt);
          const isExpired = days <= 0;
          const isExpiring = days > 0 && days <= 7;
          const isExpanded = expandedOrg === org.id;

          return (
            <Card key={org.id} className="overflow-hidden" noPadding>
              {/* Main row */}
              <div className="p-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setExpandedOrg(isExpanded ? null : org.id)}
                  aria-expanded={isExpanded}
                  aria-label={`${org.name} — ${isExpanded ? 'ocultar' : 'mostrar'} detalhes`}
                  className="flex items-center gap-4 flex-1 min-w-0 text-left -m-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BuildingIcon className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-text-primary text-lg truncate">{org.name}</h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {isExpired ? (
                        <Badge variant="danger">Expirado</Badge>
                      ) : isExpiring ? (
                        <Badge variant="warning">Expira em {days} dias</Badge>
                      ) : (
                        <Badge variant="success">Ativo</Badge>
                      )}
                      {(org as any).planName && (
                        <Badge variant="primary">{(org as any).planName}</Badge>
                      )}
                      <span className="text-xs text-text-muted">
                        Criado em {formatDate(org.createdAt)}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-text-muted flex-shrink-0 ml-auto" aria-hidden="true" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-text-muted flex-shrink-0 ml-auto" aria-hidden="true" />
                  )}
                </button>

                <Button
                  size="sm"
                  variant={isExpired ? 'primary' : 'secondary'}
                  leftIcon={<RefreshCwIcon className="w-4 h-4" />}
                  onClick={() => setRenewOrg(org.id)}
                >
                  Renovar
                </Button>
              </div>

              {/* Expanded details */}
              {isExpanded && (() => {
                const currentPlanId = (org as any).planId || '';
                const draftPlanId = planDrafts[org.id] ?? currentPlanId;
                const planUnchanged = draftPlanId === currentPlanId;
                return (
                <div className="border-t border-border p-5">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {(org as any).owner && (
                      <div>
                        <dt className="flex items-center gap-2 text-xs text-text-muted font-medium mb-1">
                          <UsersIcon className="w-3.5 h-3.5" aria-hidden="true" />
                          Proprietário
                        </dt>
                        <dd className="text-sm font-medium text-text-primary">{(org as any).owner.name}</dd>
                        <dd className="text-xs text-text-muted">{(org as any).owner.email}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="flex items-center gap-2 text-xs text-text-muted font-medium mb-1">
                        <CalendarIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        Plano expira em
                      </dt>
                      <dd className={`text-sm font-bold ${isExpired ? 'text-danger' : isExpiring ? 'text-warning' : 'text-success'}`}>
                        {formatDate(org.planExpiresAt)}
                        {!isExpired && ` (${days} dias)`}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-2 text-xs text-text-muted font-medium mb-1">
                        <CalendarIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        Criado em
                      </dt>
                      <dd className="text-sm text-text-primary font-medium">
                        {formatDate(org.createdAt)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-text-primary mb-2">Plano</p>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <Select
                          options={[
                            { value: '', label: 'Sem plano' },
                            ...plans.filter(p => p.active).map(p => ({
                              value: p.id,
                              label: `${p.name} — ${p.priceCents === 0 ? 'Grátis' : formatCurrency(p.priceCents) + '/mês'}`,
                            })),
                          ]}
                          value={draftPlanId}
                          onChange={(e) =>
                            setPlanDrafts((prev) => ({ ...prev, [org.id]: e.target.value }))
                          }
                        />
                      </div>
                      <Button
                        variant="secondary"
                        disabled={planUnchanged || assignPlanMutation.isPending}
                        onClick={() =>
                          setPlanConfirm({ orgId: org.id, orgName: org.name, planId: draftPlanId })
                        }
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>

                </div>
                );
              })()}
            </Card>
          );
        })}

        {organizations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-border">
            <BuildingIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-text-primary">
              Nenhum estabelecimento
            </h3>
            <p className="text-text-secondary mt-1">
              Os estabelecimentos aparecem aqui quando se registram.
            </p>
          </div>
        )}
      </div>

      {/* Create Organization Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Novo Estabelecimento"
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!createForm.name || !createForm.adminName || !createForm.adminEmail || !createForm.adminPassword) {
                  toast.error('Preencha todos os campos obrigatórios');
                  return;
                }
                createMutation.mutate({
                  name: createForm.name,
                  adminName: createForm.adminName,
                  adminEmail: createForm.adminEmail,
                  adminPassword: createForm.adminPassword,
                  planId: createForm.planId || undefined,
                });
              }}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Criando...' : 'Criar Estabelecimento'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nome do Estabelecimento *"
            value={createForm.name}
            onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Ex: Hamburgueria do João"
          />

          <div className="pt-2 border-t border-border">
            <p className="text-sm font-medium text-text-primary mb-3">Usuário Administrador</p>
            <div className="space-y-4">
              <Input
                label="Nome *"
                value={createForm.adminName}
                onChange={(e) => setCreateForm((p) => ({ ...p, adminName: e.target.value }))}
                placeholder="Nome do administrador"
              />
              <Input
                label="Email *"
                type="email"
                value={createForm.adminEmail}
                onChange={(e) => setCreateForm((p) => ({ ...p, adminEmail: e.target.value }))}
                placeholder="email@estabelecimento.com"
              />
              <Input
                label="Senha *"
                type="password"
                value={createForm.adminPassword}
                onChange={(e) => setCreateForm((p) => ({ ...p, adminPassword: e.target.value }))}
                placeholder="Senha inicial"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <Select
              label="Plano"
              options={[
                { value: '', label: 'Sem plano' },
                ...plans.filter((p) => p.active).map((p) => ({
                  value: p.id,
                  label: `${p.name} — ${p.priceCents === 0 ? 'Grátis' : formatCurrency(p.priceCents) + '/mês'}`,
                })),
              ]}
              value={createForm.planId}
              onChange={(e) => setCreateForm((p) => ({ ...p, planId: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!renewOrg}
        onClose={() => setRenewOrg(null)}
        onConfirm={() => renewOrg && renewMutation.mutate(renewOrg)}
        title="Renovar Plano"
        message="Tem certeza que deseja renovar o plano deste estabelecimento por mais 30 dias?"
        confirmText="Renovar"
      />

      <ConfirmDialog
        isOpen={!!planConfirm}
        onClose={() => setPlanConfirm(null)}
        onConfirm={() =>
          planConfirm &&
          assignPlanMutation.mutate({ orgId: planConfirm.orgId, planId: planConfirm.planId })
        }
        title="Alterar plano"
        message={
          planConfirm
            ? `Tem certeza que deseja alterar o plano de "${planConfirm.orgName}"? A mudança entra em vigor imediatamente.`
            : ''
        }
        confirmText="Aplicar"
      />
    </PageContainer>
  );
}
