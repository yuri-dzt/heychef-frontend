import React, { useState, useEffect } from 'react';
import { BellIcon, CheckCircleIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { getRelativeTime } from '../utils/format';
import { waiterCallsApi } from '../api/waiter-calls';
import { useNotification } from '../hooks/useNotification';

const API_URL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:5000';

export default function WaiterCalls() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { notify } = useNotification();
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('OPEN');

  const { data: calls = [] } = useQuery({
    queryKey: ['waiter-calls'],
    queryFn: () => waiterCallsApi.list(),
    refetchInterval: 10000,
  });

  // SSE - real-time updates
  useEffect(() => {
    if (!token) return;
    const es = new EventSource(`${API_URL}/events/orders?token=${token}`);

    es.addEventListener('call-waiter', (e) => {
      const data = JSON.parse(e.data);
      const tableName = data.tableName || 'Mesa';
      toast.success('Chamado de garçom!', { description: tableName });
      notify('🔔 Chamado de Garçom!', { body: `${tableName} precisa de atendimento`, tag: 'call-' + data.id });
      queryClient.invalidateQueries({ queryKey: ['waiter-calls'] });
    });

    es.addEventListener('call-waiter-resolved', () => {
      queryClient.invalidateQueries({ queryKey: ['waiter-calls'] });
    });

    es.onerror = () => es.close();
    return () => es.close();
  }, [token, queryClient]);

  const resolveMutation = useMutation({
    mutationFn: (id: string) => waiterCallsApi.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiter-calls'] });
      toast.success('Chamado resolvido');
    },
    onError: () => {
      toast.error('Erro ao resolver chamado');
    },
  });

  const handleResolve = (id: string) => {
    resolveMutation.mutate(id);
  };
  const filteredCalls = calls.filter(
    (c) => filter === 'ALL' || c.status === filter
  );
  // Sort: OPEN first, then by createdAt desc
  filteredCalls.sort((a, b) => {
    if (a.status === 'OPEN' && b.status !== 'OPEN') return -1;
    if (a.status !== 'OPEN' && b.status === 'OPEN') return 1;
    return b.createdAt - a.createdAt;
  });
  return (
    <PageContainer maxWidth="lg">
      <Header title="Chamados de Garçom" />

      <div className="flex gap-2 mb-6 border-b border-border pb-4">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'OPEN' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-50 border border-border'}`}
          onClick={() => setFilter('OPEN')}>
          
          Abertos ({calls.filter((c) => c.status === 'OPEN').length})
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'RESOLVED' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-50 border border-border'}`}
          onClick={() => setFilter('RESOLVED')}>
          
          Resolvidos
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-50 border border-border'}`}
          onClick={() => setFilter('ALL')}>
          
          Todos
        </button>
      </div>

      <div className="space-y-4">
        {filteredCalls.map((call) =>
        <Card
          key={call.id}
          className={`flex items-center justify-between p-4 sm:p-6 ${call.status === 'OPEN' ? 'border-primary-light bg-primary-light/10' : ''}`}>
          
            <div className="flex items-center gap-4">
              <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${call.status === 'OPEN' ? 'bg-primary text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
              
                <BellIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  {call.tableName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-text-secondary">
                    {getRelativeTime(call.createdAt)}
                  </span>
                  {call.status === 'OPEN' ?
                <Badge variant="warning" className="animate-pulse">
                      Aguardando
                    </Badge> :

                <Badge variant="success">Resolvido</Badge>
                }
                </div>
              </div>
            </div>

            {call.status === 'OPEN' &&
          <Button
            onClick={() => handleResolve(call.id)}
            leftIcon={<CheckCircleIcon className="w-5 h-5" />}>
            
                Resolver
              </Button>
          }
          </Card>
        )}

        {filteredCalls.length === 0 &&
        <div className="text-center py-12 bg-white rounded-xl border border-border">
            <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-text-primary">
              Nenhum chamado
            </h3>
            <p className="text-text-secondary mt-1">
              {filter === 'OPEN' ?
            'Todas as mesas estão atendidas.' :
            'Nenhum registro encontrado.'}
            </p>
          </div>
        }
      </div>
    </PageContainer>);

}