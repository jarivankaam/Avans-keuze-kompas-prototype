// components/LoginForm.tsx
"use client";

import { useState } from "react";
import { useAuth } from "../../lib/auth/useAuth";

export default function LoginForm() {
  const { login, isLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      alert("Logged in!");
    } catch (err) {
      alert("Login failed");
    }
  };

  if (isLoggedIn) return <p>Already logged in</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <input
        className="w-full border p-2"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        className="w-full border p-2"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded">
        Login
      </button>
    </form>
  );
}
