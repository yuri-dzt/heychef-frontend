Crie uma aplicação frontend completa chamada HeyChef — um sistema SaaS de Cardápio Digital + Pedidos por QR Code para restaurantes, lanchonetes e hamburguerias.

---

## Stack obrigatória

- React 18+ com TypeScript
- Vite
- React Router v6 (rotas protegidas e públicas)
- Tailwind CSS 4
- Axios (HTTP client)
- React Query / TanStack Query (cache e fetching)
- React Hook Form + Zod (formulários e validação)
- Lucide React (ícones)
- Sonner (toasts/notificações)
- date-fns (formatação de datas)

---

## Design System — Premium Minimalista

### Paleta de cores (extraída da logo)

| Token | Cor | Uso |
|-------|-----|-----|
| **primary** | `#E86024` | Botões principais, links, acentos, badges ativos |
| **primary-hover** | `#D4551E` | Hover de botões primários |
| **primary-light** | `#FFF3ED` | Backgrounds sutis, badges leves, hover de linhas |
| **background** | `#FAFAFA` | Fundo geral do app |
| **surface** | `#FFFFFF` | Cards, modais, painéis |
| **border** | `#E5E7EB` | Bordas de cards, inputs, divisórias |
| **text-primary** | `#111827` | Texto principal |
| **text-secondary** | `#6B7280` | Texto auxiliar, labels, placeholders |
| **text-muted** | `#9CA3AF` | Timestamps, metadados |
| **success** | `#16A34A` | Status positivo (DELIVERED, RESOLVED) |
| **warning** | `#F59E0B` | Status intermediário (PREPARING) |
| **danger** | `#DC2626` | Erros, cancelamentos, ações destrutivas |
| **info** | `#2563EB` | Status informativo (RECEIVED) |

### Princípios visuais

- Fundo `#FAFAFA`, cards brancos com `border` sutil e `shadow-sm`
- Bordas arredondadas (`rounded-xl` para cards, `rounded-lg` para inputs e botões)
- Tipografia limpa: Inter ou sans-serif do sistema
- Espaçamento generoso (mínimo `p-6` em cards)
- Ícones Lucide com `stroke-width: 1.5`, tamanho 20px
- Transições suaves em hover (`transition-all duration-200`)
- Sem excesso de cor — o laranja aparece pontualmente como acento
- Sidebar escura (`#1F2937`) com ícones e texto claro
- Loading states com skeleton animado, nunca spinners genéricos
- Empty states com ilustração sutil + CTA
- Botões com hierarquia clara: Primary (laranja), Secondary (outline cinza), Ghost (sem borda), Danger (vermelho)
- Responsivo: sidebar vira bottom nav no mobile

---

## Estrutura do projeto

```
src/
├── api/           → Axios instance, endpoints tipados por entidade
├── assets/        → Logo SVG, imagens estáticas
├── components/    → Componentes reutilizáveis (Button, Input, Modal, Badge, Table, Sidebar, etc.)
├── contexts/      → AuthContext (JWT, user, login/logout)
├── hooks/         → useAuth, useOrders, useTables, etc. (TanStack Query)
├── layouts/       → DashboardLayout (sidebar + header + content), PublicLayout
├── pages/         → Páginas organizadas por feature
├── routes/        → Definição de rotas, PrivateRoute, PublicRoute
├── types/         → Interfaces TypeScript (espelhando DTOs do backend)
├── utils/         → Formatadores (moeda, data), helpers
└── main.tsx       → Entry point
```

---

## Autenticação

O backend retorna JWT no login. Armazene no localStorage e envie como `Authorization: Bearer <token>` em todas as requests autenticadas.

### Fluxo:
- Se não há token → redireciona para `/login`
- Se token expirou (401 do backend) → limpa token, redireciona para `/login`
- Ao fazer login, buscar dados do usuário via `GET /auth/me` e armazenar no contexto
- O contexto deve expor: `user`, `token`, `login()`, `logout()`, `isAuthenticated`

