import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  FileTextIcon,
  PrinterIcon } from
'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '../components/PageContainer';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatDateTime, shortOrderId } from '../utils/format';
import { ordersApi } from '../api/orders';
import type { OrderStatus } from '../types';

const STATUS_STEPS: OrderStatus[] = ['RECEIVED', 'PREPARING', 'READY', 'DELIVERED'];
export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.getById(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: OrderStatus) => ordersApi.updateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      toast.success('Status atualizado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      toast.success('Pedido cancelado');
    },
    onError: () => {
      toast.error('Erro ao cancelar pedido');
    },
  });

  if (isLoading || !order) {
    return (
      <PageContainer maxWidth="lg">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  return (
    <PageContainer maxWidth="lg">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors">
          
          <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            Pedido {shortOrderId(order.id)}
            <StatusBadge status={order.status} />
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            variant="secondary"
            leftIcon={<PrinterIcon className="w-4 h-4" />}>
            
            Imprimir
          </Button>
          {order.status !== 'DELIVERED' && order.status !== 'CANCELED' &&
          <Button
            onClick={() => {
              const currentIdx = STATUS_STEPS.indexOf(order.status);
              if (currentIdx >= 0 && currentIdx < STATUS_STEPS.length - 1) {
                updateStatusMutation.mutate(STATUS_STEPS[currentIdx + 1]);
              }
            }}
            isLoading={updateStatusMutation.isPending}>
            Avançar Status
          </Button>
          }
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Stepper */}
          <Card className="p-6">
            <div className="relative flex items-center justify-between w-full">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500"
                style={{
                  width: `${Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1) * 100}%`
                }}>
              </div>

              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const labels = {
                  RECEIVED: 'Recebido',
                  PREPARING: 'Preparando',
                  READY: 'Pronto',
                  DELIVERED: 'Entregue'
                };
                return (
                  <div
                    key={step}
                    className="relative z-10 flex flex-col items-center">
                    
                    <div
                      className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors
                      ${isCompleted ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-400'}
                      ${isCurrent ? 'ring-4 ring-primary-light' : ''}
                    `}>
                      
                      {index + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${isCompleted ? 'text-text-primary' : 'text-text-muted'}`}>
                      
                      {labels[step as keyof typeof labels]}
                    </span>
                  </div>);

              })}
            </div>
          </Card>

          {/* Items List */}
          <Card noPadding>
            <div className="p-4 border-b border-border bg-gray-50 rounded-t-xl">
              <h2 className="font-semibold text-text-primary">
                Itens do Pedido
              </h2>
            </div>
            <div className="divide-y divide-border">
              {order.items?.map((item) =>
              <div key={item.id} className="p-4 flex justify-between">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center font-medium text-text-secondary flex-shrink-0">
                      {item.quantity}x
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {item.productName}
                      </p>
                      {item.addons && item.addons.length > 0 &&
                    <ul className="mt-1 space-y-1">
                          {item.addons.map((addon) =>
                      <li
                        key={addon.id}
                        className="text-sm text-text-secondary flex items-center before:content-['+'] before:mr-1 before:text-text-muted">
                        
                              {addon.addonItemName}{' '}
                              <span className="text-text-muted ml-1">
                                ({formatCurrency(addon.priceCents)})
                              </span>
                            </li>
                      )}
                        </ul>
                    }
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-text-primary">
                      {formatCurrency(item.totalPriceCents)}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {formatCurrency(item.unitPriceCents)} un.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 rounded-b-xl border-t border-border flex justify-between items-center">
              <span className="font-semibold text-text-secondary">
                Total do Pedido
              </span>
              <span className="text-xl font-bold text-text-primary">
                {formatCurrency(order.totalCents)}
              </span>
            </div>
          </Card>
        </div>

        {/* Right Column: Info */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-text-primary mb-4">
              Informações
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-light text-primary rounded-lg">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Mesa / Cliente</p>
                  <p className="font-medium text-text-primary">
                    {order.table?.name}
                  </p>
                  {order.customerName &&
                  <p className="text-sm text-text-secondary">
                      {order.customerName}
                    </p>
                  }
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <ClockIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Horário</p>
                  <p className="font-medium text-text-primary">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
              </div>

              {order.notes &&
              <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                    <FileTextIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Observações</p>
                    <p className="text-sm text-text-primary mt-1 bg-yellow-50/50 p-2 rounded border border-yellow-100">
                      {order.notes}
                    </p>
                  </div>
                </div>
              }
            </div>
          </Card>

          {order.status !== 'CANCELED' && order.status !== 'DELIVERED' &&
          <Card className="border-danger/20 bg-red-50/30">
              <h3 className="font-semibold text-danger mb-2">Zona de Perigo</h3>
              <p className="text-sm text-text-secondary mb-4">
                Cancelar o pedido removerá ele da fila de preparo. Esta ação não
                pode ser desfeita.
              </p>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => cancelMutation.mutate()}
                isLoading={cancelMutation.isPending}>
                Cancelar Pedido
              </Button>
            </Card>
          }
        </div>
      </div>
    </PageContainer>);

}