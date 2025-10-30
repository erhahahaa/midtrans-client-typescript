import { ApiConfig, type ApiConfigOptions } from './config';
import { HttpClient } from './http-client';
import { Transaction } from './transaction';
import type { CustomerDetails, ItemDetails, PaymentType, TransactionDetails } from './types';


/**
 * Credit card details
 */
export interface CreditCard {
  token_id: string;
  bank?: 'mandiri' | 'bni' | 'cimb' | 'bca' | 'maybank' | 'bri';
  installment_term?: number;
  bins?: string[];
  type?: string;
  save_token_id?: boolean;
}

export interface Gopay {
  enable_callback?: boolean;
  callback_url?: string;
  pre_auth?: boolean;
  recurring?: boolean;

}

export interface QRIS {
  acquirer: 'airpay shopee' | 'gopay';
}

export interface BankTransfer {
  bank: 'permata' | 'bni' | 'bri' | 'bca'
  va_number?: string
}

/**
 * Charge parameter
 * Documentation: https://docs.midtrans.com/reference/charge-transactions-1
 */
export interface ChargeParameter {
  payment_type: PaymentType;
  transaction_details: TransactionDetails;
  item_details?: ItemDetails[];
  customer_details?: CustomerDetails;
  credit_card?: CreditCard;
  bank_transfer?: BankTransfer;
  gopay?: Gopay;
  custom_expiry: {
    order_time?: string; // RFC 3339 of ISO 8601 format
    expiry_duration: number;
    unit: 'second' | 'minute' | 'hour' | 'day'
  };
  qris?: QRIS;
  metadata: Record<string, any>;
  [key: string]: any;
}

/**
 * Capture parameter
 */
export interface CaptureParameter {
  transaction_id: string;
  gross_amount: number;
}

/**
 * Card register parameter
 */
export interface CardRegisterParameter {
  card_number: string;
  card_exp_month: string;
  card_exp_year: string;
  card_cvv?: string;
  client_key?: string;
}

/**
 * Card token parameter
 */
export interface CardTokenParameter {
  card_number: string;
  card_exp_month: string;
  card_exp_year: string;
  card_cvv: string;
  client_key?: string;
  gross_amount?: number;
  secure?: boolean;
}

/**
 * Payment account parameter
 */
export interface PaymentAccountParameter {
  payment_type: PaymentType;
  gopay_partner?: {
    phone_number: string;
    country_code: string;
    redirect_url: string;
  };
  shopeepay_partner?: {
    redirect_url: string;
  };
}

/**
 * Subscription parameter
 */
export interface SubscriptionParameter {
  name: string;
  amount: string | number;
  currency: string;
  payment_type: PaymentType;
  token: string;
  schedule: {
    interval: number;
    interval_unit: 'day' | 'week' | 'month';
    max_interval?: number;
    start_time?: string;
  };
  metadata?: Record<string, any>;
  customer_details?: CustomerDetails;
  gopay?: {
    account_id?: string;
  };
}

/**
 * Charge response
 */
export interface ChargeResponse {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: PaymentType;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
  [key: string]: any;
}

/**
 * Card token response
 */
export interface CardTokenResponse {
  status_code: string;
  token_id: string;
  hash: string;
}

/**
 * Subscription response
 */
export interface SubscriptionResponse {
  id: string;
  name: string;
  amount: string;
  currency: string;
  created_at: string;
  schedule: {
    interval: number;
    interval_unit: string;
    max_interval: number;
    start_time: string;
  };
  status: string;
  token: string;
  payment_type: PaymentType;
}

/**
 * Core API client for direct payment transactions
 * Documentation: https://api-docs.midtrans.com
 */
export class CoreApi {
  public readonly apiConfig: ApiConfig;
  public readonly httpClient: HttpClient;
  public readonly transaction: Transaction;

  /**
   * Initialize Core API client
   * @param options - Configuration options (isProduction, serverKey, clientKey)
   */
  constructor(options: ApiConfigOptions = {}) {
    this.apiConfig = new ApiConfig(options);
    this.httpClient = new HttpClient(this);
    this.transaction = new Transaction(this);
  }

