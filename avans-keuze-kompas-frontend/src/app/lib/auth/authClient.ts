/**
 * Auth Client - Refactored to use AuthManager Singleton
 * This file maintains backward compatibility while using the new AuthManager
 *
 * NOTE: New code should import and use getAuthManager() directly from authManager.ts
 * These functions are maintained for backward compatibility with existing code
 */

import { getAuthManager } from "./authManager";

// Get the singleton instance
const authManager = getAuthManager();

/**
 * Get authentication token
 * @deprecated Use getAuthManager().getToken() instead
 */
export function getToken(): string | null {
	return authManager.getToken();
}

/**
 * Set authentication token
 * @deprecated Use getAuthManager().setToken(token) instead
 */
export function setToken(token: string): void {
	authManager.setToken(token);
}

/**
 * Clear authentication token (logout)
 * @deprecated Use getAuthManager().logout() instead
 */
export function clearToken(): void {
	authManager.clearToken();
}

/**
 * Login user with email and password
 * @deprecated Use getAuthManager().login(email, password) instead
 */
export async function loginUser(email: string, password: string) {
	return authManager.login(email, password);
}

// Re-export the AuthManager for convenience
export { getAuthManager } from "./authManager";
export type { JWTPayload, LoginResponse, AuthState } from "./authManager";
