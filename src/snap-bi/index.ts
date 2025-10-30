import { SnapBiConfig } from './config';
import { SnapBiApiRequestor } from './api-requestor';

/**
 * Payment method types
 */
export type PaymentMethod = 'directDebit' | 'va' | 'qris' | '';

/**
 * Access token response
 */
export interface AccessTokenResponse {
  accessToken: string;
  expiresIn: string;
  tokenType: string;
}

/**
 * Payment response
 */
export interface PaymentResponse {
  responseCode: string;
  responseMessage: string;
  [key: string]: any;
}

/**
 * Request headers
 */
export interface RequestHeaders {
  [key: string]: string;
}

/**
 * Request body
 */
export type RequestBody = Record<string, any>;

/**
 * Snap BI API client for bank integration payments
 * Supports Direct Debit, Virtual Account, and QRIS payment methods
 */
export class SnapBi {
  // API endpoint constants
  static readonly ACCESS_TOKEN = '/v1.0/access-token/b2b';
  static readonly PAYMENT_HOST_TO_HOST = '/v1.0/debit/payment-host-to-host';
  static readonly CREATE_VA = '/v1.0/transfer-va/create-va';
  static readonly DEBIT_STATUS = '/v1.0/debit/status';
  static readonly DEBIT_REFUND = '/v1.0/debit/refund';
  static readonly DEBIT_CANCEL = '/v1.0/debit/cancel';
  static readonly VA_STATUS = '/v1.0/transfer-va/status';
  static readonly VA_CANCEL = '/v1.0/transfer-va/delete-va';
  static readonly QRIS_PAYMENT = '/v1.0/qr/qr-mpm-generate';
  static readonly QRIS_STATUS = '/v1.0/qr/qr-mpm-query';
  static readonly QRIS_REFUND = '/v1.0/qr/qr-mpm-refund';
  static readonly QRIS_CANCEL = '/v1.0/qr/qr-mpm-cancel';

  private apiPath: string = '';
  private accessTokenHeader: RequestHeaders = {};
  private transactionHeader: RequestHeaders = {};
  private body: RequestBody = {};
  private accessToken: string = '';
  private deviceId: string = '';
  private debugId: string = '';
  private timeStamp: string = new Date().toISOString();
  private timeout: number | null = null;
  private signature: string = '';
  private notificationUrlPath: string = '';
  private notificationPayload: RequestBody = {};

  constructor(
    private paymentMethod: PaymentMethod,
    private config: SnapBiConfig,
    private requestor: SnapBiApiRequestor
  ) { }

  /**
   * Create a Direct Debit payment instance
   */
  static directDebit(config: SnapBiConfig): SnapBi {
    return new SnapBi('directDebit', config, new SnapBiApiRequestor(config));
  }

  /**
   * Create a Virtual Account payment instance
   */
  static va(config: SnapBiConfig): SnapBi {
    return new SnapBi('va', config, new SnapBiApiRequestor(config));
  }

  /**
   * Create a QRIS payment instance
   */
  static qris(config: SnapBiConfig): SnapBi {
    return new SnapBi('qris', config, new SnapBiApiRequestor(config));
  }

  /**
   * Create a notification handler instance
   */
  static notification(config: SnapBiConfig): SnapBi {
    return new SnapBi('', config, new SnapBiApiRequestor(config));
  }

  /**
   * Set access token header
   */
  withAccessTokenHeader(headers: RequestHeaders): this {
    this.accessTokenHeader = { ...this.accessTokenHeader, ...headers };
    return this;
  }

  /**
   * Set transaction header
   */
  withTransactionHeader(headers: RequestHeaders): this {
    this.transactionHeader = { ...this.transactionHeader, ...headers };
    return this;
  }

  /**
   * Set access token
   */
  withAccessToken(accessToken: string): this {
    this.accessToken = accessToken;
    return this;
  }

