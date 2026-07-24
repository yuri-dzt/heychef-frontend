import React, { useState } from 'react';
import { PlusIcon, GripVerticalIcon, Edit2Icon, Trash2Icon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoriesApi } from '../api/categories';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorState } from '../components/ErrorState';
import type { Category } from '../types';

export default function Categories() {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria criada');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao criar categoria';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof categoriesApi.update>[1] }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria atualizada');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao atualizar categoria';
      toast.error(msg);
    },
  });

  // Reorder issues both orderIndex swaps as one logical update (sequential to
  // avoid a race) and surfaces a single success toast.
  const reorderMutation = useMutation({
    mutationFn: async ({
      first,
      second,
    }: {
      first: { id: string; orderIndex: number };
      second: { id: string; orderIndex: number };
    }) => {
      await categoriesApi.update(first.id, { orderIndex: first.orderIndex });
      await categoriesApi.update(second.id, { orderIndex: second.orderIndex });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria atualizada');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao reordenar categorias';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria excluída');
      setDeleteModalOpen(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao excluir categoria';
      toast.error(msg);
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
    } else {
      setEditingCategory(null);
      setName('');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: { name } });
    } else {
      createMutation.mutate({ name });
    }
  };

  const handleDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete);
    }
  };

  const toggleActive = (category: Category) => {
    updateMutation.mutate({ id: category.id, data: { active: !category.active } });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const cat = categories[index];
    const prev = categories[index - 1];
    reorderMutation.mutate({
      first: { id: cat.id, orderIndex: prev.orderIndex },
      second: { id: prev.id, orderIndex: cat.orderIndex },
    });
  };

  const moveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const cat = categories[index];
    const next = categories[index + 1];
    reorderMutation.mutate({
      first: { id: cat.id, orderIndex: next.orderIndex },
      second: { id: next.id, orderIndex: cat.orderIndex },
    });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Header title="Categorias" />
        <div className="flex items-center justify-center py-12">
          <div className="text-text-muted">Carregando categorias...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header
        title="Categorias"
        actions={
        <Button
          onClick={() => handleOpenModal()}
          leftIcon={<PlusIcon className="w-4 h-4" />}>

            Nova Categoria
          </Button>
        } />


      {isError ?
      <ErrorState onRetry={refetch} /> :
      <Card noPadding>
        <div className="divide-y divide-border">
          {categories.map((category, index) =>
          <div
            key={category.id}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">

              <div className="flex items-center gap-4">
                <div className="flex flex-col text-gray-300">
                  <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  aria-label="Mover para cima"
                  className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-primary disabled:opacity-30 disabled:hover:text-gray-300">

                    <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true">

                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  </button>
                  <button
                  onClick={() => moveDown(index)}
                  disabled={index === categories.length - 1}
                  aria-label="Mover para baixo"
                  className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-primary disabled:opacity-30 disabled:hover:text-gray-300">

                    <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true">

                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>

                <div>
                  <h3 className="font-medium text-text-primary">
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={category.active ? 'success' : 'default'}>
                      {category.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                onClick={() => toggleActive(category)}
                className="text-sm font-medium text-text-secondary hover:text-primary px-3 py-1.5 min-h-[44px] rounded-md hover:bg-primary-light transition-colors">

                  {category.active ? 'Desativar' : 'Ativar'}
                </button>
                <button
                onClick={() => handleOpenModal(category)}
                aria-label="Editar categoria"
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary-light rounded-md transition-colors">

                  <Edit2Icon className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                onClick={() => {
                  setCategoryToDelete(category.id);
                  setDeleteModalOpen(true);
                }}
                aria-label="Excluir categoria"
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-text-secondary hover:text-danger hover:bg-red-50 rounded-md transition-colors">

                  <Trash2Icon className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {categories.length === 0 &&
          <div className="p-8 text-center text-text-muted">
              Nenhuma categoria cadastrada.
            </div>
          }
        </div>
      </Card>
      }

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
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
        }>

        <div className="space-y-4">
          <Input
            label="Nome da Categoria"
            placeholder="Ex: Bebidas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus />

        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Categoria"
        message="Tem certeza que deseja excluir esta categoria? Os produtos associados a ela ficarão sem categoria."
        isDanger />

    </PageContainer>);

}
