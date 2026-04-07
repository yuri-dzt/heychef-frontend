import React, { useState } from 'react';
import {
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  UsersIcon,
  LayoutGridIcon,
  PackageIcon,
  TagIcon,
  ClipboardListIcon,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { MoneyInput } from '../components/MoneyInput';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { plansApi, type Plan, type CreatePlanRequest } from '../api/plans';
import { formatCurrency } from '../utils/format';

export default function AdminPlans() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreatePlanRequest>({
    name: '',
    description: '',
    priceCents: 0,
    maxUsers: 5,
    maxTables: 10,
    maxProducts: 50,
    maxCategories: 10,
    maxOrdersPerDay: 100,
  });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: plansApi.list,
  });

  const createMutation = useMutation({
    mutationFn: plansApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plano criado');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Erro ao criar plano'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof plansApi.update>[1] }) =>
      plansApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plano atualizado');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Erro ao atualizar plano'),
  });

  const deleteMutation = useMutation({
    mutationFn: plansApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plano excluído');
    },
    onError: () => toast.error('Não é possível excluir um plano que está em uso'),
  });

  const handleOpen = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || '',
        priceCents: plan.priceCents,
        maxUsers: plan.maxUsers,
        maxTables: plan.maxTables,
        maxProducts: plan.maxProducts,
        maxCategories: plan.maxCategories,
        maxOrdersPerDay: plan.maxOrdersPerDay,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        priceCents: 0,
        maxUsers: 5,
        maxTables: 10,
        maxProducts: 50,
        maxCategories: 10,
        maxOrdersPerDay: 100,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleActive = (plan: Plan) => {
    updateMutation.mutate({ id: plan.id, data: { active: !plan.active } });
  };

  const setField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Header title="Planos" />
        <div className="flex items-center justify-center py-12">
          <div className="text-text-muted">Carregando planos...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header
        title="Planos"
        actions={
          <Button onClick={() => handleOpen()} leftIcon={<PlusIcon className="w-4 h-4" />}>
            Novo Plano
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${!plan.active ? 'opacity-60' : ''}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
                {plan.description && (
                  <p className="text-sm text-text-secondary mt-1">{plan.description}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleOpen(plan)}
                  className="p-2 text-text-secondary hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
                >
                  <Edit2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(plan.id)}
                  className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mb-5">
              <span className="text-3xl font-bold text-primary">
                {plan.priceCents === 0 ? 'Grátis' : formatCurrency(plan.priceCents)}
              </span>
              {plan.priceCents > 0 && <span className="text-text-muted text-sm">/mês</span>}
            </div>

            {/* Limits */}
            <div className="space-y-3 mb-5">
              <LimitRow icon={<UsersIcon className="w-4 h-4" />} label="Usuários" value={plan.maxUsers} />
              <LimitRow icon={<LayoutGridIcon className="w-4 h-4" />} label="Mesas" value={plan.maxTables} />
              <LimitRow icon={<PackageIcon className="w-4 h-4" />} label="Produtos" value={plan.maxProducts} />
              <LimitRow icon={<TagIcon className="w-4 h-4" />} label="Categorias" value={plan.maxCategories} />
              <LimitRow icon={<ClipboardListIcon className="w-4 h-4" />} label="Pedidos/dia" value={plan.maxOrdersPerDay} />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Badge variant={plan.active ? 'success' : 'default'}>
                  {plan.active ? 'Ativo' : 'Inativo'}
                </Badge>
                {plan.organizationCount !== undefined && (
                  <span className="text-xs text-text-muted">
                    {plan.organizationCount} estabelecimento{plan.organizationCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleActive(plan)}
                className="text-xs font-medium text-text-secondary hover:text-primary transition-colors"
              >
                {plan.active ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-border">
          <PackageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-text-primary">Nenhum plano</h3>
          <p className="text-text-secondary mt-1">Crie seu primeiro plano.</p>
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Editar Plano' : 'Novo Plano'}
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nome do Plano *"
            value={formData.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Ex: Pro"
          />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Descrição
            </label>
            <textarea
              className="w-full rounded-lg border border-border p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              rows={2}
              value={formData.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Descrição breve do plano..."
            />
          </div>

          <MoneyInput
            label="Preço mensal"
            value={formData.priceCents}
            onChange={(val) => setField('priceCents', val)}
          />

          <div className="pt-2 border-t border-border">
            <p className="text-sm font-medium text-text-primary mb-3">Limites</p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Máx. Usuários"
                type="number"
                value={String(formData.maxUsers)}
                onChange={(e) => setField('maxUsers', parseInt(e.target.value) || 1)}
              />
              <Input
                label="Máx. Mesas"
                type="number"
                value={String(formData.maxTables)}
                onChange={(e) => setField('maxTables', parseInt(e.target.value) || 1)}
              />
              <Input
                label="Máx. Produtos"
                type="number"
                value={String(formData.maxProducts)}
                onChange={(e) => setField('maxProducts', parseInt(e.target.value) || 1)}
              />
              <Input
                label="Máx. Categorias"
                type="number"
                value={String(formData.maxCategories)}
                onChange={(e) => setField('maxCategories', parseInt(e.target.value) || 1)}
              />
              <Input
                label="Máx. Pedidos/dia"
                type="number"
                value={String(formData.maxOrdersPerDay)}
                onChange={(e) => setField('maxOrdersPerDay', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
        title="Excluir Plano"
        message="Tem certeza? Só é possível excluir planos que não estão em uso por nenhum estabelecimento."
        isDanger
      />
    </PageContainer>
  );
}

function LimitRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-text-secondary">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-semibold text-text-primary">
        {value >= 999 ? 'Ilimitado' : value}
      </span>
    </div>
  );
}
