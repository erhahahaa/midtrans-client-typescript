import { ApiConfig, type ApiConfigOptions } from './config';
import { HttpClient } from './http-client';
import { Transaction } from './transaction';

/**
 * Beneficiary details
 */
export interface BeneficiaryParameter {
  name: string;
  account: string;
  bank: string;
  alias_name: string;
  email?: string;
}

/**
 * Payout parameter
 */
export interface PayoutParameter {
  payouts: PayoutItem[];
}

/**
 * Individual payout item
 */
export interface PayoutItem {
  beneficiary_name: string;
  beneficiary_account: string;
  beneficiary_bank: string;
  beneficiary_email?: string;
  amount: string | number;
  notes?: string;
  reference_no?: string;
}

/**
 * Payout approval/rejection parameter
 */
export interface PayoutApprovalParameter {
  reference_nos: string[];
  otp: string;
}

/**
 * Transaction history parameter
 */
export interface TransactionHistoryParameter {
  from_date?: string;
  to_date?: string;
}

/**
 * Bank account validation parameter
 */
export interface BankAccountValidationParameter {
  bank: string;
  account: string;
}

/**
 * Beneficiary response
 */
export interface BeneficiaryResponse {
  status: string;
  [key: string]: any;
}

/**
 * Payout response
 */
export interface PayoutResponse {
  payouts: PayoutItemResponse[];
}

/**
 * Individual payout item response
 */
export interface PayoutItemResponse {
  status: string;
  reference_no: string;
  [key: string]: any;
}

/**
 * Balance response
 */
export interface BalanceResponse {
  balance: string;
}

/**
 * Bank list response
 */
export interface BankResponse {
  beneficiary_banks: BankItem[];
}

/**
 * Individual bank item
 */
export interface BankItem {
  code: string;
  name: string;
}

/**
 * Iris API client for disbursement/payout operations
 * Documentation: https://iris-docs.midtrans.com
 */
export class Iris {
  public readonly apiConfig: ApiConfig;
  public readonly httpClient: HttpClient;
  public readonly transaction: Transaction;

  /**
   * Initialize Iris client
   * @param options - Configuration options (isProduction, serverKey)
   */
  constructor(options: ApiConfigOptions = {}) {
    this.apiConfig = new ApiConfig(options);
    this.httpClient = new HttpClient(this);
    this.transaction = new Transaction(this);
  }

  /**
   * Ping Iris API to check connectivity
   * @returns Promise containing ping response
   * 
   * @example
   * ```typescript
   * const iris = new Iris({ serverKey: 'your-key' });
   * const response = await iris.ping();
   * console.log(response); // "pong"
   * ```
   */
  async ping(): Promise<string> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/ping`;
    return this.httpClient.request<string>(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Create a new beneficiary
   * @param parameter - Beneficiary details (name, account, bank, etc.)
   * @returns Promise containing creation response
   * 
   * @example
   * ```typescript
   * const response = await iris.createBeneficiaries({
   *   name: 'John Doe',
   *   account: '1234567890',
   *   bank: 'bca',
   *   alias_name: 'john_bca',
   *   email: 'john@example.com',
   * });
   * ```
   */
  async createBeneficiaries(
    parameter: BeneficiaryParameter
  ): Promise<BeneficiaryResponse> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/beneficiaries`;
    return this.httpClient.request<BeneficiaryResponse>(
      'post',
      this.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }

