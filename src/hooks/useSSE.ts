import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from './useNotification';

const API_URL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:3333';

export function useSSE() {
  const { token, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { notify } = useNotification();

  useEffect(() => {
    // Admin doesn't need SSE (no restaurant data)
    if (!token || isAdmin) return;

    const es = new EventSource(`${API_URL}/events/orders?token=${token}`);

    es.addEventListener('new-order', (e) => {
      const data = JSON.parse(e.data);
      const desc = data.customerName || 'Pedido recebido';
      toast.success('Novo pedido!', { description: desc });
      notify('Novo Pedido!', { body: desc, tag: 'new-order-' + data.id });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    es.addEventListener('order-status-change', (e) => {
      const data = JSON.parse(e.data);
      if (data.status === 'RECEIVED' || data.status === 'PREPARING') {
        toast.info('Pedido atualizado!', { description: data.customerName || 'Novos itens' });
        notify('Pedido Atualizado!', { body: data.customerName || 'Novos itens', tag: 'update-' + data.id });
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    es.addEventListener('call-waiter', (e) => {
      const data = JSON.parse(e.data);
      const tableName = data.tableName || 'Mesa';
      toast.success('Chamado de garçom!', { description: tableName });
      notify('Chamado de Garçom!', { body: `${tableName} precisa de atendimento`, tag: 'call-' + data.id });
      queryClient.invalidateQueries({ queryKey: ['waiter-calls'] });
    });

    es.addEventListener('call-waiter-resolved', () => {
      queryClient.invalidateQueries({ queryKey: ['waiter-calls'] });
    });

    es.onerror = () => {
      es.close();
      // Reconnect after 5s
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['waiter-calls'] });
      }, 5000);
    };

    return () => es.close();
  }, [token, isAdmin, queryClient, notify]);
}
