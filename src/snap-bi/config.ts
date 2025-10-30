/**
 * Configuration options for SnapBi
 */
export interface SnapBiConfigOptions {
  isProduction?: boolean;
  snapBiClientId?: string;
  snapBiPrivateKey?: string;
  snapBiClientSecret?: string;
  snapBiPartnerId?: string;
  snapBiChannelId?: string;
  enableLogging?: boolean;
  snapBiPublicKey?: string;
}

/**
 * Configuration class for Snap BI (Bank Integration) API
 * Stores credentials and environment settings for Snap BI operations
 */
export class SnapBiConfig {
  // Static constants for base URLs
  static readonly SNAP_BI_SANDBOX_BASE_URL = 'https://merchants.sbx.midtrans.com';
  static readonly SNAP_BI_PRODUCTION_BASE_URL = 'https://merchants.midtrans.com';

  private isProduction: boolean = false;
  private snapBiClientId: string | null = null;
  private snapBiPrivateKey: string | null = null;
  private snapBiClientSecret: string | null = null;
  private snapBiPartnerId: string | null = null;
  private snapBiChannelId: string | null = null;
  private enableLogging: boolean = false;
  private snapBiPublicKey: string | null = null;

  /**
   * Initialize SnapBi configuration
   * @param options - Configuration options
   */
  constructor(options: SnapBiConfigOptions = {}) {
    this.set(options);
  }

  /**
   * Get current configuration
   * @returns Object containing all configuration values
   */
  get(): Required<SnapBiConfigOptions> {
    return {
      isProduction: this.isProduction,
      snapBiClientId: this.snapBiClientId ?? '',
      snapBiPrivateKey: this.snapBiPrivateKey ?? '',
      snapBiClientSecret: this.snapBiClientSecret ?? '',
      snapBiPartnerId: this.snapBiPartnerId ?? '',
      snapBiChannelId: this.snapBiChannelId ?? '',
      enableLogging: this.enableLogging,
      snapBiPublicKey: this.snapBiPublicKey ?? '',
    };
  }

  /**
   * Set configuration values
   * @param options - Configuration options to update
   */
  set(options: SnapBiConfigOptions): void {
    if (options.isProduction !== undefined) {
      this.isProduction = options.isProduction;
    }
    if (options.snapBiClientId !== undefined) {
      this.snapBiClientId = options.snapBiClientId;
    }
    if (options.snapBiPrivateKey !== undefined) {
      this.snapBiPrivateKey = options.snapBiPrivateKey;
    }
    if (options.snapBiClientSecret !== undefined) {
      this.snapBiClientSecret = options.snapBiClientSecret;
    }
    if (options.snapBiPartnerId !== undefined) {
      this.snapBiPartnerId = options.snapBiPartnerId;
    }
    if (options.snapBiChannelId !== undefined) {
      this.snapBiChannelId = options.snapBiChannelId;
    }
    if (options.enableLogging !== undefined) {
      this.enableLogging = options.enableLogging;
    }
    if (options.snapBiPublicKey !== undefined) {
      this.snapBiPublicKey = options.snapBiPublicKey;
    }
  }

  /**
   * Get Snap BI API base URL based on environment
   * @returns Snap BI API base URL
   */
  getBaseUrl(): string {
    return this.isProduction
      ? SnapBiConfig.SNAP_BI_PRODUCTION_BASE_URL
      : SnapBiConfig.SNAP_BI_SANDBOX_BASE_URL;
  }

  /**
   * Check if logging is enabled
   * @returns True if logging is enabled
   */
  isLoggingEnabled(): boolean {
    return this.enableLogging;
  }

  /**
   * Validate that required configuration is present
   * @throws {Error} If required configuration is missing
   */
  validate(): void {
    const required: Array<keyof SnapBiConfigOptions> = [
      'snapBiClientId',
      'snapBiPrivateKey',
      'snapBiClientSecret',
      'snapBiPartnerId',
      'snapBiChannelId',
    ];

    const missing = required.filter(key => !this[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required SnapBi configuration: ${missing.join(', ')}`
      );
    }
  }

  /**
   * Get client ID
   * @returns Client ID or null
   */
  getClientId(): string | null {
    return this.snapBiClientId;
  }

  /**
   * Get private key
   * @returns Private key or null
   */
  getPrivateKey(): string | null {
    return this.snapBiPrivateKey;
  }

  /**
   * Get client secret
   * @returns Client secret or null
   */
  getClientSecret(): string | null {
    return this.snapBiClientSecret;
  }

  /**
   * Get partner ID
   * @returns Partner ID or null
   */
  getPartnerId(): string | null {
    return this.snapBiPartnerId;
  }

  /**
   * Get channel ID
   * @returns Channel ID or null
   */
  getChannelId(): string | null {
    return this.snapBiChannelId;
  }

  /**
   * Get public key
   * @returns Public key or null
   */
  getPublicKey(): string | null {
    return this.snapBiPublicKey;
  }
}