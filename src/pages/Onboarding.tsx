import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircleIcon, XIcon, ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { MoneyInput } from '../components/MoneyInput';
import { Select } from '../components/Select';
import { categoriesApi } from '../api/categories';
import { productsApi } from '../api/products';
import { tablesApi } from '../api/tables';
import type { Category, Product, Table } from '../types';

const TOTAL_STEPS = 5;

function ProgressBar({ currentStep }: { currentStep: number }) {
  const progress = (currentStep / TOTAL_STEPS) * 100;
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between text-sm text-text-secondary mb-2">
        <span>Passo {currentStep} de {TOTAL_STEPS}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── STEP 1: Welcome ───────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">&#127859;</span>
      </div>
      <h1 className="text-3xl font-bold text-text-primary mb-4">Bem-vindo ao HeyChef!</h1>
      <p className="text-text-secondary text-lg mb-2">
        Vamos configurar seu restaurante em poucos passos.
      </p>
      <p className="text-text-muted mb-8">
        Você vai criar suas categorias de cardápio, adicionar produtos e configurar suas mesas.
      </p>
      <Button size="lg" onClick={onNext}>
        Começar
      </Button>
    </div>
  );
}

// ─── STEP 2: Categories ────────────────────────────────

function StepCategories({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['onboarding-categories'],
    queryFn: categoriesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      setName('');
      queryClient.invalidateQueries({ queryKey: ['onboarding-categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-categories'] });
    },
  });

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createMutation.mutate({ name: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Crie suas categorias</h2>
      <p className="text-text-secondary mb-6">Ex: Hambúrgueres, Bebidas, Sobremesas</p>

      <div className="flex gap-3 mb-6">
        <Input
          placeholder="Nome da categoria"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          onClick={handleAdd}
          isLoading={createMutation.isPending}
          disabled={!name.trim()}
        >
          Adicionar
        </Button>
      </div>

      {categories.length > 0 && (
        <div className="space-y-2 mb-8">
          {categories.map((cat: Category) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-border"
            >
              <span className="font-medium text-text-primary">{cat.name}</span>
              <button
                onClick={() => deleteMutation.mutate(cat.id)}
                className="text-text-muted hover:text-danger transition-colors p-1"
                disabled={deleteMutation.isPending}
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {categories.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4 mb-4">
          Adicione pelo menos uma categoria para continuar.
        </p>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
          Voltar
        </Button>
        <Button
          onClick={onNext}
          disabled={categories.length === 0}
          rightIcon={<ArrowRightIcon className="w-4 h-4" />}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}

// ─── STEP 3: Products ──────────────────────────────────

function StepProducts({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [productName, setProductName] = useState('');
  const [priceCents, setPriceCents] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [addedProducts, setAddedProducts] = useState<Product[]>([]);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['onboarding-categories'],
    queryFn: categoriesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: (product) => {
      setAddedProducts((prev) => [...prev, product]);
      setProductName('');
      setPriceCents(0);
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['onboarding-products'] });
    },
  });

  const handleAdd = () => {
    if (!productName.trim() || !categoryId || priceCents <= 0) return;
    createMutation.mutate({
      name: productName.trim(),
      priceCents,
      categoryId,
      description: description.trim() || undefined,
    });
  };

  // Set default category
  React.useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const categoryOptions = categories.map((c: Category) => ({
    value: c.id,
    label: c.name,
  }));

  const formatPrice = (cents: number) => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Adicione seus produtos</h2>
      <p className="text-text-secondary mb-6">Cadastre pelo menos um produto no seu cardápio.</p>

      <div className="space-y-4 mb-6">
        <Input
          label="Nome do produto"
          placeholder="Ex: X-Burger"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <MoneyInput
            label="Preço"
            value={priceCents}
            onChange={(cents) => setPriceCents(cents)}
          />
          {categoryOptions.length > 0 && (
            <Select
              label="Categoria"
              options={categoryOptions}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
          )}
        </div>
        <Input
          label="Descrição (opcional)"
          placeholder="Breve descrição do produto"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button
          onClick={handleAdd}
          isLoading={createMutation.isPending}
          disabled={!productName.trim() || !categoryId || priceCents <= 0}
        >
          Adicionar produto
        </Button>
      </div>

      {addedProducts.length > 0 && (
        <div className="space-y-2 mb-8">
          {addedProducts.map((prod) => (
            <div
              key={prod.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-border"
            >
              <div>
                <span className="font-medium text-text-primary">{prod.name}</span>
                <span className="text-text-muted text-sm ml-2">
                  {categories.find((c: Category) => c.id === prod.categoryId)?.name}
                </span>
              </div>
              <span className="font-medium text-primary">{formatPrice(prod.priceCents)}</span>
            </div>
          ))}
        </div>
      )}

      {addedProducts.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4 mb-4">
          Adicione pelo menos um produto para continuar.
        </p>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
          Voltar
        </Button>
        <Button
          onClick={onNext}
          disabled={addedProducts.length === 0}
          rightIcon={<ArrowRightIcon className="w-4 h-4" />}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}

// ─── STEP 4: Tables ────────────────────────────────────

function StepTables({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const { data: tables = [] } = useQuery({
    queryKey: ['onboarding-tables'],
    queryFn: tablesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: tablesApi.create,
    onSuccess: () => {
      setName('');
      queryClient.invalidateQueries({ queryKey: ['onboarding-tables'] });
    },
  });

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createMutation.mutate({ name: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Configure suas mesas</h2>
      <p className="text-text-secondary mb-6">
        Adicione as mesas do seu estabelecimento. Cada mesa terá um QR Code próprio.
      </p>

      <div className="flex gap-3 mb-6">
        <Input
          placeholder="Ex: Mesa 01"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          onClick={handleAdd}
          isLoading={createMutation.isPending}
          disabled={!name.trim()}
        >
          Adicionar
        </Button>
      </div>

      {tables.length > 0 && (
        <div className="space-y-2 mb-8">
          {tables.map((table: Table) => (
            <div
              key={table.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-border"
            >
              <span className="font-medium text-text-primary">{table.name}</span>
            </div>
          ))}
        </div>
      )}

      {tables.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4 mb-4">
          Adicione pelo menos uma mesa para continuar.
        </p>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
          Voltar
        </Button>
        <Button
          onClick={onNext}
          disabled={tables.length === 0}
          rightIcon={<ArrowRightIcon className="w-4 h-4" />}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}

// ─── STEP 5: Done ──────────────────────────────────────

function StepDone() {
  const navigate = useNavigate();

  const handleFinish = () => {
    navigate('/', { replace: true });
    // Force a full page reload so the user object refreshes with onboardingComplete = true
    window.location.reload();
  };

  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircleIcon className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-text-primary mb-4">Tudo pronto!</h1>
      <p className="text-text-secondary text-lg mb-2">
        Seu restaurante está configurado.
      </p>
      <p className="text-text-muted mb-8">
        Agora é só compartilhar o QR Code das mesas!
      </p>
      <Button size="lg" onClick={handleFinish}>
        Ir para o painel
      </Button>
    </div>
  );
}

// ─── MAIN ONBOARDING COMPONENT ─────────────────────────

export default function Onboarding() {
  const [step, setStep] = useState(1);

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-6">
        <img src="/logo.svg" alt="HeyChef" className="w-10 h-10" />
        <span className="text-2xl font-bold text-text-primary tracking-tight">HeyChef</span>
      </div>
      <div className="w-full max-w-2xl">
        <Card className="p-8">
          <ProgressBar currentStep={step} />

          {step === 1 && <StepWelcome onNext={goNext} />}
          {step === 2 && <StepCategories onNext={goNext} onBack={goBack} />}
          {step === 3 && <StepProducts onNext={goNext} onBack={goBack} />}
          {step === 4 && <StepTables onNext={goNext} onBack={goBack} />}
          {step === 5 && <StepDone />}
        </Card>
      </div>
    </div>
  );
}
