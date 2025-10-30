import { MidtransError } from './error';

/**
 * HTTP request options
 */
export interface RequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

/**
 * HTTP response structure
 */
export interface HttpResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
}

/**
 * Request parameters (body or query params)
 */
export type RequestParams = Record<string, any> | string;

/**
 * Midtrans API response
 */
export interface MidtransApiResponse {
  status_code?: string | number;
  status_message?: string;
  transaction_status?: string;
  [key: string]: any;
}

/**
 * HTTP client for making API requests to Midtrans API
 * Uses native fetch API instead of external libraries
 */
export class HttpClient {
  private readonly userAgent = 'midtransclient-nodejs/2.0.0';

  constructor(private parent: any = {}) { }

  /**
   * Make HTTP request to Midtrans API
   * 
   * @param httpMethod - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param serverKey - Midtrans server key for authentication
   * @param requestUrl - Full URL to request
   * @param firstParam - Body payload for non-GET requests, query params for GET
   * @param secondParam - Query params for non-GET requests, body for GET
   * @returns Promise resolving to API response data
   */
  async request<T = MidtransApiResponse>(
    httpMethod: string,
    serverKey: string,
    requestUrl: string,
    firstParam: RequestParams = {},
    secondParam: RequestParams = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'accept': 'application/json',
      'user-agent': this.userAgent,
      'authorization': 'Basic ' + this.encodeBase64(`${serverKey}:`),
    };

    let reqBodyPayload: Record<string, any> = {};
    let reqQueryParam: Record<string, any> = {};

    if (httpMethod.toLowerCase() === 'get') {
      // GET requests use first param as query params
      reqQueryParam = this.parseParam(firstParam, 'query parameters');
      reqBodyPayload = this.parseParam(secondParam, 'body parameters');
    } else {
      // Non-GET requests use first param as body payload
      reqBodyPayload = this.parseParam(firstParam, 'body parameters');
      reqQueryParam = this.parseParam(secondParam, 'query parameters');
    }

    // Build URL with query parameters
    const url = this.buildUrl(requestUrl, reqQueryParam);

    // Prepare request options
    const options: RequestInit = {
      method: httpMethod.toUpperCase(),
      headers,
    };

    // Add body for non-GET requests
    if (httpMethod.toLowerCase() !== 'get' && Object.keys(reqBodyPayload).length > 0) {
      options.body = JSON.stringify(reqBodyPayload);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      // Check for API errors in response body
      if (
        data.status_code &&
        Number(data.status_code) >= 400 &&
        Number(data.status_code) !== 407
      ) {
        // 407 is expected for 'expire' transaction status
        throw new MidtransError(
          `Midtrans API is returning API error. HTTP status code: ${data.status_code}. API response: ${JSON.stringify(data)}`,
          Number(data.status_code),
          data,
          { statusCode: response.status, headers: this.headersToObject(response.headers), body: data }
        );
      }

      // Check for HTTP errors
      if (!response.ok) {
        throw new MidtransError(
          `Midtrans API is returning API error. HTTP status code: ${response.status}. API response: ${JSON.stringify(data)}`,
          response.status,
          data,
          { statusCode: response.status, headers: this.headersToObject(response.headers), body: data }
        );
      }

      return data as T;
    } catch (error) {
      // If it's already a MidtransError, rethrow it
      if (error instanceof MidtransError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new MidtransError(
          `Midtrans API request failed. HTTP response not found, likely connection failure, with message: ${error.message}`,
          null,
          null,
          { error: error.message }
        );
      }

      // Handle other errors
      throw new MidtransError(
        `Unexpected error during Midtrans API request: ${error instanceof Error ? error.message : String(error)}`,
        null,
        null,
        { error }
      );
    }
  }

  /**
   * Parse and validate request parameters
   */
  private parseParam(param: RequestParams, paramType: string): Record<string, any> {
    if (typeof param === 'string') {
      try {
        return JSON.parse(param);
      } catch (err) {
        throw new MidtransError(
          `Failed to parse '${paramType}' string as JSON. Use JSON string or Object as '${paramType}'. Error: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
    return param as Record<string, any>;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(baseUrl: string, queryParams: Record<string, any>): string {
    if (Object.keys(queryParams).length === 0) {
      return baseUrl;
    }

    const queryString = Object.entries(queryParams)
      .map(([key, value]) => {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(String(value));
        return `${encodedKey}=${encodedValue}`;
      })
      .join('&');

    return `${baseUrl}?${queryString}`;
  }

  /**
   * Encode string to Base64
   */
  private encodeBase64(str: string): string {
    // For Node.js environment
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str).toString('base64');
    }
    // For browser environment
    return btoa(str);
  }

  /**
   * Convert Headers object to plain object
   */
  private headersToObject(headers: Headers): Record<string, string> {
    const obj: Record<string, string> = {};
    headers.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
}