---

## Páginas do Painel Administrativo (autenticadas)

Todas as páginas abaixo ficam dentro do `DashboardLayout` com sidebar à esquerda.

### 1. Login (`/login`)
- Formulário com email, senha e seleção de organização (ou ID da organização)
- Botão "Entrar" com loading state
- Link "Registrar nova organização"
- Layout centralizado, card branco, logo no topo

### 2. Registro (`/register`)
- Formulário: nome, email, senha, nome da organização
- Cria organização + usuário ADMIN
- Após sucesso, redireciona para login
- Mesma estética da tela de login

### 3. Dashboard (`/`)
- Cards de resumo no topo:
  - Pedidos hoje (com ícone ClipboardList)
  - Receita do dia em R$ (com ícone DollarSign)
  - Mesas ativas (com ícone LayoutGrid)
  - Chamados abertos (com ícone Bell)
- Gráfico simples de pedidos dos últimos 7 dias (usar dados de `/reports/daily`)
- Lista dos últimos 5 pedidos com status (badge colorido)

### 4. Pedidos (`/orders`)
- **Visualização principal: Kanban Board**
  - 4 colunas: RECEBIDO → PREPARANDO → PRONTO → ENTREGUE
  - Cada card mostra: nº do pedido, mesa, hora, total, itens resumidos
  - Drag and drop para mudar status (ou botão de avançar)
  - Botão "Cancelar" com modal de confirmação + motivo opcional
- Filtros no topo: por status, por mesa
- Badge com contador em cada coluna
- **Tempo real via SSE**: conectar em `GET /events/orders` e atualizar o board automaticamente quando chegar novo pedido ou mudança de status. Exibir toast "Novo pedido na Mesa 05!" com som de notificação

### 5. Detalhe do Pedido (`/orders/:id`)
- Informações: mesa, cliente, horário, status atual, observações
- Timeline visual do status (stepper horizontal)
- Lista de itens com quantidade, preço unitário, adicionais e subtotal
- Total do pedido
- Botões de ação: Avançar Status / Cancelar

### 6. Cardápio — Categorias (`/menu/categories`)
- Lista de categorias com drag handle para reordenar (order_index)
- Cada categoria mostra: nome, qtd de produtos, badge ativo/inativo
- Ações: editar (modal), excluir (confirmação), ativar/desativar toggle
- Botão "+ Nova Categoria" abre modal com campo nome

### 7. Cardápio — Produtos (`/menu/products`)
- Grid de cards (3 colunas desktop, 1 mobile)
- Cada card: imagem (ou placeholder), nome, preço (R$), categoria, badge ativo/inativo
- Filtro por categoria (dropdown)
- Botão "+ Novo Produto" abre formulário (modal ou página):
  - Nome, descrição, preço (input monetário em centavos), categoria (select), imagem URL, ativo
- Ao clicar no produto, abrir detalhe com seção de **Grupos de Adicionais**:
  - Lista de grupos (ex: "Molhos", "Extras")
  - Cada grupo mostra: nome, min/max seleção, itens
  - Botão para adicionar grupo, adicionar item ao grupo
  - Editar/excluir grupo e itens

### 8. Mesas (`/tables`)
- Grid de cards (4 colunas)
- Cada card: nome da mesa (ex: "Mesa 01"), badge ativo/inativo, QR Code miniatura
- Ao clicar: modal com:
  - QR Code grande (gerado a partir do token usando uma lib como `qrcode.react`)
  - Botão "Baixar QR Code" (download como PNG)
  - Botão "Regenerar Token" (com confirmação)
  - Link do cardápio público copiável
- Botão "+ Nova Mesa"
- Ações: editar nome, ativar/desativar, excluir

