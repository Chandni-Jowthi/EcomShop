export const APP_NAME = 'EcomShop';

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing', 
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const CURRENCY_SYMBOL = '$';

export const FREE_SHIPPING_THRESHOLD = 50;
export const TAX_RATE = 0.08;
export const SHIPPING_COST = 9.99;