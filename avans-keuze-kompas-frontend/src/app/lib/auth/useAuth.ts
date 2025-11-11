/**
 * useAuth Hook - Refactored to use AuthManager Singleton
 * Provides React state and effects for authentication
 * Syncs with AuthManager singleton for consistent auth state across the app
 */
"use client";

import { useEffect, useState } from "react";
import { getAuthManager, type JWTPayload, type AuthState } from "./authManager";

export function useAuth() {
  const authManager = getAuthManager();

  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Subscribe to auth state changes from AuthManager
  useEffect(() => {
    // Initial state
    const initialState = authManager.getAuthState();
    setTokenState(initialState.token);
    setUser(initialState.user);
    setIsLoggedIn(initialState.isAuthenticated);

    // Subscribe to changes
    const unsubscribe = authManager.subscribe((state: AuthState) => {
      setTokenState(state.token);
      setUser(state.user);
      setIsLoggedIn(state.isAuthenticated);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [authManager]);

  async function login(email: string, password: string) {
    try {
      const response = await authManager.login(email, password);

      // AuthManager automatically updates state, which will trigger our subscription
      // But we can also get the immediate state
      const state = authManager.getAuthState();
      setTokenState(state.token);
      setUser(state.user);
      setIsLoggedIn(state.isAuthenticated);

      return response;
    } catch (err) {
      throw err;
    }
  }

  function logout() {
    authManager.logout();
    // State will be updated via subscription
  }

  return {
    token,
    user,
    isLoggedIn,
    login,
    logout,
    // Expose auth manager for advanced usage
    authManager
  };
}
