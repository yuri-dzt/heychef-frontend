// Organization
export interface Organization {
  id: string;
  name: string;
  planExpiresAt: number;
  createdAt: number;
  updatedAt?: number;
}

// User
export type UserRole = 'SUPPORT' | 'ADMIN' | 'USER';
export type UserType = 'admin' | 'user';

export interface User {
  id: string;
  organizationId?: string;
  name: string;
  email: string;
  role?: UserRole;
  type: UserType;
  createdAt?: number;
  updatedAt?: number;
  permissions?: Record<string, string[]>;
  onboardingComplete?: boolean;
}

// Table
export interface Table {
  id: string;
  organizationId: string;
  name: string;
  qrCodeToken: string;
  active: boolean;
  createdAt: number;
  updatedAt?: number;
}

// Category
export interface Category {
  id: string;
  organizationId: string;
  name: string;
  orderIndex: number;
  active: boolean;
  createdAt: number;
  updatedAt?: number;
}

// Product
export interface Product {
  id: string;
  organizationId: string;
  categoryId: string;
  name: string;
  description?: string;
  priceCents: number;
  imageUrl?: string;
  ingredients?: string[];
  active: boolean;
  createdAt: number;
  updatedAt?: number;
  addonGroups?: ProductAddonGroup[];
}

// Product Addon Group
export interface ProductAddonGroup {
  id: string;
  organizationId: string;
  productId: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  createdAt: number;
  items?: ProductAddonItem[];
}

// Product Addon Item
export interface ProductAddonItem {
  id: string;
  organizationId: string;
  addonGroupId: string;
  name: string;
  priceCents: number;
  createdAt: number;
}

// Order
export type OrderStatus =
'RECEIVED' |
'PREPARING' |
'READY' |
'DELIVERED' |
'CANCELED';

export interface Order {
  id: string;
  organizationId: string;
  tableId: string;
  status: OrderStatus;
  customerName?: string;
  notes?: string;
  totalCents: number;
  cancelReason?: string;
  createdAt: number;
  updatedAt?: number;
  items?: OrderItem[];
  table?: Table;
}

// Order Item
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
  addons?: OrderItemAddon[];
}

// Order Item Addon
export interface OrderItemAddon {
  id: string;
  orderItemId: string;
  addonItemId: string;
  addonItemName?: string;
  priceCents: number;
}

// Waiter Call
export type WaiterCallStatus = 'OPEN' | 'RESOLVED';

export interface CallWaiterEvent {
  id: string;
  organizationId: string;
  tableId: string;
  tableName?: string;
  status: WaiterCallStatus;
  createdAt: number;
  resolvedAt?: number;
}

// Reports
export interface ReportDaily {
  id: string;
  organizationId: string;
  date: string;
  totalOrders: number;
  totalRevenueCents: number;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
  organizationId?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// Public Menu
export interface PublicMenu {
  organization: {name: string;};
  table: {id: string;name: string;};
  categories: PublicCategory[];
}

export interface PublicCategory {
  id: string;
  name: string;
  products: PublicProduct[];
}

export interface PublicProduct {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  imageUrl?: string;
  ingredients?: string[];
  addonGroups?: ProductAddonGroup[];
}

// Cart
export interface CartItem {
  product: PublicProduct;
  quantity: number;
  selectedAddons: SelectedAddon[];
  totalCents: number;
  cartItemId: string;
}

export interface SelectedAddon {
  addonItemId: string;
  addonItemName: string;
  priceCents: number;
  groupId: string;
}

// Create Order (public)
export interface CreateOrderRequest {
  tableToken: string;
  customerName?: string;
  notes?: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
  addons?: {addonItemId: string;}[];
}

// API Pagination / Responses
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Dashboard Stats
export interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  activeTables: number;
  openCalls: number;
}