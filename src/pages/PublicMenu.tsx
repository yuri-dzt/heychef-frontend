import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBagIcon,
  BellIcon,
  ChevronLeftIcon,
  PlusIcon,
  MinusIcon,
  XIcon,
  CheckCircle2Icon } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { publicApi, type ActiveOrder } from '../api/public';
import { formatCurrency } from '../utils/format';
import type {
  PublicMenu as PublicMenuType,
  PublicProduct,
  CartItem,
  SelectedAddon } from
'../types';
export default function PublicMenu() {
  const { tableToken } = useParams();

  const { data: menu, isLoading, isError } = useQuery<PublicMenuType>({
    queryKey: ['publicMenu', tableToken],
    queryFn: () => publicApi.getMenu(tableToken!),
    enabled: !!tableToken,
  });

  const queryClient = useQueryClient();

  const { data: activeOrder, refetch: refetchActiveOrder } = useQuery<ActiveOrder | null>({
    queryKey: ['activeOrder', tableToken],
    queryFn: () => publicApi.getActiveOrder(tableToken!),
    enabled: !!tableToken,
  });

  // SSE for real-time order updates on this table
  useEffect(() => {
    if (!tableToken) return;
    const apiUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
      ? import.meta.env.VITE_API_URL
      : 'http://localhost:3333';

    const es = new EventSource(`${apiUrl}/public/events/${tableToken}`);

    es.addEventListener('order-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['activeOrder', tableToken] });
    });

    es.onerror = () => {
      es.close();
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['activeOrder', tableToken] });
      }, 3000);
    };

    return () => es.close();
  }, [tableToken, queryClient]);

  const [showActiveOrder, setShowActiveOrder] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  // Cart/Checkout State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Set initial active category once menu loads
  useEffect(() => {
    if (menu?.categories?.length && !activeCategory) {
      setActiveCategory(menu.categories[0].id);
    }
  }, [menu, activeCategory]);

  // Scroll spy for categories
  useEffect(() => {
    if (!menu) return;
    const handleScroll = () => {
      const sections = menu.categories.map((c) =>
      document.getElementById(`category-${c.id}`)
      );
      const scrollPosition = window.scrollY + 150; // Offset for header
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveCategory(menu.categories[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menu]);
  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const element = document.getElementById(`category-${id}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };
  const openProductModal = (product: PublicProduct) => {
    setSelectedProduct(product);
    setQuantity(1);
    // Pre-select required addons (minSelect > 0)
    const initialAddons: SelectedAddon[] = [];
    product.addonGroups?.forEach((group) => {
      if (group.minSelect > 0 && group.items && group.items.length > 0) {
        initialAddons.push({
          addonItemId: group.items[0].id,
          addonItemName: group.items[0].name,
          priceCents: group.items[0].priceCents,
          groupId: group.id
        });
      }
    });
    setSelectedAddons(initialAddons);
    setRemovedIngredients([]);
  };
  const toggleAddon = (groupId: string, item: any, isRadio: boolean) => {
    setSelectedAddons((prev) => {
      if (isRadio) {
        // Remove existing from this group, add new
        const filtered = prev.filter((a) => a.groupId !== groupId);
        return [
        ...filtered,
        {
          addonItemId: item.id,
          addonItemName: item.name,
          priceCents: item.priceCents,
          groupId
        }];

      } else {
        // Checkbox logic
        const exists = prev.find((a) => a.addonItemId === item.id);
        if (exists) {
          return prev.filter((a) => a.addonItemId !== item.id);
        } else {
          // Check max select
          const group = selectedProduct?.addonGroups?.find(
            (g) => g.id === groupId
          );
          const currentInGroup = prev.filter(
            (a) => a.groupId === groupId
          ).length;
          if (group && currentInGroup >= group.maxSelect) {
            toast.error(`Máximo de ${group.maxSelect} opções permitidas`);
            return prev;
          }
          return [
          ...prev,
          {
            addonItemId: item.id,
            addonItemName: item.name,
            priceCents: item.priceCents,
            groupId
          }];

        }
      }
    });
  };
  const currentProductTotal = useMemo(() => {
    if (!selectedProduct) return 0;
    const addonsTotal = selectedAddons.reduce(
      (sum, addon) => sum + addon.priceCents,
      0
    );
    return (selectedProduct.priceCents + addonsTotal) * quantity;
  }, [selectedProduct, selectedAddons, quantity]);
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalCents, 0);
  }, [cart]);
  const addToCart = () => {
    if (!selectedProduct) return;
    // Validate required addons
    let isValid = true;
    selectedProduct.addonGroups?.forEach((group) => {
      const selectedInGroup = selectedAddons.filter(
        (a) => a.groupId === group.id
      ).length;
      if (selectedInGroup < group.minSelect) {
        toast.error(
          `Selecione pelo menos ${group.minSelect} opção em "${group.name}"`
        );
        isValid = false;
      }
    });
    if (!isValid) return;
    const itemNotes = removedIngredients.length > 0
      ? `Sem: ${removedIngredients.join(', ')}`
      : undefined;
    const newItem: CartItem = {
      product: selectedProduct,
      quantity,
      selectedAddons,
      removedIngredients: [...removedIngredients],
      notes: itemNotes,
      totalCents: currentProductTotal,
      cartItemId: `ci_${Date.now()}`
    };
    setCart((prev) => [...prev, newItem]);
    setSelectedProduct(null);
    toast.success('Adicionado ao pedido');
  };
  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };
  const orderMutation = useMutation({
    mutationFn: publicApi.createOrder,
    onSuccess: (order) => {
      setOrderId(order.id);
      setOrderSuccess(true);
      setCart([]);
      setIsCartOpen(false);
      setCustomerName('');
      setNotes('');
    },
    onError: () => {
      toast.error('Erro ao enviar pedido. Tente novamente.');
    },
  });

  const waiterMutation = useMutation({
    mutationFn: () => publicApi.callWaiter(tableToken!),
    onSuccess: () => {
      toast.success('Garçom chamado! Aguarde um momento.');
    },
    onError: () => {
      toast.error('Erro ao chamar garçom. Tente novamente.');
    },
  });

  const submitOrder = () => {
    if (cart.length === 0 || !tableToken) return;
    orderMutation.mutate({
      tableToken,
      customerName: customerName || undefined,
      notes: notes || undefined,
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        addons: item.selectedAddons.map((a) => ({ addonItemId: a.addonItemId })),
        notes: item.notes,
      })),
    });
  };
  const callWaiter = () => {
    if (!tableToken) return;
    waiterMutation.mutate();
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="sticky top-0 z-30 bg-surface border-b border-border shadow-sm">
          <div className="px-4 py-3">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="px-4 py-2 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-28 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
        <div className="p-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-4 flex gap-4 mb-4">
              <div className="flex-1">
                <div className="h-5 w-36 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !menu) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XIcon className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Mesa nao encontrada
        </h1>
        <p className="text-text-secondary mb-8">
          O link que voce acessou e invalido ou expirou. Peca ajuda a um atendente.
        </p>
      </div>
    );
  }

  if (orderSuccess) {
    // Auto-dismiss after 3s and go back to menu
    setTimeout(() => {
      setOrderSuccess(false);
      refetchActiveOrder();
    }, 3000);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2Icon className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Pedido Enviado!
        </h1>
        <p className="text-text-secondary mb-4">
          Voltando ao cardápio...
        </p>
      </div>);
  }
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface border-b border-border shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg text-text-primary leading-tight">
              HeyChef
            </h1>
            <p className="text-xs text-text-secondary">
              {menu?.table?.name}
            </p>
          </div>
          <button
            onClick={callWaiter}
            className="p-2 bg-gray-100 rounded-full text-text-secondary hover:bg-gray-200 transition-colors"
            title="Chamar Garçom">

            <BellIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Active Order Banner */}
        {activeOrder && (
          <button
            onClick={() => setShowActiveOrder(true)}
            className="w-full px-4 py-2.5 bg-primary/10 border-t border-primary/20 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Pedido em andamento
              </span>
              <span className="text-xs text-text-muted">
                ({activeOrder.items.length} {activeOrder.items.length === 1 ? 'item' : 'itens'})
              </span>
            </div>
            <span className="text-sm font-bold text-primary">
              {formatCurrency(activeOrder.totalCents)}
            </span>
          </button>
        )}

        {/* Category Tabs */}
        <div className="px-4 py-2 overflow-x-auto no-scrollbar flex gap-2">
          {menu.categories.map((category) =>
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`
                whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                ${activeCategory === category.id ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}
              `}>
            
              {category.name}
            </button>
          )}
        </div>
      </header>

      {/* Menu Content */}
      <div className="p-4 pb-32">
        {menu.categories
        .filter((category) => category.id === activeCategory)
        .map((category) =>
        <div
          key={category.id}
          id={`category-${category.id}`}
          className="mb-8 pt-4">

            <h2 className="text-xl font-bold text-text-primary mb-4">
              {category.name}
            </h2>

            <div className="space-y-4">
              {category.products.map((product) =>
            <div
              key={product.id}
              className="bg-white rounded-xl border border-border p-4 flex gap-4 cursor-pointer hover:border-primary transition-colors shadow-sm"
              onClick={() => openProductModal(product)}>
              
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2 leading-snug">
                      {product.description}
                    </p>
                    {product.ingredients && product.ingredients.length > 0 && (
                      <p className="text-xs text-text-muted mt-1">
                        {product.ingredients.join(' \u2022 ')}
                      </p>
                    )}
                    <p className="font-bold text-primary mt-2">
                      {formatCurrency(product.priceCents)}
                    </p>
                  </div>
                  {product.imageUrl &&
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover" />
                
                    </div>
              }
                </div>
            )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && !isCartOpen &&
      <div className="fixed bottom-6 left-0 right-0 px-4 z-40 flex justify-center pointer-events-none">
          <button
          onClick={() => setIsCartOpen(true)}
          className="w-full max-w-[448px] bg-primary text-white rounded-xl p-4 shadow-lg shadow-primary/30 flex items-center justify-between pointer-events-auto hover:bg-primary-hover transition-colors">
          
            <div className="flex items-center gap-3">
              <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <span className="font-medium">Ver Pedido</span>
            </div>
            <span className="font-bold text-lg">
              {formatCurrency(cartTotal)}
            </span>
          </button>
        </div>
      }

      {/* Active Order Detail Panel */}
      <AnimatePresence>
        {showActiveOrder && activeOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowActiveOrder(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-surface px-4 pt-4 pb-2 border-b border-border">
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
                <h2 className="text-lg font-bold text-text-primary">Pedido Atual</h2>
              </div>

              <div className="px-4 py-3 space-y-1">
                {activeOrder.items.map((item) => {
                  const itemStatus = item.status || 'PENDING';
                  const statusConfig = {
                    PENDING: { label: 'Aguardando', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
                    PREPARING: { label: 'Preparando', color: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-400 animate-pulse' },
                    READY: { label: 'Pronto!', color: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
                  }[itemStatus] || { label: itemStatus, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };

                  const canRemove = itemStatus === 'PENDING';

                  return (
                    <div key={item.id} className={`rounded-xl p-3 ${statusConfig.color} transition-colors`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                            <span className="text-xs font-medium">{statusConfig.label}</span>
                          </div>
                          <p className="font-medium text-sm">
                            {item.quantity}x {item.productName}
                          </p>
                          {item.addons.length > 0 && (
                            <div className="mt-0.5">
                              {item.addons.map((a) => (
                                <p key={a.id} className="text-xs opacity-70">+ {a.name}</p>
                              ))}
                            </div>
                          )}
                          {item.notes && (
                            <p className="text-xs text-red-500 mt-0.5">{item.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-sm font-medium whitespace-nowrap">
                            {formatCurrency(item.totalPriceCents)}
                          </span>
                          {canRemove && (
                            <button
                              onClick={() => setItemToRemove(item.id)}
                              className="p-1.5 rounded-lg bg-white/60 hover:bg-red-100 text-red-500 transition-colors"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 py-4 border-t border-border bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-text-secondary font-medium">Total</span>
                  <span className="text-xl font-bold text-text-primary">
                    {formatCurrency(activeOrder.totalCents)}
                  </span>
                </div>
                <button
                  onClick={() => setShowActiveOrder(false)}
                  className="w-full bg-primary text-white font-medium py-3 rounded-xl hover:bg-primary-hover transition-colors"
                >
                  Adicionar mais itens
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Customization Modal */}
      <AnimatePresence>
        {selectedProduct &&
        <>
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setSelectedProduct(null)} />
          
            <motion.div
            initial={{
              y: '100%'
            }}
            animate={{
              y: 0
            }}
            exit={{
              y: '100%'
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            className="fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-2xl max-h-[90vh] flex flex-col max-w-[480px] mx-auto">
            
              <div className="relative">
                {selectedProduct.imageUrl &&
              <div className="w-full h-48 bg-gray-100 rounded-t-2xl overflow-hidden">
                    <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover" />
                
                  </div>
              }
                <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-text-primary shadow-sm">
                
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <h2 className="text-2xl font-bold text-text-primary">
                  {selectedProduct.name}
                </h2>
                <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                  {selectedProduct.description}
                </p>
                {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                  <p className="text-xs text-text-muted mt-1">
                    {selectedProduct.ingredients.join(' \u2022 ')}
                  </p>
                )}
                <p className="text-xl font-bold text-primary mt-3">
                  {formatCurrency(selectedProduct.priceCents)}
                </p>

                {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h3 className="font-semibold text-text-primary mb-3">
                      Ingredientes
                    </h3>
                    <p className="text-xs text-text-muted mb-3">Desmarque o que não deseja</p>
                    <div className="space-y-2">
                      {selectedProduct.ingredients.map((ingredient) => {
                        const isRemoved = removedIngredients.includes(ingredient);
                        return (
                          <label
                            key={ingredient}
                            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                              isRemoved ? 'bg-red-50 line-through text-text-muted' : 'bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={!isRemoved}
                              onChange={() => {
                                if (isRemoved) {
                                  setRemovedIngredients(removedIngredients.filter(i => i !== ingredient));
                                } else {
                                  setRemovedIngredients([...removedIngredients, ingredient]);
                                }
                              }}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">{ingredient}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedProduct.addonGroups?.map((group) =>
              <div
                key={group.id}
                className="mt-6 pt-6 border-t border-border">
                
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <h3 className="font-bold text-text-primary">
                          {group.name}
                        </h3>
                        <p className="text-xs text-text-secondary">
                          {group.minSelect === group.maxSelect &&
                      group.minSelect === 1 ?
                      'Escolha 1 opção' :
                      `Escolha de ${group.minSelect} até ${group.maxSelect} opções`}
                        </p>
                      </div>
                      {group.minSelect > 0 &&
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                          Obrigatório
                        </span>
                  }
                    </div>

                    <div className="space-y-3 mt-4">
                      {group.items?.map((item) => {
                    const isRadio = group.maxSelect === 1;
                    const isSelected = selectedAddons.some(
                      (a) => a.addonItemId === item.id
                    );
                    return (
                      <label
                        key={item.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        
                            <div className="flex items-center gap-3">
                              <div
                            className={`
                                flex items-center justify-center flex-shrink-0
                                ${isRadio ? 'w-5 h-5 rounded-full border' : 'w-5 h-5 rounded border'}
                                ${isSelected ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white'}
                              `}>
                            
                                {isSelected && !isRadio &&
                            <CheckCircle2Icon className="w-3.5 h-3.5" />
                            }
                                {isSelected && isRadio &&
                            <div className="w-2 h-2 bg-white rounded-full" />
                            }
                              </div>
                              <span className="text-sm font-medium text-text-primary">
                                {item.name}
                              </span>
                            </div>
                            {item.priceCents > 0 &&
                        <span className="text-sm text-text-secondary">
                                + {formatCurrency(item.priceCents)}
                              </span>
                        }
                            <input
                          type={isRadio ? 'radio' : 'checkbox'}
                          className="hidden"
                          checked={isSelected}
                          onChange={() =>
                          toggleAddon(group.id, item, isRadio)
                          } />
                        
                          </label>);

                  })}
                    </div>
                  </div>
              )}
              </div>

              <div className="p-4 border-t border-border bg-white pb-safe">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-text-primary hover:bg-white rounded-lg transition-colors">
                    
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    <span className="w-8 text-center font-medium">
                      {quantity}
                    </span>
                    <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-text-primary hover:bg-white rounded-lg transition-colors">
                    
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                  onClick={addToCart}
                  className="flex-1 bg-primary text-white font-medium py-3.5 rounded-xl hover:bg-primary-hover transition-colors flex justify-between px-4">
                  
                    <span>Adicionar</span>
                    <span>{formatCurrency(currentProductTotal)}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>

      {/* Cart Slide-up Panel */}
      <AnimatePresence>
        {isCartOpen &&
        <>
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setIsCartOpen(false)} />
          
            <motion.div
            initial={{
              y: '100%'
            }}
            animate={{
              y: 0
            }}
            exit={{
              y: '100%'
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            className="fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-2xl h-[85vh] flex flex-col max-w-[480px] mx-auto">
            
              <div className="p-4 border-b border-border flex items-center justify-between bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <ShoppingBagIcon className="w-5 h-5" />
                  Seu Pedido
                </h2>
                <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-text-secondary hover:bg-gray-100 rounded-full">
                
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {cart.length === 0 ?
              <div className="h-full flex flex-col items-center justify-center text-text-muted">
                    <ShoppingBagIcon className="w-12 h-12 mb-3 opacity-20" />
                    <p>Seu pedido está vazio</p>
                  </div> :

              <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-border divide-y divide-border">
                      {cart.map((item) =>
                  <div key={item.cartItemId} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <span className="font-medium text-text-secondary">
                                {item.quantity}x
                              </span>
                              <div>
                                <h4 className="font-medium text-text-primary">
                                  {item.product.name}
                                </h4>
                                {item.selectedAddons.length > 0 &&
                          <ul className="mt-1 space-y-0.5">
                                    {item.selectedAddons.map((addon) =>
                            <li
                              key={addon.addonItemId}
                              className="text-xs text-text-secondary">

                                        + {addon.addonItemName}
                                      </li>
                            )}
                                  </ul>
                          }
                                {item.notes && (
                                  <p className="text-xs text-red-500 mt-0.5">{item.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-text-primary">
                                {formatCurrency(item.totalCents)}
                              </p>
                              <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-xs text-danger mt-2 hover:underline">
                          
                                Remover
                              </button>
                            </div>
                          </div>
                        </div>
                  )}
                    </div>

                    <div className="bg-white rounded-xl border border-border p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                          Seu Nome (Opcional)
                        </label>
                        <input
                      type="text"
                      placeholder="Como gostaria de ser chamado?"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                    
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                          Observações (Opcional)
                        </label>
                        <textarea
                      placeholder="Ex: Tirar cebola, maionese à parte..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                    
                      </div>
                    </div>
                  </div>
              }
              </div>

              <div className="p-4 border-t border-border bg-white pb-safe">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-text-secondary font-medium">
                    Total do Pedido
                  </span>
                  <span className="text-2xl font-bold text-text-primary">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                <button
                onClick={submitOrder}
                disabled={cart.length === 0 || orderMutation.isPending}
                className="w-full bg-primary text-white font-medium py-3.5 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

                  {orderMutation.isPending ? 'Enviando...' : 'Enviar Pedido'}
                </button>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        onConfirm={async () => {
          if (!itemToRemove) return;
          try {
            await publicApi.removeItem(tableToken!, itemToRemove);
            refetchActiveOrder();
            toast.success('Item removido');
          } catch {
            toast.error('Erro ao remover item');
          }
          setItemToRemove(null);
        }}
        title="Remover item"
        message="Tem certeza que deseja remover este item do pedido?"
        confirmText="Remover"
        isDanger
      />
    </>);

}