
/**
 * Item details
 */
export interface ItemDetails {
  id?: string;
  price: number;
  quantity: number;
  name: string;
  brand?: string;
  category?: string;
  merchant_name?: string;
  url?: string
}

/**
 * Transaction details
 */
export interface TransactionDetails {
  order_id: string;
  gross_amount: number;
}


/**
 * Address details
 */
export interface Address {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country_code?: string;
}

/**
 * Customer details for Snap transaction
 */
export interface CustomerDetails {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  billing_address?: Address[];
  shipping_address?: Address[];
}

/**
 * Supported payment type
 * Documentation: https://docs.midtrans.com/docs/https-notification-webhooks
 */
export type PaymentType = 'gopay' | 'qris' | 'shopeepay' | 'bank_transfer' | 'echannel' | 'cstore' | 'akulaku'

export { }