/**
 * AuthManager - Singleton Pattern
 * Centralized authentication management
 * Handles token storage, refresh, and authentication state
 */

import { getConfig } from "../config";
import { jwtDecode } from "jwt-decode";

export interface JWTPayload {
	username: string; // email address from backend
	sub: string; // MongoDB ObjectId from backend
	is_admin: boolean;
	exp: number;
	iat: number;
}

export interface LoginResponse {
	access_token: string;
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
		// On initialization, check if user is logged in via cookie
		if (typeof window !== "undefined") {
			this.initializeSession();
		}
	}

	/**
	 * Initialize session by checking if a valid cookie exists
	 */
	private async initializeSession(): Promise<void> {
		try {
			const response = await fetch(this.config.getApiUrl("/auth/me"), {
				credentials: "include", // Send the httpOnly cookie
			});

			if (response.ok) {
				const data = await response.json();
				// We have a valid session, but we need the token to decode
				// The backend should return the token or we reconstruct user info from the response
				// For now, we'll create a minimal user object from the /me response
				this.decodedToken = {
					username: data.email,
					sub: data.userId,
					is_admin: data.is_admin,
					exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // Assume 24h expiry
					iat: Math.floor(Date.now() / 1000),
				};
				this.notifyAuthStateChange();
			}
		            // No valid session, user needs to login
		        } catch (error) {
		            // No valid session, user needs to login
		        }	}

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
	 * @deprecated No longer used - tokens stored in memory only for security
	 */
	private loadTokenFromStorage(): void {
		// Intentionally empty - we no longer use localStorage for security reasons
		// The httpOnly cookie handles authentication, token in memory is for user info only
	}

	/**
	 * Decode JWT token
	 */
	private decodeToken(token: string): JWTPayload | null {
		try {
			return jwtDecode<JWTPayload>(token);
		} catch (error) {
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
	 * Note: Token is stored in memory only, not localStorage
	 * The httpOnly cookie handles actual authentication
	 */
	setToken(token: string): void {
		this.token = token;
		this.decodedToken = this.decodeToken(token);

		// We intentionally do NOT store in localStorage for security
		// The httpOnly cookie set by the backend handles authentication
		// This token is kept in memory only to decode user information

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

		// We no longer use localStorage, so nothing to clear there
		// The httpOnly cookie will be cleared by calling the logout endpoint

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
	 * Works with both token (in memory) and cookie-based auth
	 */
	isAuthenticated(): boolean {
		// User is authenticated if we have decoded token data
		// This works for both cookie-based auth and token-based auth
		return this.decodedToken !== null;
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

			if (data.access_token) {
				this.setToken(data.access_token);
			}

			return data;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Logout user
	 */
	async logout(): Promise<void> {
		this.clearToken();
		// Call logout endpoint to clear httpOnly cookie
		try {
			await fetch(this.config.getApiUrl("/auth/logout"), {
				method: "POST",
				credentials: "include" // Important: send the cookie to be cleared
			});
		} catch (error) {
			// Continue with local logout even if endpoint fails
		}
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
				if (data.access_token) {
					this.setToken(data.access_token);
				}
			} else {
				// Refresh failed - logout user
				this.logout();
			}
		} catch (error) {
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
