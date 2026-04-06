import React, { useState } from 'react';
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
import { tablesApi } from '../api/tables';
import type { Table } from '../types';

export default function Tables() {
  const queryClient = useQueryClient();
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: tablesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Mesa criada');
    },
    onError: () => toast.error('Erro ao criar mesa'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof tablesApi.update>[1] }) =>
      tablesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Mesa atualizada');
    },
    onError: () => toast.error('Erro ao atualizar mesa'),
  });

  const deleteMutation = useMutation({
    mutationFn: tablesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Mesa excluída');
    },
    onError: () => toast.error('Erro ao excluir mesa'),
  });

  const regenerateTokenMutation = useMutation({
    mutationFn: tablesApi.regenerateToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Token regenerado com sucesso');
    },
    onError: () => toast.error('Erro ao regenerar token'),
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [tableName, setTableName] = useState('');
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
      

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {tables.map((table) =>
        <Card
          key={table.id}
          className="flex flex-col items-center text-center group"
          hoverable>
          
            <div className="w-full flex justify-between items-start mb-4">
              <Badge variant={table.active ? 'success' : 'default'}>
                {table.active ? 'Ativa' : 'Inativa'}
              </Badge>

              <div className="relative">
                <button className="text-text-muted hover:text-text-primary p-1">
                  <MoreVerticalIcon className="w-4 h-4" />
                </button>
                {/* Simple dropdown simulation on hover for demo */}
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                  onClick={() => handleOpenModal(table)}
                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 flex items-center gap-2">
                  
                    <Edit2Icon className="w-3 h-3" /> Editar
                  </button>
                  <button
                  onClick={() => toggleActive(table.id)}
                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50">
                  
                    {table.active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
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
                onClick={() => regenerateTokenMutation.mutate(selectedTable.id)}>

                  Regerar Token (Invalida o QR atual)
                </Button>
              </div>
            </div>
          </div>
        }
      </Modal>
    </PageContainer>);

}