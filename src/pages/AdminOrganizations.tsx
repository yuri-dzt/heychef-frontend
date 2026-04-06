import React, { useState } from 'react';
import {
  BuildingIcon,
  UsersIcon,
  CalendarIcon,
  RefreshCwIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { organizationsApi } from '../api/organizations';
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

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.list,
  });

  const renewMutation = useMutation({
    mutationFn: (id: string) => organizationsApi.renewPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Plano renovado por mais 30 dias');
      setRenewOrg(null);
    },
    onError: () => {
      toast.error('Erro ao renovar plano');
    },
  });

  if (isLoading) {
    return (
      <PageContainer>
        <Header title="Estabelecimentos" />
        <div className="flex items-center justify-center py-12">
          <div className="text-text-muted">Carregando estabelecimentos...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header
        title="Estabelecimentos"
        actions={
          <div className="flex items-center gap-2 text-sm text-text-secondary bg-white px-3 py-2 rounded-lg border border-border">
            <BuildingIcon className="w-4 h-4" />
            {organizations.length} {organizations.length === 1 ? 'estabelecimento' : 'estabelecimentos'}
          </div>
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
              <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedOrg(isExpanded ? null : org.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BuildingIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-lg">{org.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      {isExpired ? (
                        <Badge variant="danger">Plano expirado</Badge>
                      ) : isExpiring ? (
                        <Badge variant="warning">Expira em {days} dias</Badge>
                      ) : (
                        <Badge variant="success">Plano ativo</Badge>
                      )}
                      <span className="text-xs text-text-muted">
                        Criado em {formatDate(org.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant={isExpired ? 'primary' : 'secondary'}
                    leftIcon={<RefreshCwIcon className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenewOrg(org.id);
                    }}
                  >
                    Renovar
                  </Button>
                  {isExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-text-muted" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-text-muted" />
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-border bg-gray-50 p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-border">
                      <p className="text-xs text-text-muted font-medium mb-1">ID da Organização</p>
                      <p className="text-sm text-text-primary font-mono break-all">{org.id}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-text-muted" />
                        <p className="text-xs text-text-muted font-medium">Plano expira em</p>
                      </div>
                      <p className={`text-sm font-bold ${isExpired ? 'text-danger' : isExpiring ? 'text-warning' : 'text-success'}`}>
                        {formatDate(org.planExpiresAt)}
                        {!isExpired && ` (${days} dias)`}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-text-muted" />
                        <p className="text-xs text-text-muted font-medium">Criado em</p>
                      </div>
                      <p className="text-sm text-text-primary font-medium">
                        {formatDate(org.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white rounded-lg border border-border">
                    <p className="text-xs text-text-muted mb-1">
                      Os usuários deste estabelecimento usam este ID para fazer login.
                      Compartilhe com o administrador do restaurante.
                    </p>
                  </div>
                </div>
              )}
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

      <ConfirmDialog
        isOpen={!!renewOrg}
        onClose={() => setRenewOrg(null)}
        onConfirm={() => renewOrg && renewMutation.mutate(renewOrg)}
        title="Renovar Plano"
        message="Tem certeza que deseja renovar o plano deste estabelecimento por mais 30 dias?"
        confirmText="Renovar"
      />
    </PageContainer>
  );
}
