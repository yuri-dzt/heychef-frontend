import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from './useNotification';
import { API_URL } from '../api/client';

export function useSSE() {
  const { token, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { notify } = useNotification();
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!token || isAdmin) return;

    function connect() {
      if (esRef.current) {
        esRef.current.close();
      }

      const es = new EventSource(`${API_URL}/events/orders?token=${token}`);
      esRef.current = es;

      es.addEventListener('new-order', (e) => {
        const data = JSON.parse(e.data);
        const desc = data.customerName || 'Pedido recebido';
        toast.success('Novo pedido!', { description: desc });
        notify('Novo Pedido!', { body: desc, tag: 'new-order-' + data.id });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      });

      es.addEventListener('order-status-change', () => {
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
        esRef.current = null;
        // Auto-reconnect after 3s
        reconnectTimeout.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    }

    connect();

    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (esRef.current) esRef.current.close();
      esRef.current = null;
    };
  }, [token, isAdmin, queryClient, notify]);
}
