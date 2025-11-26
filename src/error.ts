/**
 * API response structure from Midtrans
 */
export interface ApiResponse extends Record<string, unknown> {
	status_code?: string;
	status_message?: string;
	transaction_id?: string;
}

/**
 * Raw HTTP client data
 */
export interface RawHttpClientData extends Record<string, unknown> {
	statusCode?: number;
	headers?: Record<string, string>;
	body?: unknown;
}

/**
 * Custom HTTP Error Class that exposes httpStatusCode, ApiResponse, and rawHttpClientData
 * to provide more information for library users
 */
export class MidtransError extends Error {
	public readonly httpStatusCode: number | null;
	public readonly ApiResponse: ApiResponse | null;
	public readonly rawHttpClientData: RawHttpClientData | null;

	constructor(
		message: string,
		httpStatusCode: number | null = null,
		ApiResponse: ApiResponse | null = null,
		rawHttpClientData: RawHttpClientData | null = null,
	) {
		super(message);

		// Ensure the name of this error is the same as the class name
		this.name = this.constructor.name;

		this.httpStatusCode = httpStatusCode;
		this.ApiResponse = ApiResponse;
		this.rawHttpClientData = rawHttpClientData;

		// This clips the constructor invocation from the stack trace
		// Only available in V8 environments (Node.js, Chrome, etc.)
		if (typeof Error.captureStackTrace === "function") {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	/**
	 * Get a formatted error message with status code
	 */
	getFullMessage(): string {
		if (this.httpStatusCode) {
			return `[${this.httpStatusCode}] ${this.message}`;
		}
		return this.message;
	}

	/**
	 * Check if the error is a client error (4xx)
	 */
	isClientError(): boolean {
		return (
			this.httpStatusCode !== null &&
			this.httpStatusCode >= 400 &&
			this.httpStatusCode < 500
		);
	}

	/**
	 * Check if the error is a server error (5xx)
	 */
	isServerError(): boolean {
		return (
			this.httpStatusCode !== null &&
			this.httpStatusCode >= 500 &&
			this.httpStatusCode < 600
		);
	}

	/**
	 * Convert error to JSON representation
	 */
	toJSON(): Record<string, unknown> {
		return {
			name: this.name,
			message: this.message,
			httpStatusCode: this.httpStatusCode,
			ApiResponse: this.ApiResponse,
			rawHttpClientData: this.rawHttpClientData,
			stack: this.stack,
		};
	}
}