  /**
   * Set request body
   */
  withBody(body: RequestBody): this {
    this.body = body;
    return this;
  }

  /**
   * Set signature for notification verification
   */
  withSignature(signature: string): this {
    this.signature = signature;
    return this;
  }

  /**
   * Set timestamp
   */
  withTimeStamp(timeStamp: string): this {
    this.timeStamp = timeStamp;
    return this;
  }

  /**
   * Set notification payload
   */
  withNotificationPayload(notificationPayload: RequestBody): this {
    this.notificationPayload = notificationPayload;
    return this;
  }

  /**
   * Set notification URL path
   */
  withNotificationUrlPath(notificationUrlPath: string): this {
    this.notificationUrlPath = notificationUrlPath;
    return this;
  }

  /**
   * Set device ID
   */
  withDeviceId(deviceId: string): this {
    this.deviceId = deviceId;
    return this;
  }

  /**
   * Set debug ID
   */
  withDebugId(debugId: string): this {
    this.debugId = debugId;
    return this;
  }

  /**
   * Set request timeout
   */
  withTimeout(timeout: number): this {
    this.timeout = timeout;
    return this;
  }

  /**
   * Create a payment
   * @param externalId - External ID for the transaction
   * @returns Promise containing payment response
   */
  async createPayment(externalId: string): Promise<PaymentResponse> {
    this.apiPath = this.setupCreatePaymentApiPath(this.paymentMethod);
    return await this.createConnection(externalId);
  }

  /**
   * Cancel a payment
   * @param externalId - External ID for the transaction
   * @returns Promise containing cancellation response
   */
  async cancel(externalId: string): Promise<PaymentResponse> {
    this.apiPath = this.setupCancelApiPath(this.paymentMethod);
    return await this.createConnection(externalId);
  }

  /**
   * Refund a payment
   * @param externalId - External ID for the transaction
   * @returns Promise containing refund response
   */
  async refund(externalId: string): Promise<PaymentResponse> {
    this.apiPath = this.setupRefundApiPath(this.paymentMethod);
    return await this.createConnection(externalId);
  }

  /**
   * Get payment status
   * @param externalId - External ID for the transaction
   * @returns Promise containing status response
   */
  async getStatus(externalId: string): Promise<PaymentResponse> {
    this.apiPath = this.setupGetStatusApiPath(this.paymentMethod);
    return await this.createConnection(externalId);
  }

  /**
   * Verify webhook notification signature
   * @returns True if signature is valid
   * @throws Error if public key is not set
   */
  async isWebhookNotificationVerified(): Promise<boolean> {
    const publicKey = this.config.getPublicKey();

    if (!publicKey) {
      throw new Error(
        'The public key is null. You need to set the public key in SnapBiConfig.\n' +
        'For more details, contact support at support@midtrans.com if you have any questions.'
      );
    }

    const notificationHttpMethod = 'POST';
    const minifiedNotificationBodyJsonString = JSON.stringify(this.notificationPayload);
    const hashedNotificationBodyJsonString = await this.sha256Hash(
      minifiedNotificationBodyJsonString
    );

    const rawStringDataToVerifyAgainstSignature =
      notificationHttpMethod +
      ':' +
      this.notificationUrlPath +
      ':' +
      hashedNotificationBodyJsonString +
      ':' +
      this.timeStamp;

    return await this.verifySignature(
      rawStringDataToVerifyAgainstSignature,
      this.signature,
      publicKey
    );
  }

  /**
   * Get access token
   * @returns Promise containing access token response
   */
  async getAccessToken(): Promise<AccessTokenResponse> {
    const snapBiAccessTokenHeader = await this.buildAccessTokenHeader(this.timeStamp);
    const openApiPayload = {
      grant_type: 'client_credentials',
    };

    const response = await this.requestor.remoteCall<AccessTokenResponse>(
      this.config.getBaseUrl() + SnapBi.ACCESS_TOKEN,
      snapBiAccessTokenHeader,
      openApiPayload,
      this.timeout ?? 10000
    );

    // Check if response is an error
    if ('status' in response && 'message' in response) {
      throw new Error(`Failed to get access token: ${response.message}`);
    }

    return response;
  }

