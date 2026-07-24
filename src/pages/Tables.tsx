import React, { useState, useEffect, useRef } from 'react';
import {
  PlusIcon,
  QrCodeIcon,
  LinkIcon,
  MoreVerticalIcon,
  Trash2Icon,
  Edit2Icon } from
'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { QRCodeCard } from '../components/QRCodeCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorState } from '../components/ErrorState';
import { Skeleton } from '../components/Skeleton';
import { tablesApi } from '../api/tables';
import type { Table } from '../types';

export default function Tables() {
  const queryClient = useQueryClient();
  const { data: tables = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: tablesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Mesa criada');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao criar mesa';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof tablesApi.update>[1] }) =>
      tablesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Mesa atualizada');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao atualizar mesa';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tablesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Mesa excluída');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao excluir mesa';
      toast.error(msg);
    },
  });

  const regenerateTokenMutation = useMutation({
    mutationFn: tablesApi.regenerateToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Token regenerado com sucesso');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao regenerar token';
      toast.error(msg);
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [tableName, setTableName] = useState('');
  // Click-controlled row menu (one open at a time)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Confirm dialogs
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = useState(false);

  // Close the row menu on outside click or Escape.
  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [openMenuId]);
  const handleOpenModal = (table?: Table) => {
    if (table) {
      setSelectedTable(table);
      setTableName(table.name);
    } else {
      setSelectedTable(null);
      setTableName('');
    }
    setIsModalOpen(true);
  };
  const handleSave = () => {
    if (!tableName.trim()) return;
    if (selectedTable) {
      updateMutation.mutate({ id: selectedTable.id, data: { name: tableName } });
    } else {
      createMutation.mutate({ name: tableName });
    }
    setIsModalOpen(false);
  };
  const toggleActive = (id: string) => {
    const table = tables.find((t) => t.id === id);
    if (table) {
      updateMutation.mutate({ id, data: { active: !table.active } });
    }
  };
  const openQRModal = (table: Table) => {
    setSelectedTable(table);
    setIsQRModalOpen(true);
  };
  const copyLink = (token: string) => {
    const url = `${window.location.origin}/cardapio/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado para a área de transferência');
  };
  return (
    <PageContainer>
      <Header
        title="Mesas e QR Codes"
        actions={
        <Button
          onClick={() => handleOpenModal()}
          leftIcon={<PlusIcon className="w-4 h-4" />}>
          
            Nova Mesa
          </Button>
        } />
      

      {isError ?
      <ErrorState onRetry={refetch} /> :
      isLoading ?
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) =>
        <Card key={i} className="flex flex-col items-center text-center">
              <Skeleton width={80} height={20} className="self-start mb-4" />
              <Skeleton width={96} height={96} className="mb-4" />
              <Skeleton width={120} height={20} className="mb-4" />
              <Skeleton height={32} />
            </Card>
        )}
        </div> :
      tables.length === 0 ?
      <div className="text-center py-12 bg-white rounded-xl border border-border">
          <QrCodeIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-text-primary">
            Nenhuma mesa cadastrada
          </h3>
          <p className="text-text-secondary mt-1">
            Crie uma mesa para gerar seu QR Code do cardápio.
          </p>
        </div> :
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {tables.map((table) =>
        <Card
          key={table.id}
          className="flex flex-col items-center text-center"
          hoverable>

            <div className="w-full flex justify-between items-start mb-4">
              <Badge variant={table.active ? 'success' : 'default'}>
                {table.active ? 'Ativa' : 'Inativa'}
              </Badge>

              <div className="relative" ref={openMenuId === table.id ? menuRef : undefined}>
                <button
                onClick={() => setOpenMenuId(openMenuId === table.id ? null : table.id)}
                aria-label="Ações da mesa"
                aria-haspopup="menu"
                aria-expanded={openMenuId === table.id}
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-text-muted hover:text-text-primary">
                  <MoreVerticalIcon className="w-4 h-4" aria-hidden="true" />
                </button>
                {openMenuId === table.id &&
                <div role="menu" className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg border border-border z-10 py-1">
                  <button
                  role="menuitem"
                  onClick={() => {
                    setOpenMenuId(null);
                    handleOpenModal(table);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-gray-50 flex items-center gap-2">

                    <Edit2Icon className="w-3.5 h-3.5" aria-hidden="true" /> Editar
                  </button>
                  <button
                  role="menuitem"
                  onClick={() => {
                    setOpenMenuId(null);
                    toggleActive(table.id);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-gray-50">

                    {table.active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                  role="menuitem"
                  onClick={() => {
                    setOpenMenuId(null);
                    setTableToDelete(table);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-red-50 flex items-center gap-2">

                    <Trash2Icon className="w-3.5 h-3.5" aria-hidden="true" /> Excluir mesa
                  </button>
                </div>
                }
              </div>
            </div>

            <div
            className="w-24 h-24 bg-gray-50 rounded-xl border border-border flex items-center justify-center mb-4 cursor-pointer hover:border-primary transition-colors"
            onClick={() => openQRModal(table)}>

              <QrCodeIcon className="w-10 h-10 text-text-muted" />
            </div>

            <h3 className="font-bold text-lg text-text-primary">
              {table.name}
            </h3>

            <div className="mt-4 w-full grid grid-cols-2 gap-2">
              <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs"
              onClick={() => openQRModal(table)}>

                Ver QR
              </Button>
              <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs bg-gray-50"
              onClick={() => copyLink(table.qrCodeToken)}>

                <LinkIcon className="w-3 h-3 mr-1" /> Link
              </Button>
            </div>
          </Card>
        )}
      </div>
      }

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTable ? 'Editar Mesa' : 'Nova Mesa'}
        footer={
        <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </>
        }>
        
        <div className="space-y-4">
          <Input
            label="Nome da Mesa"
            placeholder="Ex: Mesa 01, Balcão 2"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            autoFocus />
          
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title={`QR Code - ${selectedTable?.name}`}
        maxWidth="sm">
        
        {selectedTable &&
        <div className="flex flex-col items-center py-4">
            <QRCodeCard
            url={`${window.location.origin}/cardapio/${selectedTable.qrCodeToken}`}
            size={240}
            showDownload
            tableName={selectedTable.name} />
          

            <div className="w-full mt-8 pt-6 border-t border-border">
              <p className="text-sm font-medium text-text-primary mb-2">
                Link do Cardápio
              </p>
              <div className="flex gap-2">
                <Input
                readOnly
                value={`${window.location.origin}/cardapio/${selectedTable.qrCodeToken}`}
                className="bg-gray-50 text-xs" />
              
                <Button
                variant="secondary"
                onClick={() => copyLink(selectedTable.qrCodeToken)}
                title="Copiar link">
                
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                variant="ghost"
                className="text-danger hover:bg-red-50 text-sm"
                onClick={() => setRegenerateConfirmOpen(true)}>

                  Regerar Token (Invalida o QR atual)
                </Button>
              </div>
            </div>
          </div>
        }
      </Modal>

      <ConfirmDialog
        isOpen={tableToDelete !== null}
        onClose={() => setTableToDelete(null)}
        onConfirm={() => {
          if (tableToDelete) {
            deleteMutation.mutate(tableToDelete.id);
            setTableToDelete(null);
          }
        }}
        title="Excluir mesa"
        message={`Tem certeza que deseja excluir a mesa "${tableToDelete?.name}"? Esta ação não pode ser desfeita e o QR Code associado deixará de funcionar.`}
        confirmText="Excluir"
        isDanger
        isLoading={deleteMutation.isPending} />

      <ConfirmDialog
        isOpen={regenerateConfirmOpen}
        onClose={() => setRegenerateConfirmOpen(false)}
        onConfirm={() => {
          if (selectedTable) {
            regenerateTokenMutation.mutate(selectedTable.id);
          }
          setRegenerateConfirmOpen(false);
        }}
        title="Regerar Token"
        message="Ao regerar o token, o QR Code atual deixará de funcionar imediatamente. Todos os QR Codes já impressos ou compartilhados precisarão ser substituídos. Deseja continuar?"
        confirmText="Regerar Token"
        isDanger
        isLoading={regenerateTokenMutation.isPending} />

    </PageContainer>);

}