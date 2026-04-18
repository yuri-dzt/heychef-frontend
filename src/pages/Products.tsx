import React, { useState } from 'react';
import {
  PlusIcon,
  ImageIcon,
  SearchIcon,
  FilterIcon,
  Edit2Icon,
  Trash2Icon,
  ExternalLinkIcon } from
'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ImageUpload } from '../components/ImageUpload';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import { addonGroupsGlobalApi } from '../api/addon-groups-global';
import { PageContainer } from '../components/PageContainer';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { MoneyInput } from '../components/MoneyInput';
import { IngredientsInput } from '../components/IngredientsInput';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatCurrency } from '../utils/format';
import type { Product, Category } from '../types';

export default function Products() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list(),
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const { data: globalAddonGroups = [] } = useQuery({
    queryKey: ['addon-groups'],
    queryFn: addonGroupsGlobalApi.list,
  });

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto criado');
      setIsProductModalOpen(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao criar produto';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof productsApi.update>[1] }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado');
      setIsProductModalOpen(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao atualizar produto';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto excluído');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao excluir produto';
      toast.error(msg);
    },
  });

  // Addon link/unlink mutations
  const linkAddonMutation = useMutation({
    mutationFn: ({ groupId, productId }: { groupId: string; productId: string }) =>
      addonGroupsGlobalApi.linkToProduct(groupId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['addon-groups'] });
      toast.success('Grupo vinculado');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao vincular grupo';
      toast.error(msg);
    },
  });

  const unlinkAddonMutation = useMutation({
    mutationFn: ({ groupId, productId }: { groupId: string; productId: string }) =>
      addonGroupsGlobalApi.unlinkFromProduct(groupId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['addon-groups'] });
      toast.success('Grupo desvinculado');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao desvincular grupo';
      toast.error(msg);
    },
  });

  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceCents: 0,
    categoryId: '',
    imageUrl: '',
    active: true,
    ingredients: [] as string[]
  });
  // Delete confirm state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  // Addon Group Modal State
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [selectedProductForAddon, setSelectedProductForAddon] =
  useState<Product | null>(null);

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        priceCents: product.priceCents,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl || '',
        active: product.active,
        ingredients: product.ingredients || []
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        priceCents: 0,
        categoryId: categories[0]?.id || '',
        imageUrl: '',
        active: true,
        ingredients: []
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.categoryId) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct.id,
        data: {
          name: formData.name,
          description: formData.description,
          priceCents: formData.priceCents,
          categoryId: formData.categoryId,
          imageUrl: formData.imageUrl,
          active: formData.active,
          ingredients: formData.ingredients.length > 0 ? formData.ingredients : undefined,
        },
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        description: formData.description,
        priceCents: formData.priceCents,
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl,
        active: formData.active,
        ingredients: formData.ingredients.length > 0 ? formData.ingredients : undefined,
      });
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  // Keep selectedProductForAddon in sync with fresh data from the query
  const currentAddonProduct = selectedProductForAddon
    ? products.find((p) => p.id === selectedProductForAddon.id) || selectedProductForAddon
    : null;

  const isGroupLinked = (groupId: string): boolean => {
    if (!currentAddonProduct?.addonGroups) return false;
    return currentAddonProduct.addonGroups.some((g) => g.id === groupId);
  };

  const handleToggleAddonGroup = (groupId: string) => {
    if (!currentAddonProduct) return;
    if (isGroupLinked(groupId)) {
      unlinkAddonMutation.mutate({ groupId, productId: currentAddonProduct.id });
    } else {
      linkAddonMutation.mutate({ groupId, productId: currentAddonProduct.id });
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
    filterCategory === 'all' || p.categoryId === filterCategory;
    const matchesSearch =
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isLoading = isLoadingProducts || isLoadingCategories;

  if (isLoading) {
    return (
      <PageContainer>
        <Header title="Produtos" />
        <div className="flex items-center justify-center py-12">
          <div className="text-text-muted">Carregando produtos...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header
        title="Produtos"
        actions={
        <Button
          onClick={() => handleOpenProductModal()}
          leftIcon={<PlusIcon className="w-4 h-4" />}>

            Novo Produto
          </Button>
        } />


      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<SearchIcon className="w-4 h-4" />} />

        </div>
        <div className="w-full sm:w-64">
          <Select
            options={[
            {
              value: 'all',
              label: 'Todas as categorias'
            },
            ...categories.map((c) => ({
              value: c.id,
              label: c.name
            }))]
            }
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)} />

        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const category = categories.find(
            (c) => c.id === product.categoryId
          );
          return (
            <Card
              key={product.id}
              className="flex flex-col overflow-hidden group"
              noPadding
              hoverable>

              <div className="h-48 bg-gray-100 relative flex items-center justify-center">
                {product.imageUrl ?
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover" /> :


                <ImageIcon className="w-12 h-12 text-gray-300" />
                }
                {!product.active &&
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                    <Badge variant="default" className="text-sm px-3 py-1">
                      Inativo
                    </Badge>
                  </div>
                }

                {/* Hover Dim Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />

                {/* Quick Actions Overlay */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenProductModal(product)}
                    className="p-2 bg-white rounded-full shadow-sm text-text-secondary hover:text-primary transition-colors">

                    <Edit2Icon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 bg-white rounded-full shadow-sm text-text-secondary hover:text-danger transition-colors">

                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-text-primary line-clamp-1">
                    {product.name}
                  </h3>
                  <span className="font-bold text-primary whitespace-nowrap ml-2">
                    {formatCurrency(product.priceCents)}
                  </span>
                </div>

                <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-1">
                  {product.description || 'Sem descrição'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                    {category?.name}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedProductForAddon(product);
                      setIsAddonModalOpen(true);
                    }}
                    className="text-sm font-medium text-primary hover:text-primary-hover">

                    {product.addonGroups?.length ?
                    `${product.addonGroups.length} grupos de adicionais` :
                    '+ Adicionais'}
                  </button>
                </div>
              </div>
            </Card>);

        })}
      </div>

      {filteredProducts.length === 0 &&
      <div className="text-center py-12 bg-white rounded-xl border border-border">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-text-primary">
            Nenhum produto encontrado
          </h3>
          <p className="text-text-secondary mt-1">
            Tente mudar os filtros ou crie um novo produto.
          </p>
        </div>
      }

      {/* Product Form Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
        maxWidth="lg"
        footer={
        <>
            <Button
            variant="ghost"
            onClick={() => setIsProductModalOpen(false)}>

              Cancelar
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar Produto'}
            </Button>
          </>
        }>

        <div className="space-y-4">
          <Input
            label="Nome do Produto *"
            value={formData.name}
            onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value
            })
            }
            required />


          <div className="grid grid-cols-2 gap-4">
            <MoneyInput
              label="Preço *"
              value={formData.priceCents}
              onChange={(val) =>
              setFormData({
                ...formData,
                priceCents: val
              })
              } />


            <Select
              label="Categoria *"
              options={categories.map((c) => ({
                value: c.id,
                label: c.name
              }))}
              value={formData.categoryId}
              onChange={(e) =>
              setFormData({
                ...formData,
                categoryId: e.target.value
              })
              } />

          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Descrição
            </label>
            <textarea
              className="w-full rounded-lg border border-border p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              rows={3}
              value={formData.description}
              onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value
              })
              }
              placeholder="Descreva os ingredientes e detalhes do produto..." />

          </div>

          <IngredientsInput
            label="Ingredientes (opcional)"
            value={formData.ingredients}
            onChange={(ingredients) => setFormData({ ...formData, ingredients })}
          />

          <ImageUpload
            label="Imagem (opcional)"
            value={formData.imageUrl}
            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
          />


          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary focus:ring-primary"
              checked={formData.active}
              onChange={(e) =>
              setFormData({
                ...formData,
                active: e.target.checked
              })
              } />

            <span className="text-sm font-medium text-text-primary">
              Produto ativo no cardápio
            </span>
          </label>
        </div>
      </Modal>

      {/* Addons Modal */}
      <Modal
        isOpen={isAddonModalOpen}
        onClose={() => {
          setIsAddonModalOpen(false);
        }}
        title={`Adicionais: ${currentAddonProduct?.name}`}
        maxWidth="xl">

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-text-secondary">
              Selecione os grupos de adicionais disponíveis para este produto.
            </p>
            <button
              onClick={() => {
                setIsAddonModalOpen(false);
                navigate('/menu/addons');
              }}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
            >
              <ExternalLinkIcon className="w-4 h-4" />
              Gerenciar Adicionais
            </button>
          </div>

          {globalAddonGroups.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-text-muted text-sm">
                Nenhum grupo de adicionais cadastrado.
              </p>
              <button
                onClick={() => {
                  setIsAddonModalOpen(false);
                  navigate('/menu/addons');
                }}
                className="text-sm font-medium text-primary hover:text-primary-hover mt-2 inline-block"
              >
                Criar grupos de adicionais
              </button>
            </div>
          )}

          {globalAddonGroups.map((group) => {
            const linked = isGroupLinked(group.id);
            return (
              <Card key={group.id} className={`p-4 ${linked ? 'bg-primary/5 border-primary/30' : 'bg-gray-50'}`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={linked}
                    onChange={() => handleToggleAddonGroup(group.id)}
                    disabled={linkAddonMutation.isPending || unlinkAddonMutation.isPending}
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-text-primary">{group.name}</h4>
                    <p className="text-xs text-text-secondary">
                      Mínimo: {group.minSelect} | Máximo: {group.maxSelect}
                    </p>
                    {group.items && group.items.length > 0 && (
                      <div className="mt-2 bg-white rounded-lg border border-border divide-y divide-border">
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 flex justify-between items-center text-sm"
                          >
                            <span className="text-text-secondary">{item.name}</span>
                            <span className="font-medium text-text-secondary">
                              {formatCurrency(item.priceCents)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Produto"
        message="Tem certeza que deseja excluir este produto?"
        isDanger />

    </PageContainer>);

}