### 9. Chamados de Garçom (`/waiter-calls`)
- Lista em tempo real (polling a cada 10s ou SSE)
- Cada chamado: mesa, horário, status (ABERTO/RESOLVIDO)
- Badge pulsante para chamados abertos
- Botão "Resolver" por chamado
- Filtro: Abertos / Resolvidos / Todos
- Som de notificação para novos chamados

### 10. Usuários (`/users`)
- Tabela com: nome, email, role (badge), data de criação
- Ações por linha: editar, excluir (com confirmação)
- Botão "+ Novo Usuário" abre modal:
  - Nome, email, senha, role (select: ADMIN, SUPPORT, USER)
- SUPER_ADMIN e ADMIN não aparecem para edição/exclusão por usuários menores

### 11. Relatórios (`/reports`)
- Filtro de período: data início e data fim (date pickers)
- Tabela com: data, total de pedidos, receita (R$)
- Linha de totais no rodapé
- Gráfico de barras (receita por dia) — pode usar uma lib leve como recharts
- Botão "Exportar CSV"

### 12. Configurações (`/settings`)
- Informações da organização: nome, plano (data de expiração)
- Badge: "Plano ativo" (verde) ou "Plano expirado" (vermelho)
- Se SUPER_ADMIN: botão "Renovar Plano"

---

## Páginas Públicas (sem autenticação)

### 13. Cardápio Público (`/menu/:tableToken`)
- **Layout mobile-first** (o cliente acessa pelo celular)
- Header: logo do restaurante (ou nome da organização), nome da mesa
- Categorias como tabs horizontais scrolláveis ou accordion
- Lista de produtos por categoria:
  - Nome, descrição, preço formatado (R$ 29,90)
  - Imagem à direita (thumbnail) ou placeholder
  - Botão "Adicionar" que abre modal de personalização:
    - Quantidade (- / + stepper)
    - Grupos de adicionais (checkbox/radio respeitando min/max)
    - Preço total calculado em tempo real
    - Botão "Adicionar ao Pedido"
- **Carrinho flutuante** (bottom bar):
  - Badge com quantidade de itens
  - Total do pedido
  - Ao clicar: slide-up com lista de itens, editar quantidade, remover
  - Campo "Seu nome" (opcional) e "Observações" (opcional)
  - Botão "Enviar Pedido" (confirma com modal)
- Após envio: tela de confirmação com número do pedido e mensagem "Seu pedido foi recebido!"
- Botão "Chamar Garçom" (fixo no header ou rodapé)

---

## Sidebar do Dashboard

```
Logo HeyChef (topo)
─────────────────
📋 Pedidos          → /orders
🍽️ Cardápio         → /menu/categories (submenu: Categorias, Produtos)
🪑 Mesas            → /tables
🔔 Chamados         → /waiter-calls
👥 Usuários         → /users
📊 Relatórios       → /reports
⚙️ Configurações    → /settings
─────────────────
Sair (logout)
```

- Sidebar com fundo escuro `#1F2937`, texto `#F9FAFB`
- Item ativo: fundo `#E86024` com texto branco
- Ícones Lucide à esquerda de cada item
- Colapsável em telas menores (hamburguer menu)
- No mobile: bottom navigation com os 4 itens principais (Pedidos, Cardápio, Mesas, Chamados)

---

## Componentes reutilizáveis obrigatórios

Crie uma mini biblioteca de componentes consistente:

- `Button` — variantes: primary, secondary, ghost, danger; tamanhos: sm, md, lg; suporte a loading
- `Input` — com label, erro, ícone opcional; variante para busca
- `Select` — estilizado com Tailwind
- `Modal` — overlay escuro, card centralizado, título, conteúdo, ações no rodapé
- `Badge` — variantes: default, success, warning, danger, info
- `Card` — padding, borda, sombra, hover opcional
- `Table` — header fixo, linhas alternadas, ações por linha, empty state
- `Sidebar` — componente do layout com navegação
- `Header` — breadcrumb, título da página, ações à direita
- `Skeleton` — loading placeholder animado
- `EmptyState` — ícone + mensagem + CTA
- `ConfirmDialog` — modal de confirmação com mensagem e botões Cancelar/Confirmar
- `StatusBadge` — mapeamento automático de status do pedido para cor
- `MoneyInput` — input que formata centavos para R$ (ex: digita 2990 → exibe R$ 29,90)
- `QRCodeCard` — exibe QR code gerado a partir de uma URL

