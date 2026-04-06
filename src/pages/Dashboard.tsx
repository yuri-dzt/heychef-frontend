import React from 'react';
import {
  ClipboardListIcon,
  DollarSignIcon,
  LayoutGridIcon,
  BellIcon,
  ArrowRightIcon } from
'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, shortOrderId, getRelativeTime } from '../utils/format';
import type { Order } from '../types';

// Mock Data
const stats = {
  ordersToday: 142,
  revenueToday: 845050,
  activeTables: 18,
  openCalls: 3
};

// Generate last 7 days chart data
const generateChartData = () => {
  const data = [];
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseRevenue = isWeekend ? 120000 : 70000;
    data.push({
      day: days[date.getDay()],
      receita: Math.floor(baseRevenue + Math.random() * 50000),
      pedidos: Math.floor((isWeekend ? 140 : 80) + Math.random() * 30)
    });
  }
  return data;
};

const chartData = generateChartData();

const recentOrders: Order[] = [
{
  id: 'ord_123456',
  organizationId: 'org_1',
  tableId: 'tbl_1',
  status: 'RECEIVED',
  totalCents: 14590,
  createdAt: Date.now() - 1000 * 60 * 5,
  table: {
    id: 'tbl_1',
    organizationId: 'org_1',
    name: 'Mesa 05',
    qrCodeToken: '',
    active: true,
    createdAt: 0
  }
},
{
  id: 'ord_123457',
  organizationId: 'org_1',
  tableId: 'tbl_2',
  status: 'PREPARING',
  totalCents: 8990,
  createdAt: Date.now() - 1000 * 60 * 15,
  table: {
    id: 'tbl_2',
    organizationId: 'org_1',
    name: 'Mesa 12',
    qrCodeToken: '',
    active: true,
    createdAt: 0
  }
},
{
  id: 'ord_123458',
  organizationId: 'org_1',
  tableId: 'tbl_3',
  status: 'READY',
  totalCents: 21050,
  createdAt: Date.now() - 1000 * 60 * 25,
  table: {
    id: 'tbl_3',
    organizationId: 'org_1',
    name: 'Mesa 02',
    qrCodeToken: '',
    active: true,
    createdAt: 0
  }
},
{
  id: 'ord_123459',
  organizationId: 'org_1',
  tableId: 'tbl_4',
  status: 'DELIVERED',
  totalCents: 4500,
  createdAt: Date.now() - 1000 * 60 * 45,
  table: {
    id: 'tbl_4',
    organizationId: 'org_1',
    name: 'Mesa 08',
    qrCodeToken: '',
    active: true,
    createdAt: 0
  }
}];


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-border">
        <p className="text-sm font-medium text-text-primary mb-1">{label}</p>
        <p className="text-sm text-primary font-semibold">
          {formatCurrency(payload[0].value)}
        </p>
      </div>);

  }
  return null;
};

export default function Dashboard() {
  return (
    <PageContainer>
      <Header title="Dashboard" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="flex items-center p-5">
          <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary mr-4">
            <ClipboardListIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">
              Pedidos Hoje
            </p>
            <p className="text-2xl font-bold text-text-primary">
              {stats.ordersToday}
            </p>
          </div>
        </Card>

        <Card className="flex items-center p-5">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
            <DollarSignIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">
              Receita Hoje
            </p>
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(stats.revenueToday)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center p-5">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
            <LayoutGridIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">
              Mesas Ativas
            </p>
            <p className="text-2xl font-bold text-text-primary">
              {stats.activeTables}
            </p>
          </div>
        </Card>

        <Card className="flex items-center p-5">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-4">
            <BellIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">
              Chamados Abertos
            </p>
            <p className="text-2xl font-bold text-text-primary">
              {stats.openCalls}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart */}
        <Card className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">
              Receita (Últimos 7 dias)
            </h2>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 13 }} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(v) => `R$${(v / 100).toFixed(0)}`} />
                
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FFF3ED' }} />
                <Bar dataKey="receita" fill="#E86024" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">
              Últimos Pedidos
            </h2>
            <Link
              to="/orders"
              className="text-sm text-primary hover:text-primary-hover font-medium flex items-center">
              
              Ver todos <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {recentOrders.map((order) =>
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-border transition-colors">
              
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-text-primary">
                      {order.table?.name}
                    </span>
                    <span className="text-xs text-text-muted">
                      {shortOrderId(order.id)}
                    </span>
                  </div>
                  <div className="text-sm text-text-secondary">
                    {getRelativeTime(order.createdAt)} •{' '}
                    {formatCurrency(order.totalCents)}
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </Link>
            )}
          </div>
        </Card>
      </div>
    </PageContainer>);

}