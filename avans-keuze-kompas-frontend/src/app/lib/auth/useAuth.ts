// lib/auth/useAuth.ts
"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import {
  loginUser,
  getToken,
  setToken as saveToken,
  clearToken,
} from "./authClient";

type DecodedToken = {
  email: string;
  sub: string;
  is_admin?: boolean;
};

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const stored = getToken();
    if (stored) {
      setTokenState(stored);
      try {
        const decoded = jwtDecode<DecodedToken>(stored);
        setUser(decoded);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  async function login(email: string, password: string) {
    const { access_token } = await loginUser(email, password);
    saveToken(access_token);
    setTokenState(access_token);

    try {
      const decoded = jwtDecode<DecodedToken>(access_token);
      setUser(decoded);
    } catch (err) {
      console.error("Token decode failed:", err);
    }
  }

  function logout() {
    clearToken();
    setTokenState(null);
    setUser(null);
  }

  return { token, user, isLoggedIn: !!token, login, logout };
}