---

## API Layer

Criar instância Axios em `src/api/client.ts`:
- `baseURL` configurável via variável de ambiente `VITE_API_URL`
- Interceptor de request: adiciona `Authorization: Bearer <token>`
- Interceptor de response: se 401, limpa auth e redireciona para `/login`

Criar um arquivo por entidade em `src/api/`:
- `auth.ts` — register, login, getMe
- `organizations.ts` — list, getById, renewPlan
- `users.ts` — list, create, update, delete
- `tables.ts` — list, create, update, delete, regenerateToken
- `categories.ts` — list, create, update, delete
- `products.ts` — list, create, update, delete
- `addon-groups.ts` — create, update, delete
- `addon-items.ts` — create, update, delete
- `orders.ts` — list, getById, updateStatus, cancel
- `waiter-calls.ts` — list, resolve
- `public.ts` — getMenu, createOrder, callWaiter
- `reports.ts` — getDaily

Cada função retorna dados tipados com as interfaces de `src/types/`.

---

## Tipos TypeScript (`src/types/`)

Espelhar os DTOs do backend:

```typescript
interface Organization { id: string; name: string; planExpiresAt: number; createdAt: number; updatedAt?: number; }
interface User { id: string; organizationId: string; name: string; email: string; role: 'SUPER_ADMIN' | 'SUPPORT' | 'ADMIN' | 'USER'; createdAt: number; updatedAt?: number; }
interface Table { id: string; organizationId: string; name: string; qrCodeToken: string; active: boolean; createdAt: number; updatedAt?: number; }
interface Category { id: string; organizationId: string; name: string; orderIndex: number; active: boolean; createdAt: number; updatedAt?: number; }
interface Product { id: string; organizationId: string; categoryId: string; name: string; description?: string; priceCents: number; imageUrl?: string; active: boolean; createdAt: number; updatedAt?: number; }
interface ProductAddonGroup { id: string; organizationId: string; productId: string; name: string; minSelect: number; maxSelect: number; createdAt: number; }
interface ProductAddonItem { id: string; organizationId: string; addonGroupId: string; name: string; priceCents: number; createdAt: number; }
interface Order { id: string; organizationId: string; tableId: string; status: 'RECEIVED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELED'; customerName?: string; notes?: string; totalCents: number; cancelReason?: string; createdAt: number; updatedAt?: number; items?: OrderItem[]; }
interface OrderItem { id: string; orderId: string; productId: string; quantity: number; unitPriceCents: number; totalPriceCents: number; addons?: OrderItemAddon[]; }
interface OrderItemAddon { id: string; orderItemId: string; addonItemId: string; priceCents: number; }
interface CallWaiterEvent { id: string; organizationId: string; tableId: string; status: 'OPEN' | 'RESOLVED'; createdAt: number; resolvedAt?: number; }
interface ReportDaily { id: string; organizationId: string; date: string; totalOrders: number; totalRevenueCents: number; }
```

---

## Variáveis de ambiente

```
VITE_API_URL=http://localhost:3333
```

---

## Entrega

Gerar o projeto completo com:
- Código fonte completo de todas as páginas e componentes
- Rotas configuradas (públicas e protegidas)
- Contexto de autenticação
- API layer com Axios
- Tipos TypeScript
- Tailwind configurado com as cores customizadas
- Assets (logo SVG incluída)
- Pronto para rodar com `npm run dev`

O código deve ser organizado, limpo e seguir os padrões descritos acima.
