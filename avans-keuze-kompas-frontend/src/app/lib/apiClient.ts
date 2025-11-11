/**
 * ApiClient - Singleton Pattern
 * Centralized HTTP client for all API requests
 * Provides consistent error handling, request configuration, and authentication
 */

import { getConfig } from "./config";
import type { VKM, VKMInput } from "@/app/types/VKM";

// Types for better type safety
export interface ApiError {
	message: string;
	status: number;
	details?: unknown;
}

export interface RequestOptions extends RequestInit {
	requiresAuth?: boolean;
}

class ApiClient {
	private static instance: ApiClient;
	private config = getConfig();
	private getTokenFn: (() => string | null) | null = null;

	/**
	 * Private constructor to prevent direct instantiation
	 * Use ApiClient.getInstance() instead
	 */
	private constructor() {}

	/**
	 * Get the singleton instance of ApiClient
	 */
	static getInstance(): ApiClient {
		if (!ApiClient.instance) {
			ApiClient.instance = new ApiClient();
		}
		return ApiClient.instance;
	}

	/**
	 * Set the token getter function
	 * This allows dependency injection for auth without circular dependencies
	 */
	setTokenGetter(fn: () => string | null): void {
		this.getTokenFn = fn;
	}

	/**
	 * Get authentication headers
	 */
	private getAuthHeaders(): HeadersInit {
		if (!this.getTokenFn) {
			return {};
		}
		const token = this.getTokenFn();
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	/**
	 * Build headers for requests
	 */
	private buildHeaders(
		options: RequestOptions = {},
		includeAuth = true,
	): HeadersInit {
		const headers: HeadersInit = {
			"Content-Type": "application/json",
			...options.headers,
		};

		if (includeAuth && options.requiresAuth !== false) {
			Object.assign(headers, this.getAuthHeaders());
		}

		return headers;
	}

	/**
	 * Handle API errors consistently
	 */
	private async handleError(response: Response): Promise<never> {
		let errorDetails: unknown;
		try {
			errorDetails = await response.json();
		} catch {
			errorDetails = await response.text();
		}

		const error: ApiError = {
			message: `API request failed: ${response.statusText}`,
			status: response.status,
			details: errorDetails,
		};

		if (!this.config.IS_PRODUCTION) {
			// console.error("API Error:", error);
		}

		throw error;
	}

	/**
	 * Generic request method
	 */
	private async request<T>(
		endpoint: string,
		options: RequestOptions = {},
	): Promise<T> {
		const url = this.config.getApiUrl(endpoint);
		const requiresAuth = options.requiresAuth !== false;

		const fetchOptions: RequestInit = {
			...options,
			headers: this.buildHeaders(options, requiresAuth),
			credentials: "include", // Send cookies with requests
		};

		try {
			const response = await fetch(url, fetchOptions);

			if (!response.ok) {
				await this.handleError(response);
			}

			// Handle empty responses (e.g., 204 No Content)
			if (response.status === 204) {
				return {} as T;
			}

			return await response.json();
		} catch (error) {
			if ((error as ApiError).status) {
				throw error;
			}
			// Network error or other fetch error
			throw {
				message: "Network error or server unavailable",
				status: 0,
				details: error,
			} as ApiError;
		}
	}

	/**
	 * GET request
	 */
	async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "GET",
			cache: "no-store",
		});
	}

	/**
	 * POST request
	 */
	async post<T>(
		endpoint: string,
		data?: unknown,
		options: RequestOptions = {},
	): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "POST",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	/**
	 * PUT request
	 */
	async put<T>(
		endpoint: string,
		data: unknown,
		options: RequestOptions = {},
	): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	/**
	 * DELETE request
	 */
	async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "DELETE",
		});
	}

	/**
	 * PATCH request
	 */
	async patch<T>(
		endpoint: string,
		data: unknown,
		options: RequestOptions = {},
	): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "PATCH",
			body: JSON.stringify(data),
		});
	}

	// ===========================================
	// VKM-specific API methods
	// ===========================================

	/**
	 * Get all VKM items
	 */
	async getVKMItems(): Promise<VKM[]> {
		return this.get<VKM[]>("/vkm");
	}

	/**
	 * Get a single VKM item by ID
	 */
	async getVKMItem(id: string): Promise<VKM> {
		return this.get<VKM>(`/vkm/${id}`);
	}

	/**
	 * Create a new VKM item
	 */
	async createVKMItem(item: VKMInput): Promise<VKM> {
		return this.post<VKM>("/vkm", item);
	}

	/**
	 * Update a VKM item
	 */
	async updateVKMItem(id: string | number, data: VKMInput): Promise<VKM> {
		return this.put<VKM>(`/vkm/${id}`, data);
	}

	/**
	 * Delete a VKM item
	 */
	async deleteVKMItem(id: string): Promise<void> {
		return this.delete<void>(`/vkm/${id}`);
	}
}

// Export singleton instance getter
export const getApiClient = () => ApiClient.getInstance();

// Export class for testing purposes
export default ApiClient;
