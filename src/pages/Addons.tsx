import React, { useState } from 'react';
import { PlusIcon, Edit2Icon, Trash2Icon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addonGroupsGlobalApi } from '../api/addon-groups-global';
import type { AddonGroup } from '../api/addon-groups-global';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { MoneyInput } from '../components/MoneyInput';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatCurrency } from '../utils/format';

export default function Addons() {
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['addon-groups'],
    queryFn: addonGroupsGlobalApi.list,
  });

  // Group mutations
  const createGroupMutation = useMutation({
    mutationFn: addonGroupsGlobalApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addon-groups'] });
      toast.success('Grupo criado');
      setIsGroupModalOpen(false);
    },
    onError: () => {
      toast.error('Erro ao criar grupo');
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; minSelect?: number; maxSelect?: number } }) =>
      addonGroupsGlobalApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addon-groups'] });
      toast.success('Grupo atualizado');
      setIsGroupModalOpen(false);
    },
    onError: () => {
      toast.error('Erro ao atualizar grupo');
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: addonGroupsGlobalApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addon-groups'] });
      toast.success('Grupo excluído');
    },
    onError: () => {
      toast.error('Erro ao excluir grupo');
    },
  });

  // Item mutations
  const createItemMutation = useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: { name: string; priceCents: number } }) =>
      addonGroupsGlobalApi.createItem(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addon-groups'] });
      toast.success('Item adicionado');
      setAddingItemToGroupId(null);
      setNewItemData({ name: '', priceCents: 0 });
    },
    onError: () => {
      toast.error('Erro ao adicionar item');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: addonGroupsGlobalApi.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addon-groups'] });
      toast.success('Item excluído');
    },
    onError: () => {
      toast.error('Erro ao excluir item');
    },
  });

  // Group modal state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AddonGroup | null>(null);
  const [groupFormData, setGroupFormData] = useState({ name: '', minSelect: 0, maxSelect: 3 });

  // Item inline form state
  const [addingItemToGroupId, setAddingItemToGroupId] = useState<string | null>(null);
  const [newItemData, setNewItemData] = useState({ name: '', priceCents: 0 });

  // Delete confirm state
  const [deleteGroupModalOpen, setDeleteGroupModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [deleteItemModalOpen, setDeleteItemModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleOpenGroupModal = (group?: AddonGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupFormData({ name: group.name, minSelect: group.minSelect, maxSelect: group.maxSelect });
    } else {
      setEditingGroup(null);
      setGroupFormData({ name: '', minSelect: 0, maxSelect: 3 });
    }
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = () => {
    if (!groupFormData.name.trim()) {
      toast.error('Preencha o nome do grupo');
      return;
    }
    if (editingGroup) {
      updateGroupMutation.mutate({
        id: editingGroup.id,
        data: {
          name: groupFormData.name,
          minSelect: groupFormData.minSelect,
          maxSelect: groupFormData.maxSelect,
        },
      });
    } else {
      createGroupMutation.mutate({
        name: groupFormData.name,
        minSelect: groupFormData.minSelect,
        maxSelect: groupFormData.maxSelect,
      });
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Header title="Adicionais" />
        <div className="flex items-center justify-center py-12">
          <div className="text-text-muted">Carregando adicionais...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header
        title="Adicionais"
        actions={
          <Button
            onClick={() => handleOpenGroupModal()}
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            Novo Grupo
          </Button>
        }
      />

      <div className="space-y-6">
        {groups.map((group) => (
          <Card key={group.id} className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-text-primary">{group.name}</h3>
                <p className="text-sm text-text-secondary mt-0.5">
                  Mínimo: {group.minSelect} | Máximo: {group.maxSelect}
                </p>
                {group.products && group.products.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {group.products.map((product) => (
                      <Badge key={product.id} variant="primary">
                        {product.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenGroupModal(group)}
                  className="p-2 text-text-secondary hover:text-primary hover:bg-primary-light rounded-md transition-colors"
                >
                  <Edit2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setGroupToDelete(group.id);
                    setDeleteGroupModalOpen(true);
                  }}
                  className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg border border-border divide-y divide-border">
              {group.items?.map((item) => (
                <div
                  key={item.id}
                  className="p-3 flex justify-between items-center text-sm"
                >
                  <span>{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCurrency(item.priceCents)}</span>
                    <button
                      className="text-text-secondary hover:text-danger"
                      onClick={() => {
                        setItemToDelete(item.id);
                        setDeleteItemModalOpen(true);
                      }}
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {addingItemToGroupId === group.id ? (
                <div className="p-3 space-y-2">
                  <Input
                    label="Nome do item"
                    value={newItemData.name}
                    onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                    placeholder="Ex: Queijo extra"
                  />
                  <MoneyInput
                    label="Preço"
                    value={newItemData.priceCents}
                    onChange={(val) => setNewItemData({ ...newItemData, priceCents: val })}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setAddingItemToGroupId(null)}>
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      disabled={createItemMutation.isPending || !newItemData.name}
                      onClick={() => {
                        createItemMutation.mutate({
                          groupId: group.id,
                          data: { name: newItemData.name, priceCents: newItemData.priceCents },
                        });
                      }}
                    >
                      {createItemMutation.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-gray-50 text-center">
                  <button
                    className="text-xs font-medium text-primary hover:text-primary-hover"
                    onClick={() => {
                      setAddingItemToGroupId(group.id);
                      setNewItemData({ name: '', priceCents: 0 });
                    }}
                  >
                    + Adicionar Item
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {groups.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-border">
            <h3 className="text-lg font-medium text-text-primary">
              Nenhum grupo de adicionais
            </h3>
            <p className="text-text-secondary mt-1">
              Crie um grupo para configurar opções extras para seus produtos.
            </p>
          </div>
        )}
      </div>

      {/* Group Form Modal */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title={editingGroup ? 'Editar Grupo' : 'Novo Grupo'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsGroupModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveGroup}
              disabled={createGroupMutation.isPending || updateGroupMutation.isPending}
            >
              {createGroupMutation.isPending || updateGroupMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nome do grupo *"
            value={groupFormData.name}
            onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
            placeholder="Ex: Escolha seu molho"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mínimo de seleções"
              type="number"
              value={String(groupFormData.minSelect)}
              onChange={(e) => setGroupFormData({ ...groupFormData, minSelect: Number(e.target.value) })}
            />
            <Input
              label="Máximo de seleções"
              type="number"
              value={String(groupFormData.maxSelect)}
              onChange={(e) => setGroupFormData({ ...groupFormData, maxSelect: Number(e.target.value) })}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteGroupModalOpen}
        onClose={() => {
          setDeleteGroupModalOpen(false);
          setGroupToDelete(null);
        }}
        onConfirm={() => {
          if (groupToDelete) {
            deleteGroupMutation.mutate(groupToDelete);
            setDeleteGroupModalOpen(false);
            setGroupToDelete(null);
          }
        }}
        title="Excluir Grupo"
        message="Tem certeza que deseja excluir este grupo de adicionais? Todos os itens serão removidos."
        isDanger
      />

      <ConfirmDialog
        isOpen={deleteItemModalOpen}
        onClose={() => {
          setDeleteItemModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={() => {
          if (itemToDelete) {
            deleteItemMutation.mutate(itemToDelete);
            setDeleteItemModalOpen(false);
            setItemToDelete(null);
          }
        }}
        title="Excluir Item"
        message="Tem certeza que deseja excluir este item?"
        isDanger
      />
    </PageContainer>
  );
}
