import React, { useState } from 'react';
import { DownloadIcon, CalendarIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RefreshCwIcon } from 'lucide-react';
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
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DataTable } from '../components/DataTable';
import { formatCurrency } from '../utils/format';
import { reportsApi } from '../api/reports';
import type { ReportDaily } from '../types';

export default function Reports() {
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: reportsApi.generate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Relatórios gerados com sucesso');
    },
    onError: () => {
      toast.error('Erro ao gerar relatórios');
    },
  });
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports', startDate, endDate],
    queryFn: () => reportsApi.getDaily(startDate, endDate),
  });

  const totals = reports.reduce(
    (acc, curr) => ({
      orders: acc.orders + curr.totalOrders,
      revenue: acc.revenue + curr.totalRevenueCents
    }),
    {
      orders: 0,
      revenue: 0
    }
  );
  const columns = [
  {
    header: 'Data',
    cell: (row: ReportDaily) => {
      const [y, m, d] = row.date.split('-');
      return `${d}/${m}/${y}`;
    }
  },
  {
    header: 'Total de Pedidos',
    accessorKey: 'totalOrders' as keyof ReportDaily
  },
  {
    header: 'Ticket Médio',
    cell: (row: ReportDaily) =>
    formatCurrency(row.totalRevenueCents / row.totalOrders)
  },
  {
    header: 'Receita Total',
    className: 'text-right font-medium text-primary',
    cell: (row: ReportDaily) => formatCurrency(row.totalRevenueCents)
  }];

  return (
    <PageContainer>
      <Header
        title="Relatórios"
        actions={
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => generateMutation.mutate()}
            isLoading={generateMutation.isPending}
            leftIcon={<RefreshCwIcon className="w-4 h-4" />}>
            Gerar Relatórios
          </Button>
          <Button
            variant="secondary"
            leftIcon={<DownloadIcon className="w-4 h-4" />}>
            Exportar CSV
          </Button>
        </div>
        } />
      

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Data Inicial
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <input
                type="date"
                className="block w-full rounded-lg border border-border bg-white pl-10 pr-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)} />
              
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Data Final
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <input
                type="date"
                className="block w-full rounded-lg border border-border bg-white pl-10 pr-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)} />
              
            </div>
          </div>
          <Button className="w-full sm:w-auto">Filtrar</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="bg-primary text-white border-none">
          <p className="text-primary-light text-sm font-medium">
            Total de Pedidos (Período)
          </p>
          <p className="text-3xl font-bold mt-1">{totals.orders}</p>
        </Card>
        <Card className="bg-green-600 text-white border-none">
          <p className="text-green-100 text-sm font-medium">
            Receita Total (Período)
          </p>
          <p className="text-3xl font-bold mt-1">
            {formatCurrency(totals.revenue)}
          </p>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="mb-6">
        <h3 className="font-semibold text-text-primary mb-4">Receita por Dia</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={[...reports].reverse().map((r) => ({
              date: (() => {
                const [y, m, d] = r.date.split('-');
                return `${d}/${m}`;
              })(),
              receita: r.totalRevenueCents,
              pedidos: r.totalOrders
            }))}
            barSize={24}>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }} />
            
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(v) => `R$${(v / 100).toFixed(0)}`} />
            
            <Tooltip
              content={({ active, payload, label }: any) => {
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
              }}
              cursor={{ fill: '#FFF3ED' }} />
            
            <Bar dataKey="receita" fill="#E86024" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card noPadding className="overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50">
          <h3 className="font-semibold text-text-primary">
            Detalhamento Diário
          </h3>
        </div>
        <DataTable
          data={reports}
          columns={columns}
          keyExtractor={(row) => row.id} />
        
        <div className="p-4 bg-gray-50 border-t border-border flex justify-between items-center font-bold">
          <span>Totais</span>
          <span className="text-primary">{formatCurrency(totals.revenue)}</span>
        </div>
      </Card>
    </PageContainer>);

}