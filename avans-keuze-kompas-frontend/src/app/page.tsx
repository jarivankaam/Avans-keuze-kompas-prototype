// app/page.tsx
import ItemsView from './Components/VKM/VKMItem';
import {Header} from "@/app/Components/layout/header/Header";

export default function Home() {
    return (
        <>
            <Header/>
            <main className="flex justify-center items-center m-10">
                <ItemsView/>
            </main>
        </>
    );
}
