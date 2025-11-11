/**
 * API Functions - Refactored to use ApiClient Singleton
 * This file maintains backward compatibility while using the new ApiClient
 *
 * NOTE: New code should import and use getApiClient() directly from apiClient.ts
 * These functions are maintained for backward compatibility with existing code
 */

import { getApiClient } from "./apiClient";
import { getAuthManager } from "./auth/authManager";
import type { VKMInput } from "@/app/types/VKM";

// Initialize API client with auth token getter
const apiClient = getApiClient();
const authManager = getAuthManager();

// Set the token getter for the API client
apiClient.setTokenGetter(() => authManager.getToken());

/**
 * Get all VKM items
 * @deprecated Use getApiClient().getVKMItems() instead
 */
export async function getItems() {
	return apiClient.getVKMItems();
}

/**
 * Get a single VKM item by ID
 * @deprecated Use getApiClient().getVKMItem(id) instead
 */
export async function getItem(id: string) {
	return apiClient.getVKMItem(id);
}

/**
 * Create a new VKM item
 * @deprecated Use getApiClient().createVKMItem(item) instead
 */
export async function createItem(item: VKMInput) {
	return apiClient.createVKMItem(item);
}

/**
 * Update a VKM item
 * @deprecated Use getApiClient().updateVKMItem(id, data) instead
 */
export async function updateItem(id: string | number, data: VKMInput) {
	return apiClient.updateVKMItem(id, data);
}

/**
 * Delete a VKM item
 * @deprecated Use getApiClient().deleteVKMItem(id) instead
 */
export async function deleteItem(id: string) {
	return apiClient.deleteVKMItem(id);
}

// Export the API client and auth manager for direct use
export { apiClient, authManager };

// Re-export for convenience
export { getApiClient } from "./apiClient";
export { getAuthManager } from "./auth/authManager";

