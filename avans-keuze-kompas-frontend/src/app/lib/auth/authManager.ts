/**
 * AuthManager - Singleton Pattern
 * Centralized authentication management
 * Handles token storage, refresh, and authentication state
 */

import { getConfig } from "../config";
import { jwtDecode } from "jwt-decode";

export interface JWTPayload {
	email: string;
	id?: number;
	sub?: string;
	exp: number;
	iat: number;
	is_admin?: boolean;
}

export interface LoginResponse {
	token: string;
	user?: {
		id: number;
		email: string;
		name?: string;
	};
}

export interface AuthState {
	isAuthenticated: boolean;
	token: string | null;
	user: JWTPayload | null;
}

class AuthManager {
	private static instance: AuthManager;
	private config = getConfig();
	private token: string | null = null;
	private decodedToken: JWTPayload | null = null;
	private refreshTimer: NodeJS.Timeout | null = null;
	private authStateListeners: ((state: AuthState) => void)[] = [];

	/**
	 * Private constructor to prevent direct instantiation
	 * Use AuthManager.getInstance() instead
	 */
	private constructor() {
		// Initialize token from localStorage on creation (client-side only)
		if (typeof window !== "undefined") {
			this.loadTokenFromStorage();
		}
	}

	/**
	 * Get the singleton instance of AuthManager
	 */
	static getInstance(): AuthManager {
		if (!AuthManager.instance) {
			AuthManager.instance = new AuthManager();
		}
		return AuthManager.instance;
	}

	/**
	 * Load token from localStorage
	 */
	private loadTokenFromStorage(): void {
		if (typeof window === "undefined") return;

		const storedToken = localStorage.getItem(this.config.TOKEN_KEY);
		if (storedToken) {
			this.setToken(storedToken);
		}
	}

	/**
	 * Decode JWT token
	 */
	private decodeToken(token: string): JWTPayload | null {
		try {
			return jwtDecode<JWTPayload>(token);
		} catch (error) {
			console.error("Failed to decode token:", error);
			return null;
		}
	}

	/**
	 * Check if token is expired
	 */
	private isTokenExpired(decoded: JWTPayload): boolean {
		const now = Date.now() / 1000;
		return decoded.exp < now;
	}

	/**
	 * Check if token needs refresh (within threshold of expiry)
	 */
	private shouldRefreshToken(decoded: JWTPayload): boolean {
		const now = Date.now() / 1000;
		const timeUntilExpiry = decoded.exp - now;
		const thresholdSeconds = this.config.TOKEN_REFRESH_THRESHOLD * 60;
		return timeUntilExpiry < thresholdSeconds;
	}

	/**
	 * Set token and update state
	 */
	setToken(token: string): void {
		this.token = token;
		this.decodedToken = this.decodeToken(token);

		// Store in localStorage (client-side only)
		if (typeof window !== "undefined") {
			localStorage.setItem(this.config.TOKEN_KEY, token);
		}

		// Validate token
		if (this.decodedToken && this.isTokenExpired(this.decodedToken)) {
			this.clearToken();
			return;
		}

		// Notify listeners
		this.notifyAuthStateChange();

		// Setup auto-refresh if needed
		this.setupTokenRefresh();
	}

	/**
	 * Get current token
	 */
	getToken(): string | null {
		// Check if token is expired
		if (this.token && this.decodedToken && this.isTokenExpired(this.decodedToken)) {
			this.clearToken();
			return null;
		}
		return this.token;
	}

	/**
	 * Get decoded token payload
	 */
	getDecodedToken(): JWTPayload | null {
		return this.decodedToken;
	}

	/**
	 * Clear token and logout
	 */
	clearToken(): void {
		this.token = null;
		this.decodedToken = null;

		// Clear from localStorage
		if (typeof window !== "undefined") {
			localStorage.removeItem(this.config.TOKEN_KEY);
		}

		// Clear refresh timer
		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
			this.refreshTimer = null;
		}

		// Notify listeners
		this.notifyAuthStateChange();
	}

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		const token = this.getToken();
		return token !== null && this.decodedToken !== null;
	}

	/**
	 * Get current authentication state
	 */
	getAuthState(): AuthState {
		return {
			isAuthenticated: this.isAuthenticated(),
			token: this.token,
			user: this.decodedToken,
		};
	}

	/**
	 * Login user
	 */
	async login(email: string, password: string): Promise<LoginResponse> {
		try {
			const response = await fetch(this.config.getApiUrl("/auth/login"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
				credentials: "include",
			});

			if (!response.ok) {
				const error = await response.json().catch(() => ({ message: "Login failed" }));
				throw new Error(error.message || "Login failed");
			}

			const data: LoginResponse = await response.json();

			if (data.token) {
				this.setToken(data.token);
			}

			return data;
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	}

	/**
	 * Logout user
	 */
	logout(): void {
		this.clearToken();
		// Optionally call logout endpoint
		// await fetch(this.config.getApiUrl("/auth/logout"), { method: "POST" });
	}

	/**
	 * Setup automatic token refresh
	 */
	private setupTokenRefresh(): void {
		if (!this.decodedToken || typeof window === "undefined") return;

		// Clear existing timer
		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
		}

		// Calculate time until refresh needed
		const now = Date.now() / 1000;
		const timeUntilRefresh =
			(this.decodedToken.exp - now - this.config.TOKEN_REFRESH_THRESHOLD * 60) *
			1000;

		if (timeUntilRefresh > 0) {
			this.refreshTimer = setTimeout(() => {
				this.refreshToken();
			}, timeUntilRefresh);
		}
	}

	/**
	 * Refresh authentication token
	 * Note: This is a placeholder - implement based on your backend API
	 */
	private async refreshToken(): Promise<void> {
		try {
			// This endpoint might not exist yet - implement when backend supports it
			const response = await fetch(this.config.getApiUrl("/auth/refresh"), {
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.token}`,
				},
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				if (data.token) {
					this.setToken(data.token);
				}
			} else {
				// Refresh failed - logout user
				this.logout();
			}
		} catch (error) {
			console.error("Token refresh failed:", error);
			this.logout();
		}
	}

	/**
	 * Subscribe to auth state changes
	 */
	subscribe(listener: (state: AuthState) => void): () => void {
		this.authStateListeners.push(listener);

		// Return unsubscribe function
		return () => {
			this.authStateListeners = this.authStateListeners.filter(
				(l) => l !== listener,
			);
		};
	}

	/**
	 * Notify all listeners of auth state change
	 */
	private notifyAuthStateChange(): void {
		const state = this.getAuthState();
		for (const listener of this.authStateListeners) {
			listener(state);
		}
	}
}

// Export singleton instance getter
export const getAuthManager = () => AuthManager.getInstance();

// Export class for testing purposes
export default AuthManager;
