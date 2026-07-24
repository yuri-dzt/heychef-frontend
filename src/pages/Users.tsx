import React, { useState } from 'react';
import { PlusIcon, Edit2Icon, Trash2Icon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { DataTable } from '../components/DataTable';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorState } from '../components/ErrorState';
import { formatDate } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../api/users';
import type { User, UserRole } from '../types';

export default function Users() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao criar usuário';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof usersApi.update>[1] }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao atualizar usuário';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário excluído');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao excluir usuário';
      toast.error(msg);
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as UserRole
  });
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const handleOpenModal = (user?: User) => {
    setFormErrors({});
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role || 'USER'
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER'
      });
    }
    setIsModalOpen(true);
  };
  const handleSave = () => {
    const errors: { name?: string; email?: string; password?: string } = {};
    if (!formData.name.trim()) {
      errors.name = 'Informe o nome do usuário';
    }
    if (!formData.email.trim()) {
      errors.email = 'Informe o email do usuário';
    }
    if (!editingUser && !formData.password) {
      errors.password = 'Senha é obrigatória para novos usuários';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    if (editingUser) {
      const data: Parameters<typeof usersApi.update>[1] = {
        name: formData.name,
        email: formData.email,
        role: formData.role as 'ADMIN' | 'SUPPORT' | 'USER',
      };
      if (formData.password) {
        data.password = formData.password;
      }
      updateMutation.mutate({ id: editingUser.id, data });
    } else {
      createMutation.mutate({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as 'ADMIN' | 'SUPPORT' | 'USER',
      });
    }
  };
  const handleDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
      setDeleteModalOpen(false);
    }
  };
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="primary">Admin</Badge>;
      case 'SUPPORT':
        return <Badge variant="warning">Suporte</Badge>;
      case 'USER':
        return <Badge variant="default">Usuário</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };
  const columns = [
  {
    header: 'Nome',
    accessorKey: 'name' as keyof User,
    className: 'font-medium'
  },
  {
    header: 'Email',
    accessorKey: 'email' as keyof User
  },
  {
    header: 'Função',
    cell: (user: User) => getRoleBadge(user.role || 'USER')
  },
  {
    header: 'Criado em',
    cell: (user: User) => formatDate(user.createdAt!)
  },
  {
    header: 'Ações',
    className: 'text-right',
    cell: (user: User) => {
      // Prevent editing self or higher roles if not super admin
      const canEdit = currentUser?.role === 'ADMIN';
      if (!canEdit) return null;
      return (
        <div className="flex justify-end gap-2">
            <button
            type="button"
            aria-label={`Editar ${user.name}`}
            onClick={() => handleOpenModal(user)}
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-text-secondary hover:text-primary hover:bg-primary-light rounded-md transition-colors">

              <Edit2Icon className="w-4 h-4" aria-hidden="true" />
            </button>
            {user.id !== currentUser?.id &&
          <button
            type="button"
            aria-label={`Excluir ${user.name}`}
            onClick={() => {
              setUserToDelete(user.id);
              setDeleteModalOpen(true);
            }}
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-text-secondary hover:text-danger hover:bg-red-50 rounded-md transition-colors">

                <Trash2Icon className="w-4 h-4" aria-hidden="true" />
              </button>
          }
          </div>);

    }
  }];

  return (
    <PageContainer>
      <Header
        title="Usuários"
        actions={
        <Button
          onClick={() => handleOpenModal()}
          leftIcon={<PlusIcon className="w-4 h-4" />}>
          
            Novo Usuário
          </Button>
        } />
      

      {isError ?
      <ErrorState onRetry={refetch} /> :
      <DataTable
        data={users}
        columns={columns}
        keyExtractor={(user) => user.id} />
      }


      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
            label="Nome"
            value={formData.name}
            error={formErrors.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
            }}
            required />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            error={formErrors.email}
            autoComplete="email"
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
            }}
            required />

          {!editingUser &&
          <Input
            label="Senha"
            type="password"
            value={formData.password}
            error={formErrors.password}
            autoComplete="new-password"
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: undefined }));
            }}
            required />

          }
          <div>
            <Select
              label="Função"
              options={[
              {
                value: 'USER',
                label: 'Usuário (Garçom/Atendente)'
              },
              {
                value: 'SUPPORT',
                label: 'Suporte (acesso por permissões)'
              },
              {
                value: 'ADMIN',
                label: 'Administrador (Gerente)'
              }]
              }
              value={formData.role}
              onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value as UserRole
              })
              } />
            <p className="text-xs text-text-muted mt-1">
              {formData.role === 'ADMIN' && 'Acesso total: gerencia tudo do estabelecimento'}
              {formData.role === 'SUPPORT' && 'Suporte: acesso limitado por permissões'}
              {formData.role === 'USER' && 'Usuário comum: garçom, cozinheiro, etc (acesso por permissões)'}
            </p>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário? Ele perderá o acesso ao sistema imediatamente."
        isDanger />
      
    </PageContainer>);

}