// app/page.tsx
import LoginForm from "../Components/Auth/loginForm";
import ItemsView from "../Components/VKM/VKMItem";
import { Header } from "@/app/Components/layout/header/Header";

export default function Login() {
  return (
    <>
      <Header />
      <main className="flex justify-center items-center m-10">
        <LoginForm />
      </main>
    </>
  );
}