  /**
   * Update an existing beneficiary
   * @param aliasName - Alias name of the beneficiary to update
   * @param parameter - Updated beneficiary details
   * @returns Promise containing update response
   * 
   * @example
   * ```typescript
   * const response = await iris.updateBeneficiaries('john_bca', {
   *   name: 'John Doe Updated',
   *   email: 'newemail@example.com',
   * });
   * ```
   */
  async updateBeneficiaries(
    aliasName: string,
    parameter: Partial<BeneficiaryParameter>
  ): Promise<BeneficiaryResponse> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/beneficiaries/${aliasName}`;
    return this.httpClient.request<BeneficiaryResponse>(
      'patch',
      this.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }

  /**
   * Get list of all beneficiaries
   * @returns Promise containing array of beneficiaries
   * 
   * @example
   * ```typescript
   * const beneficiaries = await iris.getBeneficiaries();
   * console.log(beneficiaries);
   * ```
   */
  async getBeneficiaries(): Promise<BeneficiaryResponse[]> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/beneficiaries`;
    return this.httpClient.request<BeneficiaryResponse[]>(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Create payout(s)
   * @param parameter - Payout details including beneficiary and amount
   * @returns Promise containing payout creation response
   * 
   * @example
   * ```typescript
   * const response = await iris.createPayouts({
   *   payouts: [
   *     {
   *       beneficiary_name: 'John Doe',
   *       beneficiary_account: '1234567890',
   *       beneficiary_bank: 'bca',
   *       amount: '100000',
   *       notes: 'Payment for services',
   *     },
   *   ],
   * });
   * ```
   */
  async createPayouts(parameter: PayoutParameter): Promise<PayoutResponse> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/payouts`;
    return this.httpClient.request<PayoutResponse>(
      'post',
      this.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }

  /**
   * Approve payout(s)
   * @param parameter - Reference numbers and OTP for approval
   * @returns Promise containing approval response
   * 
   * @example
   * ```typescript
   * const response = await iris.approvePayouts({
   *   reference_nos: ['ref123', 'ref456'],
   *   otp: '123456',
   * });
   * ```
   */
  async approvePayouts(
    parameter: PayoutApprovalParameter
  ): Promise<PayoutResponse> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/payouts/approve`;
    return this.httpClient.request<PayoutResponse>(
      'post',
      this.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }

  /**
   * Reject payout(s)
   * @param parameter - Reference numbers and OTP for rejection
   * @returns Promise containing rejection response
   * 
   * @example
   * ```typescript
   * const response = await iris.rejectPayouts({
   *   reference_nos: ['ref123'],
   *   otp: '123456',
   * });
   * ```
   */
  async rejectPayouts(
    parameter: PayoutApprovalParameter
  ): Promise<PayoutResponse> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/payouts/reject`;
    return this.httpClient.request<PayoutResponse>(
      'post',
      this.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }

  /**
   * Get payout details by reference number
   * @param referenceNo - Reference number of the payout
   * @returns Promise containing payout details
   * 
   * @example
   * ```typescript
   * const details = await iris.getPayoutDetails('ref123');
   * console.log(details.status);
   * ```
   */
  async getPayoutDetails(referenceNo: string): Promise<PayoutItemResponse> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/payouts/${referenceNo}`;
    return this.httpClient.request<PayoutItemResponse>(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Get transaction history
   * Note: This API uses non-standard GET with JSON body
   * @param parameter - Date range filters (from_date, to_date)
   * @returns Promise containing transaction history
   * 
   * @example
   * ```typescript
   * const history = await iris.getTransactionHistory({
   *   from_date: '2024-01-01',
   *   to_date: '2024-01-31',
   * });
   * ```
   */
  async getTransactionHistory(
    parameter: TransactionHistoryParameter = {}
  ): Promise<any> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/statements`;
    // Non-standard: GET method with JSON body instead of URL query params
    return this.httpClient.request(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl,
      {}, // Empty first param (would be query params)
      parameter // JSON body as second param
    );
  }

  /**
   * Get available top-up channels
   * @returns Promise containing list of top-up channels
   * 
   * @example
   * ```typescript
   * const channels = await iris.getTopupChannels();
   * console.log(channels);
   * ```
   */
  async getTopupChannels(): Promise<any> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/channels`;
    return this.httpClient.request(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Get current balance
   * @returns Promise containing balance information
   * 
   * @example
   * ```typescript
   * const balance = await iris.getBalance();
   * console.log('Balance:', balance.balance);
   * ```
   */
  async getBalance(): Promise<BalanceResponse> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/balance`;
    return this.httpClient.request<BalanceResponse>(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Get facilitator bank accounts
   * @returns Promise containing list of bank accounts
   * 
   * @example
   * ```typescript
   * const accounts = await iris.getFacilitatorBankAccounts();
   * console.log(accounts);
   * ```
   */
  async getFacilitatorBankAccounts(): Promise<any> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/bank_accounts`;
    return this.httpClient.request(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Get balance of a specific facilitator bank account
   * @param bankAccountId - ID of the bank account
   * @returns Promise containing balance information
   * 
   * @example
   * ```typescript
   * const balance = await iris.getFacilitatorBalance('account_123');
   * console.log('Account balance:', balance.balance);
   * ```
   */
  async getFacilitatorBalance(bankAccountId: string): Promise<BalanceResponse> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/bank_accounts/${bankAccountId}/balance`;
    return this.httpClient.request<BalanceResponse>(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Get list of supported beneficiary banks
   * @returns Promise containing list of banks
   * 
   * @example
   * ```typescript
   * const banks = await iris.getBeneficiaryBanks();
   * banks.beneficiary_banks.forEach(bank => {
   *   console.log(`${bank.code}: ${bank.name}`);
   * });
   * ```
   */
  async getBeneficiaryBanks(): Promise<BankResponse> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/beneficiary_banks`;
    return this.httpClient.request<BankResponse>(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl
    );
  }

  /**
   * Validate a bank account
   * @param parameter - Bank code and account number to validate
   * @returns Promise containing validation result
   * 
   * @example
   * ```typescript
   * const validation = await iris.validateBankAccount({
   *   bank: 'bca',
   *   account: '1234567890',
   * });
   * console.log('Account holder:', validation.account_holder_name);
   * ```
   */
  async validateBankAccount(
    parameter: BankAccountValidationParameter
  ): Promise<any> {
    const apiUrl = `${this.apiConfig.getIrisApiBaseUrl()}/account_validation`;
    return this.httpClient.request(
      'get',
      this.apiConfig.get().serverKey,
      apiUrl,
      parameter
    );
  }
}