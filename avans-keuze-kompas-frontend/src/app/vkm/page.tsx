"use client";

import VKMList from "../Components/VKM/VKMList";
import { useAuth } from "../lib/auth/useAuth";
import LoginForm from "../Components/Auth/loginForm";
import { Header } from "../Components/layout/header/Header";

export default function HomePage() {
  const { isLoggedIn } = useAuth();

  return (
    <>
      <Header />
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">VKMs Dashboard</h1>
        {isLoggedIn ? <VKMList /> : <LoginForm />}
      </main>
    </>
  );
}
