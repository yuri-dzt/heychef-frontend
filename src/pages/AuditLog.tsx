import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileTextIcon } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { DataTable, Column } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { auditApi, AuditLogEntry } from '../api/audit';

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Criou',
  UPDATE: 'Atualizou',
  DELETE: 'Removeu',
  STATUS_CHANGE: 'Alterou status',
  LOGIN: 'Logou',
};

const ENTITY_LABELS: Record<string, string> = {
  order: 'Pedido',
  product: 'Produto',
  category: 'Categoria',
  table: 'Mesa',
  user: 'Usuário',
  waiter_call: 'Chamado',
};

const ACTION_VARIANT: Record<string, 'success' | 'danger' | 'info' | 'warning' | 'default'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
  STATUS_CHANGE: 'warning',
  LOGIN: 'default',
};

function formatDateTime(ts: number): string {
  const date = new Date(ts);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${d}/${m}/${y} ${h}:${min}`;
}

export default function AuditLog() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: () => auditApi.list(),
  });

  const columns: Column<AuditLogEntry>[] = [
    {
      header: 'Data/Hora',
      cell: (row) => (
        <span className="text-sm text-text-primary whitespace-nowrap">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Usuário',
      cell: (row) => row.userName,
    },
    {
      header: 'Ação',
      cell: (row) => (
        <Badge variant={ACTION_VARIANT[row.action] || 'default'}>
          {ACTION_LABELS[row.action] || row.action}
        </Badge>
      ),
    },
    {
      header: 'Entidade',
      cell: (row) => (
        <span>
          {ENTITY_LABELS[row.entity] || row.entity}
          {row.entityId && (
            <span className="text-text-muted ml-1 text-xs">#{row.entityId.slice(0, 8)}</span>
          )}
        </span>
      ),
    },
    {
      header: 'Detalhes',
      cell: (row) => (
        <div>
          {row.details && (
            <span className="text-sm text-text-secondary">{row.details}</span>
          )}
          {row.ipAddress && (
            <span className="block text-xs text-text-muted mt-0.5">{row.ipAddress}</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <Header title="Registro de Atividades" />

      <Card noPadding className="overflow-hidden">
        <DataTable
          data={logs}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Nenhuma atividade registrada."
          keyExtractor={(row) => row.id}
        />
      </Card>
    </PageContainer>
  );
}