  /**
   * Create connection and make API request
   * @param externalId - External ID for the transaction
   * @returns Promise containing API response
   */
  private async createConnection(externalId: string): Promise<any> {
    if (!this.accessToken) {
      const accessTokenResponse = await this.getAccessToken();
      if (!accessTokenResponse.accessToken) {
        return accessTokenResponse;
      }
      this.accessToken = accessTokenResponse.accessToken;
    }

    const snapBiTransactionHeader = await this.buildSnapBiTransactionHeader(
      externalId,
      this.timeStamp
    );

    return await this.requestor.remoteCall(
      this.config.getBaseUrl() + this.apiPath,
      snapBiTransactionHeader,
      this.body,
      this.timeout ?? 10000
    );
  }

  /**
   * Generate symmetric signature using HMAC-SHA512
   */
  static async getSymmetricSignatureHmacSh512(
    accessToken: string,
    requestBody: RequestBody,
    method: string,
    path: string,
    clientSecret: string,
    timeStamp: string
  ): Promise<string> {
    const minifiedBody = JSON.stringify(requestBody);
    const hashedBody = await SnapBi.sha256Hash(minifiedBody);

    const payload = `${method.toUpperCase()}:${path}:${accessToken}:${hashedBody}:${timeStamp}`;
    return await SnapBi.hmacSha512(payload, clientSecret);
  }

  /**
   * Generate asymmetric signature using SHA256 with RSA
   */
  static async getAsymmetricSignatureSha256WithRsa(
    clientId: string,
    xTimeStamp: string,
    privateKey: string
  ): Promise<string> {
    const stringToSign = `${clientId}|${xTimeStamp}`;
    return await SnapBi.signWithRsa(stringToSign, privateKey);
  }

  /**
   * Build transaction header
   */
  private async buildSnapBiTransactionHeader(
    externalId: string,
    timeStamp: string
  ): Promise<RequestHeaders> {
    let snapBiTransactionHeader: RequestHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-PARTNER-ID': this.config.getPartnerId() ?? '',
      'X-EXTERNAL-ID': externalId,
      'X-DEVICE-ID': this.deviceId,
      'CHANNEL-ID': this.config.getChannelId() ?? '',
      'debug-id': this.debugId,
      'Authorization': `Bearer ${this.accessToken}`,
      'X-TIMESTAMP': timeStamp,
      'X-SIGNATURE': await SnapBi.getSymmetricSignatureHmacSh512(
        this.accessToken,
        this.body,
        'post',
        this.apiPath,
        this.config.getClientSecret() ?? '',
        timeStamp
      ),
    };

    if (this.transactionHeader) {
      snapBiTransactionHeader = { ...snapBiTransactionHeader, ...this.transactionHeader };
    }

