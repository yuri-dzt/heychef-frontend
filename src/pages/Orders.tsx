import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FilterIcon,
  ClockIcon,
  ArrowRightIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellIcon,
  BellOffIcon,
} from 'lucide-react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, shortOrderId, getRelativeTime } from '../utils/format';
import { ordersApi } from '../api/orders';
import { useNotification } from '../hooks/useNotification';
import type { Order, OrderStatus } from '../types';

const COLUMNS: {
  id: OrderStatus;
  title: string;
  color: string;
  nextStatus?: OrderStatus;
}[] = [
  { id: 'RECEIVED', title: 'Recebidos', color: 'bg-blue-500', nextStatus: 'PREPARING' },
  { id: 'PREPARING', title: 'Preparando', color: 'bg-yellow-500', nextStatus: 'READY' },
  { id: 'READY', title: 'Prontos', color: 'bg-primary', nextStatus: 'DELIVERED' },
  { id: 'DELIVERED', title: 'Entregues', color: 'bg-green-500' },
];

const STATUS_ORDER: OrderStatus[] = ['RECEIVED', 'PREPARING', 'READY', 'DELIVERED'];

export default function Orders() {
  const queryClient = useQueryClient();
  const { permission, requestPermission } = useNotification();
  const [filterTable, setFilterTable] = useState('all');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);

  // Scroll arrows state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 20);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list(),
    refetchInterval: 30_000,
  });

  // Recheck arrows when orders change
  useEffect(() => { checkScroll(); }, [orders, checkScroll]);

  // Derive detail order from live data
  const detailOrder = detailOrderId ? orders.find(o => o.id === detailOrderId) || null : null;

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status atualizado');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao atualizar status';
      toast.error(msg);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => ordersApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Pedido cancelado');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao cancelar pedido';
      toast.error(msg);
    },
  });

  const handleAdvanceStatus = (orderId: string, nextStatus: OrderStatus) => {
    updateStatusMutation.mutate({ id: orderId, status: nextStatus });
  };

  const handleCancelClick = (orderId: string) => {
    setOrderToCancel(orderId);
    setCancelModalOpen(true);
  };

  const confirmCancel = () => {
    if (orderToCancel) {
      cancelMutation.mutate(orderToCancel, {
        onSettled: () => {
          setCancelModalOpen(false);
          setOrderToCancel(null);
        },
      });
    }
  };

  // Drag and drop handler
  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as OrderStatus;
    const order = orders.find((o) => o.id === draggableId);
    if (!order || order.status === newStatus) return;

    updateStatusMutation.mutate({ id: draggableId, status: newStatus });
  };

  const filteredOrders = orders.filter((o) => {
    if (o.status === 'CANCELED') return false;
    if (filterTable !== 'all' && o.tableId !== filterTable) return false;
    return true;
  });

  return (
    <PageContainer
      maxWidth="full"
      className="h-[calc(100vh-64px)] md:h-screen flex flex-col"
    >
      <Header
        title="Pedidos"
        actions={
          <div className="flex items-center gap-3">
            {permission !== 'granted' ? (
              <button
                onClick={requestPermission}
                className="flex items-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
              >
                <BellIcon className="w-4 h-4" />
                Ativar notificações
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200">
                <BellIcon className="w-4 h-4" />
                Notificações ativas
              </div>
            )}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-border">
              <FilterIcon className="w-4 h-4 text-text-muted" />
              <select
                className="bg-transparent text-sm font-medium focus:outline-none"
                value={filterTable}
                onChange={(e) => setFilterTable(e.target.value)}
              >
                <option value="all">Todas as mesas</option>
                {Array.from(
                  new Map(
                    orders
                      .filter((o) => o.table)
                      .map((o) => [o.tableId, o.table!.name])
                  )
                ).map(([tableId, tableName]) => (
                  <option key={tableId} value={tableId}>
                    {tableName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
      />

      {/* Kanban Board with scroll arrows */}
      <div className="flex-1 relative">
        {/* Left arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-border rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-text-primary" />
          </button>
        )}

        {/* Right arrow */}
        {showRightArrow && (
          <button
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-border rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-text-primary" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="overflow-x-auto h-full pb-4 px-1 scroll-smooth"
        >
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 h-full min-w-max">
              {COLUMNS.map((column) => {
                const columnOrders = filteredOrders.filter(
                  (o) => o.status === column.id
                );
                return (
                  <Droppable droppableId={column.id} key={column.id}>
                    {(provided, snapshot) => (
                      <div
                        className={`w-80 flex flex-col rounded-xl border overflow-hidden transition-colors ${
                          snapshot.isDraggingOver
                            ? 'bg-primary/10 border-2 border-dashed border-primary'
                            : 'bg-gray-50/50 border-border'
                        }`}
                      >
                        {/* Column Header */}
                        <div className="p-4 border-b border-border bg-white flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${column.color}`} />
                            <h3 className="font-semibold text-text-primary">
                              {column.title}
                            </h3>
                          </div>
                          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                            {columnOrders.length}
                          </span>
                        </div>

                        {/* Column Content */}
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex-1 overflow-y-auto p-3 space-y-3"
                          style={{ minHeight: 100 }}
                        >
                          {columnOrders.map((order, index) => (
                            <Draggable
                              key={order.id}
                              draggableId={order.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white p-4 rounded-lg border shadow-sm transition-shadow select-none ${
                                    snapshot.isDragging
                                      ? 'shadow-xl border-primary/40 rotate-1'
                                      : 'border-border hover:shadow-md'
                                  }`}
                                >
                                  <div
                                    className="cursor-pointer"
                                    onClick={() => setDetailOrderId(order.id)}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <span className="font-bold text-lg text-text-primary">
                                          {order.table?.name}
                                        </span>
                                        {order.customerName && (
                                          <p className="text-sm text-text-secondary">
                                            {order.customerName}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center text-text-muted text-xs bg-gray-50 px-2 py-1 rounded">
                                        <ClockIcon className="w-3 h-3 mr-1" />
                                        {getRelativeTime(order.createdAt)}
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <p className="text-sm text-text-secondary truncate mr-2">
                                        {order.items?.length || 0}{' '}
                                        {order.items?.length === 1 ? 'item' : 'itens'}
                                      </p>
                                      <span className="font-semibold text-text-primary whitespace-nowrap">
                                        {formatCurrency(order.totalCents)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-3">
                                    {column.nextStatus && (
                                      <Button
                                        size="sm"
                                        className="flex-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAdvanceStatus(order.id, column.nextStatus!);
                                        }}
                                        rightIcon={<ArrowRightIcon className="w-4 h-4" />}
                                      >
                                        Avançar
                                      </Button>
                                    )}
                                    {column.id !== 'DELIVERED' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-danger hover:bg-red-50 hover:text-danger px-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCancelClick(order.id);
                                        }}
                                        title="Cancelar pedido"
                                      >
                                        <XCircleIcon className="w-5 h-5" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}

                          {columnOrders.length === 0 && (
                            <div className="h-32 flex items-center justify-center text-text-muted text-sm border-2 border-dashed border-gray-200 rounded-lg">
                              Nenhum pedido
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!detailOrder}
        onClose={() => setDetailOrderId(null)}
        title={`Pedido ${detailOrder ? shortOrderId(detailOrder.id) : ''}`}
        maxWidth="md"
      >
        {detailOrder && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-text-primary">
                  {detailOrder.table?.name}
                </p>
                {detailOrder.customerName && (
                  <p className="text-sm text-text-secondary">
                    {detailOrder.customerName}
                  </p>
                )}
              </div>
              <StatusBadge status={detailOrder.status} />
            </div>

            <div className="space-y-2">
              {detailOrder.items?.map((item, idx) => {
                const itemStatus = (item as any).status || 'PENDING';
                const cfg = {
                  PENDING: { label: 'Aguardando', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400', next: 'PREPARING', nextLabel: 'Preparar' },
                  PREPARING: { label: 'Preparando', bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-400 animate-pulse', next: 'READY', nextLabel: 'Pronto' },
                  READY: { label: 'Pronto!', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500', next: null, nextLabel: '' },
                }[itemStatus as string] as any || { label: itemStatus, bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400', next: null, nextLabel: '' };

                return (
                  <div key={idx} className={`rounded-lg border ${cfg.border} ${cfg.bg} p-3`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className="text-xs font-semibold">{cfg.label}</span>
                        </div>
                        <p className="font-medium text-text-primary">
                          {item.quantity}x {item.productName}
                        </p>
                        {(item.addons as any[])?.length > 0 && (
                          <div className="mt-1 pl-4 space-y-0.5">
                            {(item.addons as any[]).map((addon: any, aidx: number) => (
                              <p key={aidx} className="text-xs text-text-muted">
                                + {addon.name} ({formatCurrency(addon.priceCents)})
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="font-medium text-text-primary text-sm whitespace-nowrap">
                          {formatCurrency(item.totalPriceCents)}
                        </span>
                        {cfg.next && (
                          <button
                            onClick={async () => {
                              try {
                                await ordersApi.updateItemStatus((item as any).id, cfg.next);
                                queryClient.invalidateQueries({ queryKey: ['orders'] });
                                toast.success(`${item.productName}: ${cfg.nextLabel}`);
                              } catch (error: any) {
                                const msg = error?.response?.data?.message || 'Erro ao atualizar item';
                                toast.error(msg);
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-current text-primary hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
                          >
                            {cfg.nextLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {detailOrder.notes && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-text-secondary mb-1">
                  Observações
                </p>
                <p className="text-sm text-text-primary">{detailOrder.notes}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-text-secondary font-medium">Total</span>
              <span className="text-xl font-bold text-text-primary">
                {formatCurrency(detailOrder.totalCents)}
              </span>
            </div>

            <p className="text-xs text-text-muted text-right">
              {getRelativeTime(detailOrder.createdAt)}
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={confirmCancel}
        title="Cancelar Pedido"
        message="Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita."
        confirmText="Sim, cancelar"
        isDanger
      />
    </PageContainer>
  );
}
