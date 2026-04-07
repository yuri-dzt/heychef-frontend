import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MonitorIcon,
  SmartphoneIcon,
  TabletIcon,
  LogOutIcon,
} from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { getRelativeTime } from '../utils/format';
import { sessionsApi } from '../api/sessions';
import type { Session } from '../api/sessions';

function getDeviceIcon(deviceInfo: string) {
  const lower = deviceInfo.toLowerCase();
  if (lower.includes('tablet')) return <TabletIcon className="w-6 h-6" />;
  if (lower.includes('mobile')) return <SmartphoneIcon className="w-6 h-6" />;
  return <MonitorIcon className="w-6 h-6" />;
}

export default function Sessions() {
  const queryClient = useQueryClient();
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [showRevokeAll, setShowRevokeAll] = useState(false);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionsApi.list,
  });

  const revokeMutation = useMutation({
    mutationFn: sessionsApi.revoke,
    onSuccess: (_data, revokedId) => {
      // Check if the revoked session was the current one
      const revokedSession = sessions.find((s) => s.id === revokedId);
      if (revokedSession?.isCurrent) {
        localStorage.removeItem('heychef_token');
        localStorage.removeItem('heychef_user');
        localStorage.removeItem('heychef_user_type');
        localStorage.removeItem('heychef_refresh_token');
        window.location.href = '/login';
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Dispositivo desconectado');
      setRevokeId(null);
    },
    onError: () => {
      toast.error('Erro ao desconectar dispositivo');
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: sessionsApi.revokeAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Todos os outros dispositivos foram desconectados');
      setShowRevokeAll(false);
    },
    onError: () => {
      toast.error('Erro ao desconectar dispositivos');
    },
  });

  const otherSessions = sessions.filter((s) => !s.isCurrent);
  const hasOtherSessions = otherSessions.length > 0;

  return (
    <PageContainer>
      <Header
        title="Dispositivos Conectados"
        actions={
          hasOtherSessions ? (
            <Button
              variant="danger"
              leftIcon={<LogOutIcon className="w-4 h-4" />}
              onClick={() => setShowRevokeAll(true)}
            >
              Desconectar todos os outros
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<MonitorIcon className="w-8 h-8" />}
          title="Nenhum dispositivo conectado"
          description="Faça logout e login novamente para registrar este dispositivo."
        />
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRevoke={() => setRevokeId(session.id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={revokeId !== null}
        onClose={() => setRevokeId(null)}
        onConfirm={() => revokeId && revokeMutation.mutate(revokeId)}
        title="Desconectar dispositivo"
        message="Tem certeza que deseja desconectar este dispositivo? A sessão será encerrada imediatamente."
        confirmText="Desconectar"
        isDanger
        isLoading={revokeMutation.isPending}
      />

      <ConfirmDialog
        isOpen={showRevokeAll}
        onClose={() => setShowRevokeAll(false)}
        onConfirm={() => revokeAllMutation.mutate()}
        title="Desconectar todos os outros"
        message="Tem certeza que deseja desconectar todos os outros dispositivos? Apenas este dispositivo permanecerá conectado."
        confirmText="Desconectar todos"
        isDanger
        isLoading={revokeAllMutation.isPending}
      />
    </PageContainer>
  );
}

function SessionCard({
  session,
  onRevoke,
}: {
  session: Session;
  onRevoke: () => void;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex-shrink-0 p-3 rounded-full bg-gray-100 text-text-muted">
        {getDeviceIcon(session.deviceInfo)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-text-primary truncate">
            {session.deviceInfo}
          </p>
          {session.isCurrent && <Badge variant="success">Este dispositivo</Badge>}
        </div>
        <p className="text-sm text-text-muted">{session.ipAddress}</p>
        <p className="text-xs text-text-muted mt-0.5">
          Último acesso: {getRelativeTime(session.lastActiveAt)}
        </p>
      </div>
      <Button variant={session.isCurrent ? 'danger' : 'secondary'} size="sm" onClick={onRevoke}>
        {session.isCurrent ? 'Sair' : 'Desconectar'}
      </Button>
    </Card>
  );
}
