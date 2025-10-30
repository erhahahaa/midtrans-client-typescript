/**
 * Configuration options for ApiConfig
 */
export interface ApiConfigOptions {
  isProduction?: boolean;
  serverKey?: string;
  clientKey?: string;
}

/**
 * Config class that stores isProduction, serverKey, clientKey,
 * and provides API base URLs.
 */
export class ApiConfig {
  // Static constants for API base URLs
  static readonly CORE_SANDBOX_BASE_URL = 'https://api.sandbox.midtrans.com';
  static readonly CORE_PRODUCTION_BASE_URL = 'https://api.midtrans.com';
  static readonly SNAP_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/snap/v1';
  static readonly SNAP_PRODUCTION_BASE_URL = 'https://app.midtrans.com/snap/v1';
  static readonly IRIS_SANDBOX_BASE_URL = 'https://app.sandbox.midtrans.com/iris/api/v1';
  static readonly IRIS_PRODUCTION_BASE_URL = 'https://app.midtrans.com/iris/api/v1';

  private isProduction: boolean;
  private serverKey: string;
  private clientKey: string;

  /**
   * Initiate with options
   * @param options - Configuration options containing isProduction, serverKey, clientKey
   */
  constructor(options: ApiConfigOptions = {}) {
    this.isProduction = false;
    this.serverKey = '';
    this.clientKey = '';

    this.set(options);
  }

  /**
   * Get current configuration
   * @returns Object containing isProduction, serverKey, clientKey
   */
  get(): Required<ApiConfigOptions> {
    return {
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey,
    };
  }

  /**
   * Set configuration
   * @param options - Configuration options to update
   */
  set(options: ApiConfigOptions): void {
    if (options.isProduction !== undefined) {
      this.isProduction = options.isProduction;
    }
    if (options.serverKey !== undefined) {
      this.serverKey = options.serverKey;
    }
    if (options.clientKey !== undefined) {
      this.clientKey = options.clientKey;
    }
  }

  /**
   * Get Core API base URL based on environment
   * @returns Core API base URL
   */
  getCoreApiBaseUrl(): string {
    return this.isProduction
      ? ApiConfig.CORE_PRODUCTION_BASE_URL
      : ApiConfig.CORE_SANDBOX_BASE_URL;
  }

  /**
   * Get Snap API base URL based on environment
   * @returns Snap API base URL
   */
  getSnapApiBaseUrl(): string {
    return this.isProduction
      ? ApiConfig.SNAP_PRODUCTION_BASE_URL
      : ApiConfig.SNAP_SANDBOX_BASE_URL;
  }

  /**
   * Get Iris API base URL based on environment
   * @returns Iris API base URL
   */
  getIrisApiBaseUrl(): string {
    return this.isProduction
      ? ApiConfig.IRIS_PRODUCTION_BASE_URL
      : ApiConfig.IRIS_SANDBOX_BASE_URL;
  }
}