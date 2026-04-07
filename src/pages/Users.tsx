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
import { formatDate } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../api/users';
import type { User, UserRole } from '../types';

export default function Users() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado');
    },
    onError: () => toast.error('Erro ao criar usuário'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof usersApi.update>[1] }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado');
    },
    onError: () => toast.error('Erro ao atualizar usuário'),
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário excluído');
    },
    onError: () => toast.error('Erro ao excluir usuário'),
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as UserRole
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const handleOpenModal = (user?: User) => {
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
    if (!formData.name || !formData.email) return;
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
      if (!formData.password) {
        toast.error('Senha é obrigatória para novos usuários');
        return;
      }
      createMutation.mutate({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as 'ADMIN' | 'SUPPORT' | 'USER',
      });
    }
    setIsModalOpen(false);
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
            onClick={() => handleOpenModal(user)}
            className="p-2 text-text-secondary hover:text-primary hover:bg-primary-light rounded-md transition-colors">
            
              <Edit2Icon className="w-4 h-4" />
            </button>
            {user.id !== currentUser?.id &&
          <button
            onClick={() => {
              setUserToDelete(user.id);
              setDeleteModalOpen(true);
            }}
            className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-md transition-colors">
            
                <Trash2Icon className="w-4 h-4" />
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
      

      <DataTable
        data={users}
        columns={columns}
        keyExtractor={(user) => user.id} />
      

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
            onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value
            })
            }
            required />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value
            })
            }
            required />
          
          {!editingUser &&
          <Input
            label="Senha"
            type="password"
            value={formData.password}
            onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value
            })
            }
            required />

          }
          <Select
            label="Função"
            options={[
            {
              value: 'USER',
              label: 'Usuário (Garçom/Atendente)'
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