import React, { useEffect } from 'react';
import {
  BuildingIcon,
  CrownIcon,
  ClipboardListIcon,
  DollarSignIcon,
  LayoutGridIcon,
  BellIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { useAuth } from '../contexts/AuthContext';
import { organizationsApi } from '../api/organizations';
import { plansApi, type Plan } from '../api/plans';
import { ordersApi } from '../api/orders';
import { waiterCallsApi } from '../api/waiter-calls';
import { tablesApi } from '../api/tables';
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

// ─── SUPER ADMIN DASHBOARD ──────────────────────────────

function SuperAdminDashboard() {
  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.list,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: plansApi.list,
  });

  const expiredOrgs = organizations.filter((o) => daysUntil(o.planExpiresAt) <= 0);
  const expiringOrgs = organizations.filter((o) => {
    const d = daysUntil(o.planExpiresAt);
    return d > 0 && d <= 7;
  });
  const activeOrgs = organizations.filter((o) => daysUntil(o.planExpiresAt) > 7);

  return (
    <PageContainer>
      <Header title="Painel da Plataforma" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="flex items-center p-5">
          <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary mr-4">
            <BuildingIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Estabelecimentos</p>
            <p className="text-2xl font-bold text-text-primary">{organizations.length}</p>
          </div>
        </Card>

        <Card className="flex items-center p-5">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
            <CrownIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Planos Ativos</p>
            <p className="text-2xl font-bold text-text-primary">{plans.filter((p) => p.active).length}</p>
          </div>
        </Card>

        <Card className="flex items-center p-5">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${expiredOrgs.length > 0 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            <AlertTriangleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Planos Expirados</p>
            <p className="text-2xl font-bold text-text-primary">{expiredOrgs.length}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring / Expired */}
        {(expiredOrgs.length > 0 || expiringOrgs.length > 0) && (
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Atenção Necessária</h2>
              <Link
                to="/admin/organizations"
                className="text-sm text-primary hover:text-primary-hover font-medium flex items-center"
              >
                Ver todos <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {expiredOrgs.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-text-primary">{org.name}</p>
                    <p className="text-xs text-text-muted">Expirou em {formatDate(org.planExpiresAt)}</p>
                  </div>
                  <Badge variant="danger">Expirado</Badge>
                </div>
              ))}
              {expiringOrgs.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium text-text-primary">{org.name}</p>
                    <p className="text-xs text-text-muted">Expira em {daysUntil(org.planExpiresAt)} dias</p>
                  </div>
                  <Badge variant="warning">Expirando</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Organizations */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Estabelecimentos Ativos</h2>
            <span className="text-sm text-text-muted">{activeOrgs.length}</span>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {activeOrgs.slice(0, 10).map((org) => (
              <div key={org.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BuildingIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary text-sm">{org.name}</p>
                    <p className="text-xs text-text-muted">
                      {(org as any).planName || 'Sem plano'}
                    </p>
                  </div>
                </div>
                <Badge variant="success">Ativo</Badge>
              </div>
            ))}
            {activeOrgs.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">Nenhum estabelecimento ativo.</p>
            )}
          </div>
        </Card>

        {/* Plans */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Planos</h2>
            <Link
              to="/admin/plans"
              className="text-sm text-primary hover:text-primary-hover font-medium flex items-center"
            >
              Gerenciar <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {plans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-text-primary">{plan.name}</p>
                  <p className="text-sm text-primary font-semibold">
                    {plan.priceCents === 0 ? 'Grátis' : formatCurrency(plan.priceCents) + '/mês'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-text-primary">{plan.organizationCount || 0}</p>
                  <p className="text-xs text-text-muted">clientes</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

// ─── RESTAURANT DASHBOARD ───────────────────────────────

function RestaurantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.onboardingComplete === false) {
      navigate('/onboarding', { replace: true });
    }
  }, [user, navigate]);

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list(),
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.list,
  });

  const { data: calls = [] } = useQuery({
    queryKey: ['waiter-calls'],
    queryFn: () => waiterCallsApi.list(),
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((o) => o.createdAt >= todayStart.getTime() && o.status !== 'CANCELED');
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalCents, 0);
  const activeTables = tables.filter((t) => t.active).length;
  const openCalls = calls.filter((c) => c.status === 'OPEN').length;

  return (
    <PageContainer>
      <Header title="Dashboard" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="flex items-center p-5">
          <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary mr-4">
            <ClipboardListIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Pedidos Hoje</p>
            <p className="text-2xl font-bold text-text-primary">{todayOrders.length}</p>
          </div>
        </Card>

        <Card className="flex items-center p-5">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
            <DollarSignIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Receita Hoje</p>
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(todayRevenue)}</p>
          </div>
        </Card>

        <Card className="flex items-center p-5">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
            <LayoutGridIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Mesas Ativas</p>
            <p className="text-2xl font-bold text-text-primary">{activeTables}</p>
          </div>
        </Card>

        <Card className="flex items-center p-5">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${openCalls > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
            <BellIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Chamados Abertos</p>
            <p className="text-2xl font-bold text-text-primary">{openCalls}</p>
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Últimos Pedidos</h2>
          <Link
            to="/orders"
            className="text-sm text-primary hover:text-primary-hover font-medium flex items-center"
          >
            Ver todos <ArrowRightIcon className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {todayOrders.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">Nenhum pedido hoje ainda.</p>
        ) : (
          <div className="space-y-2">
            {todayOrders.slice(0, 8).map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-border transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <span className="font-medium text-text-primary">{order.table?.name}</span>
                    {order.customerName && (
                      <span className="text-text-muted text-sm ml-2">{order.customerName}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-text-primary">{formatCurrency(order.totalCents)}</span>
                  <Badge variant={
                    order.status === 'RECEIVED' ? 'info' :
                    order.status === 'PREPARING' ? 'warning' :
                    order.status === 'READY' ? 'primary' :
                    order.status === 'DELIVERED' ? 'success' : 'default'
                  }>
                    {order.status === 'RECEIVED' ? 'Recebido' :
                     order.status === 'PREPARING' ? 'Preparando' :
                     order.status === 'READY' ? 'Pronto' :
                     order.status === 'DELIVERED' ? 'Entregue' : order.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.type === 'admin') {
    return <SuperAdminDashboard />;
  }

  return <RestaurantDashboard />;
}
