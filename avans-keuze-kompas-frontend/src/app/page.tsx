// app/page.tsx
import HeroSection from "./Components/layout/header/Hero/Hero";
import ItemsView from "./Components/VKM/VKMItem";
import { Header } from "@/app/Components/layout/header/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col justify-center items-center m-10">
        <HeroSection
          heading="Een keuzemodule uitkiezen? Wij helpen je!"
          description=""
          imageSrc="/hero.png"
          imageAlt="Hero image"
          background="#c6002a"
        />
        <ItemsView />
      </main>
    </>
  );
}