    return snapBiTransactionHeader;
  }

  /**
   * Build access token header
   */
  private async buildAccessTokenHeader(timeStamp: string): Promise<RequestHeaders> {
    let snapBiAccessTokenHeader: RequestHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CLIENT-KEY': this.config.getClientId() ?? '',
      'X-SIGNATURE': await SnapBi.getAsymmetricSignatureSha256WithRsa(
        this.config.getClientId() ?? '',
        timeStamp,
        this.config.getPrivateKey() ?? ''
      ),
      'X-TIMESTAMP': timeStamp,
      'debug-id': this.debugId,
    };

    if (this.accessTokenHeader) {
      snapBiAccessTokenHeader = { ...snapBiAccessTokenHeader, ...this.accessTokenHeader };
    }

    return snapBiAccessTokenHeader;
  }

  /**
   * Setup API path for create payment based on payment method
   */
  private setupCreatePaymentApiPath(paymentMethod: PaymentMethod): string {
    switch (paymentMethod) {
      case 'va':
        return SnapBi.CREATE_VA;
      case 'qris':
        return SnapBi.QRIS_PAYMENT;
      case 'directDebit':
        return SnapBi.PAYMENT_HOST_TO_HOST;
      default:
        throw new Error(`Payment method not implemented: ${paymentMethod}`);
    }
  }

  /**
   * Setup API path for refund based on payment method
   */
  private setupRefundApiPath(paymentMethod: PaymentMethod): string {
    switch (paymentMethod) {
      case 'qris':
        return SnapBi.QRIS_REFUND;
      case 'directDebit':
        return SnapBi.DEBIT_REFUND;
      default:
        throw new Error(`Payment method not implemented: ${paymentMethod}`);
    }
  }

  /**
   * Setup API path for cancel based on payment method
   */
  private setupCancelApiPath(paymentMethod: PaymentMethod): string {
    switch (paymentMethod) {
      case 'va':
        return SnapBi.VA_CANCEL;
      case 'qris':
        return SnapBi.QRIS_CANCEL;
      case 'directDebit':
        return SnapBi.DEBIT_CANCEL;
      default:
        throw new Error(`Payment method not implemented: ${paymentMethod}`);
    }
  }

  /**
   * Setup API path for get status based on payment method
   */
  private setupGetStatusApiPath(paymentMethod: PaymentMethod): string {
    switch (paymentMethod) {
      case 'va':
        return SnapBi.VA_STATUS;
      case 'qris':
        return SnapBi.QRIS_STATUS;
      case 'directDebit':
        return SnapBi.DEBIT_STATUS;
      default:
        throw new Error(`Payment method not implemented: ${paymentMethod}`);
    }
  }

  // Crypto utility methods using Web Crypto API
  private static async sha256Hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
  }

  private async sha256Hash(data: string): Promise<string> {
    return SnapBi.sha256Hash(data);
  }

  private static async hmacSha512(data: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const dataBuffer = encoder.encode(data);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  private static async signWithRsa(data: string, privateKeyPem: string): Promise<string> {
    // Remove PEM headers/footers and whitespace
    const pemContents = privateKeyPem
      .replace(/-----BEGIN.*?-----/, '')
      .replace(/-----END.*?-----/, '')
      .replace(/\s/g, '');

    // Decode base64
    const binaryDer = atob(pemContents);
    const binaryDerArray = new Uint8Array(binaryDer.length);
    for (let i = 0; i < binaryDer.length; i++) {
      binaryDerArray[i] = binaryDer.charCodeAt(i);
    }

    // Import private key
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryDerArray,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    // Sign data
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, dataBuffer);

    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  private async verifySignature(
    data: string,
    signature: string,
    publicKeyPem: string
  ): Promise<boolean> {
    try {
      // Remove PEM headers/footers and whitespace
      const pemContents = publicKeyPem
        .replace(/-----BEGIN.*?-----/, '')
        .replace(/-----END.*?-----/, '')
        .replace(/\s/g, '');

      // Decode base64
      const binaryDer = atob(pemContents);
      const binaryDerArray = new Uint8Array(binaryDer.length);
      for (let i = 0; i < binaryDer.length; i++) {
        binaryDerArray[i] = binaryDer.charCodeAt(i);
      }

      // Import public key
      const cryptoKey = await crypto.subtle.importKey(
        'spki',
        binaryDerArray,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256',
        },
        false,
        ['verify']
      );

      // Decode signature
      const signatureBinary = atob(signature);
      const signatureArray = new Uint8Array(signatureBinary.length);
      for (let i = 0; i < signatureBinary.length; i++) {
        signatureArray[i] = signatureBinary.charCodeAt(i);
      }

      // Verify signature
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      return await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        signatureArray,
        dataBuffer
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }
}