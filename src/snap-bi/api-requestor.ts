import { SnapBiConfig } from './config';

/**
 * HTTP request headers
 */
export interface RequestHeaders {
  [key: string]: string;
}

/**
 * Request body
 */
export type RequestBody = Record<string, any>;

/**
 * Error response structure
 */
export interface ErrorResponse {
  message: string;
  status: number | string;
  responseCode?: string;
  responseMessage?: string;
}

/**
 * API Requestor for Snap BI operations
 * Handles HTTP requests with logging and error handling
 */
export class SnapBiApiRequestor {
  constructor(private config: SnapBiConfig) { }

  /**
   * Make a remote API call with the specified URL, headers, and request body
   * 
   * @param url - The API endpoint URL
   * @param headers - The headers for the request
   * @param body - The JSON payload for the request
   * @param timeout - Request timeout in milliseconds (default: 10000)
   * @returns Promise resolving to the API response
   * 
   * @example
   * ```typescript
   * const requestor = new SnapBiApiRequestor(config);
   * const response = await requestor.remoteCall(
   *   'https://api.example.com/endpoint',
   *   { 'Content-Type': 'application/json' },
   *   { key: 'value' }
   * );
   * ```
   */
  async remoteCall<T = any>(
    url: string,
    headers: RequestHeaders,
    body: RequestBody,
    timeout: number = 10000
  ): Promise<T | ErrorResponse> {
    // Log request if enabled
    if (this.config.isLoggingEnabled()) {
      this.logRequest(url, headers, body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      // Log response if enabled
      if (this.config.isLoggingEnabled()) {
        this.logResponse(response.status, data);
      }

      // Return data even for non-2xx status codes
      // This matches the original behavior
      return data as T;

    } catch (error) {
      clearTimeout(timeoutId);

      // Log error if enabled
      if (this.config.isLoggingEnabled()) {
        this.logError(error);
      }

      // Handle different error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            message: 'Request timeout',
            status: 'TIMEOUT',
          };
        }

        return {
          message: error.message,
          status: 500,
        };
      }

      return {
        message: 'Unknown error occurred',
        status: 500,
      };
    }
  }

  /**
   * Log request details
   */
  private logRequest(url: string, headers: RequestHeaders, body: RequestBody): void {
    console.log(`Request URL: ${url}`);
    console.log(`Request Headers: \n${JSON.stringify(headers, null, 2)}`);
    if (body && Object.keys(body).length > 0) {
      console.log(`Request Body: \n${JSON.stringify(body, null, 2)}`);
    }
  }

  /**
   * Log response details
   */
  private logResponse(status: number, data: any): void {
    console.log(`Response Status: ${status}`);
    console.log(`Response Body: \n${JSON.stringify(data, null, 2)}`);
  }

  /**
   * Log error details
   */
  private logError(error: unknown): void {
    if (error instanceof Error) {
      console.error(`Request Error: ${error.message}`);
      if (error.stack) {
        console.error(`Stack Trace: ${error.stack}`);
      }
    } else {
      console.error(`Request Error: ${String(error)}`);
    }
  }

  /**
   * Make a GET request
   * 
   * @param url - The API endpoint URL
   * @param headers - The headers for the request
   * @param queryParams - Query parameters for the request
   * @param timeout - Request timeout in milliseconds
   * @returns Promise resolving to the API response
   */
  async get<T = any>(
    url: string,
    headers: RequestHeaders = {},
    queryParams: Record<string, string> = {},
    timeout: number = 10000
  ): Promise<T | ErrorResponse> {
    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    if (this.config.isLoggingEnabled()) {
      this.logRequest(fullUrl, headers, {});
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (this.config.isLoggingEnabled()) {
        this.logResponse(response.status, data);
      }

      return data as T;

    } catch (error) {
      clearTimeout(timeoutId);

      if (this.config.isLoggingEnabled()) {
        this.logError(error);
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            message: 'Request timeout',
            status: 'TIMEOUT',
          };
        }

        return {
          message: error.message,
          status: 500,
        };
      }

      return {
        message: 'Unknown error occurred',
        status: 500,
      };
    }
  }

  /**
   * Make a PUT request
   * 
   * @param url - The API endpoint URL
   * @param headers - The headers for the request
   * @param body - The JSON payload for the request
   * @param timeout - Request timeout in milliseconds
   * @returns Promise resolving to the API response
   */
  async put<T = any>(
    url: string,
    headers: RequestHeaders,
    body: RequestBody,
    timeout: number = 10000
  ): Promise<T | ErrorResponse> {
    if (this.config.isLoggingEnabled()) {
      this.logRequest(url, headers, body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (this.config.isLoggingEnabled()) {
        this.logResponse(response.status, data);
      }

      return data as T;

    } catch (error) {
      clearTimeout(timeoutId);

      if (this.config.isLoggingEnabled()) {
        this.logError(error);
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            message: 'Request timeout',
            status: 'TIMEOUT',
          };
        }

        return {
          message: error.message,
          status: 500,
        };
      }

      return {
        message: 'Unknown error occurred',
        status: 500,
      };
    }
  }
}