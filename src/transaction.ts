import { ApiConfig } from './config';
import { HttpClient } from './http-client';
import { MidtransError } from './error';
import type { PaymentType } from './types';

/**
 * Notification object received from Midtrans webhook
 */
export interface NotificationObject {
  transaction_id: string;
  order_id: string;
  payment_type?: PaymentType;
  transaction_status?: string;
  transaction_time?: string;
  fraud_status?: string;
  gross_amount?: string;
  [key: string]: any;
}

/**
 * Refund parameters
 */
export interface RefundParameters {
  refund_key?: string;
  amount?: number;
  reason?: string;
}

/**
 * Transaction status response
 */
export interface TransactionStatusResponse {
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
 * Parent object containing API configuration and HTTP client
 */
export interface TransactionParent {
  apiConfig: ApiConfig;
  httpClient: HttpClient;
}

/**
 * Notification error class
 */
export class MidtransNotificationError extends MidtransError {
  constructor(message: string) {
    super(message);
    this.name = 'MidtransNotificationError';
  }
}

/**
 * Implementation of Midtrans Transaction API methods
 * API documentation: https://api-docs.midtrans.com/#midtrans-api
 */
export class Transaction {
  constructor(private parent: TransactionParent) { }

  /**
   * Get transaction status
   * @param transactionId - Transaction ID or Order ID
   * @returns Promise containing transaction status
   */
  async status(transactionId: string): Promise<TransactionStatusResponse> {
    const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/status`;
    return this.parent.httpClient.request<TransactionStatusResponse>(
      'get',
      this.parent.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Get B2B transaction status
   * @param transactionId - Transaction ID or Order ID
   * @returns Promise containing B2B transaction status
   */
  async statusb2b(transactionId: string): Promise<TransactionStatusResponse> {
    const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/status/b2b`;
    return this.parent.httpClient.request<TransactionStatusResponse>(
      'get',
      this.parent.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Approve a challenge transaction
   * @param transactionId - Transaction ID or Order ID
   * @returns Promise containing approval response
   */
  async approve(transactionId: string): Promise<TransactionStatusResponse> {
    const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/approve`;
    return this.parent.httpClient.request<TransactionStatusResponse>(
      'post',
      this.parent.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Deny a transaction
   * @param transactionId - Transaction ID or Order ID
   * @returns Promise containing denial response
   */
  async deny(transactionId: string): Promise<TransactionStatusResponse> {
    const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/deny`;
    return this.parent.httpClient.request<TransactionStatusResponse>(
      'post',
      this.parent.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Cancel a transaction
   * @param transactionId - Transaction ID or Order ID
   * @returns Promise containing cancellation response
   */
  async cancel(transactionId: string): Promise<TransactionStatusResponse> {
    const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/cancel`;
    return this.parent.httpClient.request<TransactionStatusResponse>(
      'post',
      this.parent.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Expire a pending transaction
   * @param transactionId - Transaction ID or Order ID
   * @returns Promise containing expiration response
   */
  async expire(transactionId: string): Promise<TransactionStatusResponse> {
    const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/expire`;
    return this.parent.httpClient.request<TransactionStatusResponse>(
      'post',
      this.parent.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Refund a transaction
   * @param transactionId - Transaction ID or Order ID
   * @param parameter - Refund parameters (amount, reason, etc.)
   * @returns Promise containing refund response
   */
  async refund(
    transactionId: string,
    parameter: RefundParameters = {}
  ): Promise<TransactionStatusResponse> {
    const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/refund`;
    return this.parent.httpClient.request<TransactionStatusResponse>(
      'post',
      this.parent.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }

  /**
   * Direct refund a transaction
   * @param transactionId - Transaction ID or Order ID
   * @param parameter - Refund parameters (amount, reason, etc.)
   * @returns Promise containing direct refund response
   */
  async refundDirect(
    transactionId: string,
    parameter: RefundParameters = {}
  ): Promise<TransactionStatusResponse> {
    const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/refund/online/direct`;
    return this.parent.httpClient.request<TransactionStatusResponse>(
      'post',
      this.parent.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }

  /**
   * Handle notification from Midtrans webhook
   * Validates the notification and fetches the latest transaction status
   * 
   * @param notificationObj - Notification object or JSON string from webhook
   * @returns Promise containing verified transaction status
   * @throws {MidtransNotificationError} If notification parsing fails
   */
  async notification(
    notificationObj: NotificationObject | string
  ): Promise<TransactionStatusResponse> {
    // Parse notification if it's a string
    let parsedNotification: NotificationObject;

    if (typeof notificationObj === 'string') {
      try {
        parsedNotification = JSON.parse(notificationObj);
      } catch (err) {
        throw new MidtransNotificationError(
          `Failed to parse 'notification' string as JSON. Use JSON string or Object as 'notification'. Error: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    } else {
      parsedNotification = notificationObj;
    }

    // Validate transaction_id exists
    if (!parsedNotification.transaction_id) {
      throw new MidtransNotificationError(
        'Notification object must contain transaction_id'
      );
    }

    // Fetch and return the latest transaction status
    return this.status(parsedNotification.transaction_id);
  }
}