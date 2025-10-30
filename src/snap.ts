import { ApiConfig, type ApiConfigOptions } from './config';
import { HttpClient } from './http-client';
import { Transaction } from './transaction';
import type { TransactionDetails, ItemDetails, CustomerDetails } from './types';

/**
 * Snap transaction parameter
 */
export interface SnapTransactionParameter {
  transaction_details: TransactionDetails;
  item_details?: ItemDetails[];
  customer_details?: CustomerDetails;
  enabled_payments?: string[];
  credit_card?: {
    secure?: boolean;
    bank?: string;
    installment?: {
      required?: boolean;
      terms?: {
        [bank: string]: number[];
      };
    };
    whitelist_bins?: string[];
  };
  bca_va?: {
    va_number?: string;
  };
  bni_va?: {
    va_number?: string;
  };
  bri_va?: {
    va_number?: string;
  };
  permata_va?: {
    va_number?: string;
    recipient_name?: string;
  };
  callbacks?: {
    finish?: string;
    error?: string;
    pending?: string;
  };
  expiry?: {
    start_time?: string;
    unit?: 'day' | 'hour' | 'minute';
    duration?: number;
  };
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string;
  [key: string]: any;
}

/**
 * Snap transaction response
 */
export interface SnapTransactionResponse {
  token: string;
  redirect_url: string;
}

/**
 * Snap API client for creating payment transactions
 * Documentation: https://snap-docs.midtrans.com
 */
export class Snap {
  public readonly apiConfig: ApiConfig;
  public readonly httpClient: HttpClient;
  public readonly transaction: Transaction;

  constructor(options: ApiConfigOptions = {}) {
    this.apiConfig = new ApiConfig(options);
    this.httpClient = new HttpClient(this);
    this.transaction = new Transaction(this);
  }

  /**
   * Create a new Snap transaction
   * Makes POST request to `/transactions` API endpoint
   * 
   * @param parameter - Transaction parameters (order details, customer info, etc.)
   * @returns Promise containing token and redirect_url
   * 
   * @example
   * ```typescript
   * const snap = new Snap({
   *   isProduction: false,
   *   serverKey: 'your-server-key',
   * });
   * 
   * const response = await snap.createTransaction({
   *   transaction_details: {
   *     order_id: 'order-123',
   *     gross_amount: 100000,
   *   },
   *   customer_details: {
   *     first_name: 'John',
   *     email: 'john@example.com',
   *   },
   * });
   * 
   * console.log(response.token);
   * console.log(response.redirect_url);
   * ```
   */
  async createTransaction(
    parameter: SnapTransactionParameter
  ): Promise<SnapTransactionResponse> {
    const apiUrl = `${this.apiConfig.getSnapApiBaseUrl()}/transactions`;
    return this.httpClient.request<SnapTransactionResponse>(
      'post',
      this.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }

  /**
   * Create transaction and return only the token
   * Convenience wrapper around createTransaction
   * 
   * @param parameter - Transaction parameters
   * @returns Promise containing only the transaction token
   * 
   * @example
   * ```typescript
   * const token = await snap.createTransactionToken({
   *   transaction_details: {
   *     order_id: 'order-123',
   *     gross_amount: 100000,
   *   },
   * });
   * 
   * // Use token in frontend:
   * // window.snap.pay(token);
   * ```
   */
  async createTransactionToken(
    parameter: SnapTransactionParameter
  ): Promise<string> {
    const response = await this.createTransaction(parameter);
    return response.token;
  }

  /**
   * Create transaction and return only the redirect URL
   * Convenience wrapper around createTransaction
   * 
   * @param parameter - Transaction parameters
   * @returns Promise containing only the redirect URL
   * 
   * @example
   * ```typescript
   * const redirectUrl = await snap.createTransactionRedirectUrl({
   *   transaction_details: {
   *     order_id: 'order-123',
   *     gross_amount: 100000,
   *   },
   * });
   * 
   * // Redirect user to payment page
   * res.redirect(redirectUrl);
   * ```
   */
  async createTransactionRedirectUrl(
    parameter: SnapTransactionParameter
  ): Promise<string> {
    const response = await this.createTransaction(parameter);
    return response.redirect_url;
  }
}