  /**
   * Charge a payment transaction
   * @param parameter - Charge parameters including payment type and transaction details
   * @returns Promise containing charge response
   * 
   * @example
   * ```typescript
   * const core = new CoreApi({ serverKey: 'your-key' });
   * const response = await core.charge({
   *   payment_type: 'credit_card',
   *   transaction_details: {
   *     order_id: 'order-123',
   *     gross_amount: 100000,
   *   },
   *   credit_card: {
   *     token_id: 'card-token-123',
   *   },
   * });
   * ```
   */
  async charge(parameter: ChargeParameter): Promise<ChargeResponse> {
    const apiUrl = `${this.apiConfig.getCoreApiBaseUrl()}/v2/charge`;
    return this.httpClient.request<ChargeResponse>(
      'post',
      this.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }

  /**
   * Capture a pre-authorized transaction
   * @param parameter - Capture parameters (transaction_id, gross_amount)
   * @returns Promise containing capture response
   * 
   * @example
   * ```typescript
   * const response = await core.capture({
   *   transaction_id: 'trans-123',
   *   gross_amount: 100000,
   * });
   * ```
   */
  async capture(parameter: CaptureParameter): Promise<ChargeResponse> {
    const apiUrl = `${this.apiConfig.getCoreApiBaseUrl()}/v2/capture`;
    return this.httpClient.request<ChargeResponse>(
      'post',
      this.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }

  /**
   * Register a card for future use
   * @param parameter - Card details (number, expiry, CVV)
   * @returns Promise containing saved token
   * 
   * @example
   * ```typescript
   * const response = await core.cardRegister({
   *   card_number: '4811111111111114',
   *   card_exp_month: '12',
   *   card_exp_year: '2025',
   *   card_cvv: '123',
   *   client_key: 'your-client-key',
   * });
   * ```
   */
  async cardRegister(parameter: CardRegisterParameter): Promise<CardTokenResponse> {
    const apiUrl = `${this.apiConfig.getCoreApiBaseUrl()}/v2/card/register`;
    return this.httpClient.request<CardTokenResponse>(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }

  /**
   * Get card token for one-time use
   * @param parameter - Card details (number, expiry, CVV)
   * @returns Promise containing card token
   * 
   * @example
   * ```typescript
   * const response = await core.cardToken({
   *   card_number: '4811111111111114',
   *   card_exp_month: '12',
   *   card_exp_year: '2025',
   *   card_cvv: '123',
   * });
   * console.log(response.token_id);
   * ```
   */
  async cardToken(parameter: CardTokenParameter): Promise<CardTokenResponse> {
    const apiUrl = `${this.apiConfig.getCoreApiBaseUrl()}/v2/token`;
    return this.httpClient.request<CardTokenResponse>(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }

  /**
   * Check loyalty point balance for a card token
   * @param tokenId - Card token ID
   * @returns Promise containing point balance information
   * 
   * @example
   * ```typescript
   * const points = await core.cardPointInquiry('token-123');
   * console.log('Points:', points.point_balance_amount);
   * ```
   */
  async cardPointInquiry(tokenId: string): Promise<any> {
    const apiUrl = `${this.apiConfig.getCoreApiBaseUrl()}/v2/point_inquiry/${tokenId}`;
    return this.httpClient.request(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Link a payment account (GoPay, ShopeePay, etc.)
   * @param parameter - Payment account linking parameters
   * @returns Promise containing account linking response
   * 
   * @example
   * ```typescript
   * const response = await core.linkPaymentAccount({
   *   payment_type: 'gopay',
   *   gopay_partner: {
   *     phone_number: '81234567890',
   *     country_code: '62',
   *     redirect_url: 'https://example.com/callback',
   *   },
   * });
   * ```
   */
  async linkPaymentAccount(parameter: PaymentAccountParameter): Promise<any> {
    const apiUrl = `${this.apiConfig.getCoreApiBaseUrl()}/v2/pay/account`;
    return this.httpClient.request(
      'post',
      this.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }

  /**
   * Get payment account details
   * @param accountId - Payment account ID
   * @returns Promise containing account details
   * 
   * @example
   * ```typescript
   * const account = await core.getPaymentAccount('acc-123');
   * console.log(account.status);
   * ```
   */
  async getPaymentAccount(accountId: string): Promise<any> {
    const apiUrl = `${this.apiConfig.getCoreApiBaseUrl()}/v2/pay/account/${accountId}`;
    return this.httpClient.request(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Unlink a payment account
   * @param accountId - Payment account ID to unlink
   * @returns Promise containing unlink response
   * 
   * @example
   * ```typescript
   * const response = await core.unlinkPaymentAccount('acc-123');
   * console.log('Account unlinked');
   * ```
   */
  async unlinkPaymentAccount(accountId: string): Promise<any> {
    const apiUrl = `${this.apiConfig.getCoreApiBaseUrl()}/v2/pay/account/${accountId}/unbind`;
    return this.httpClient.request(
      'post',
      this.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Create a subscription
   * @param parameter - Subscription parameters (name, amount, schedule, etc.)
   * @returns Promise containing subscription response
   * 
   * @example
   * ```typescript
   * const subscription = await core.createSubscription({
   *   name: 'Monthly Subscription',
   *   amount: '100000',
   *   currency: 'IDR',
   *   payment_type: 'credit_card',
   *   token: 'card-token-123',
   *   schedule: {
   *     interval: 1,
   *     interval_unit: 'month',
   *     start_time: '2024-02-01 07:00:00 +0700',
   *   },
   * });
   * ```
   */
  async createSubscription(
    parameter: SubscriptionParameter
  ): Promise<SubscriptionResponse> {
    const apiUrl = `${this.apiConfig.getCoreApiBaseUrl()}/v1/subscriptions`;
    return this.httpClient.request<SubscriptionResponse>(
      'post',
      this.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }

  /**
   * Get subscription details
   * @param subscriptionId - Subscription ID
   * @returns Promise containing subscription details
   * 
   * @example
   * ```typescript
   * const subscription = await core.getSubscription('sub-123');
   * console.log(subscription.status);
   * ```
   */
  async getSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    const apiUrl = `${this.apiConfig.getCoreApiBaseUrl()}/v1/subscriptions/${subscriptionId}`;
    return this.httpClient.request<SubscriptionResponse>(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Disable a subscription
   * @param subscriptionId - Subscription ID to disable
   * @returns Promise containing disable response
   * 
   * @example
   * ```typescript
   * const response = await core.disableSubscription('sub-123');
   * console.log('Subscription disabled');
   * ```
   */
  async disableSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    const apiUrl = `${this.apiConfig.getCoreApiBaseUrl()}/v1/subscriptions/${subscriptionId}/disable`;
    return this.httpClient.request<SubscriptionResponse>(
      'post',
      this.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Enable a subscription
   * @param subscriptionId - Subscription ID to enable
   * @returns Promise containing enable response
   * 
   * @example
   * ```typescript
   * const response = await core.enableSubscription('sub-123');
   * console.log('Subscription enabled');
   * ```
   */
  async enableSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    const apiUrl = `${this.apiConfig.getCoreApiBaseUrl()}/v1/subscriptions/${subscriptionId}/enable`;
    return this.httpClient.request<SubscriptionResponse>(
      'post',
      this.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Update a subscription
   * @param subscriptionId - Subscription ID to update
   * @param parameter - Updated subscription parameters
   * @returns Promise containing update response
   * 
   * @example
   * ```typescript
   * const response = await core.updateSubscription('sub-123', {
   *   name: 'Updated Subscription Name',
   *   amount: '150000',
   * });
   * ```
   */
  async updateSubscription(
    subscriptionId: string,
    parameter: Partial<SubscriptionParameter>
  ): Promise<SubscriptionResponse> {
    const apiUrl = `${this.apiConfig.getCoreApiBaseUrl()}/v1/subscriptions/${subscriptionId}`;
    return this.httpClient.request<SubscriptionResponse>(
      'patch',
      this.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }
}