/**
 * Format cents to BRL currency string
 * e.g., 2990 → "R$ 29,90"
 */
export function formatCurrency(cents: number): string {
  const value = cents / 100;
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * Format a timestamp (ms or s) to a readable date string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp > 1e12 ? timestamp : timestamp * 1000);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format a timestamp to time string (HH:mm)
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp > 1e12 ? timestamp : timestamp * 1000);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format a timestamp to date + time
 */
export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
}

/**
 * Parse a money input string to cents
 * e.g., "29,90" → 2990
 */
export function parseCurrencyToCents(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Format cents to a decimal input value
 * e.g., 2990 → "29,90"
 */
export function formatCentsToInput(cents: number): string {
  const value = (cents / 100).toFixed(2);
  return value.replace('.', ',');
}

/**
 * Get relative time string
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const date = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  return formatDate(timestamp);
}

/**
 * Generate a short order number from ID
 */
export function shortOrderId(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`;
}

/**
 * Get status label in Portuguese
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    RECEIVED: 'Recebido',
    PREPARING: 'Preparando',
    READY: 'Pronto',
    DELIVERED: 'Entregue',
    CANCELED: 'Cancelado',
    OPEN: 'Aberto',
    RESOLVED: 'Resolvido'
  };
  return labels[status] || status;
}